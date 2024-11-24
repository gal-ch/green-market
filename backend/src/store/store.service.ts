import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { AccountService } from 'account/account.service';
import { Order } from 'order/entities/order.entity';
import { OrderService } from 'order/order.service';
import { MailService } from 'mail/mail.service';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
    private readonly accountService: AccountService,
    private readonly ordersService: OrderService,
    private readonly mailService: MailService,
  ) {}

  async create(storeDto: CreateStoreDto): Promise<Store> {
    const account = await this.accountService.findOne(1);
    const store = this.storeRepository.create({
      ...storeDto,
      account,
    });
    return this.storeRepository.save(store);
  }

  async findAll(): Promise<Store[]> {
    return this.storeRepository.find();
  }

  async findAllActive(): Promise<Store[]> {
    return this.storeRepository.findBy({ status: true });
  }

  async getStoresOfOpenedOrders(accountId: number): Promise<Store[]> {
    const storesWithActiveOrders = await this.storeRepository
      .createQueryBuilder('store')
      .leftJoin('store.orders', 'order')
      .where('order.open = :open AND order.accountId = :accountId', {
        open: true,
        accountId,
      })
      .distinct(true)
      .getMany();

    return storesWithActiveOrders;
  }

  async findOne(id: number): Promise<Store> {
    const store = await this.storeRepository.findOneBy({ id });
    if (!store) throw new NotFoundException(`Store with id ${id} not found`);
    return store;
  }

  async remove(id: number): Promise<void> {
    await this.storeRepository.delete(id);
  }

  async update(id: number, updateStoreDto: CreateStoreDto): Promise<Store> {
    const store = await this.findOne(id);
    Object.assign(store, updateStoreDto);
    return this.storeRepository.save(store);
  }

  async closeStoreEndOfDayAndSendEmail(distributionPoints: number[], req) {
    try {
      const account = await this.accountService.findOne(req.accountId || 1);
      const stores = await this.storeRepository.find({
        where: {
          id: In(distributionPoints),
          account: {
            id: account.id, // Ensure account ID is correctly referenced
          },
        },
      });
      await Promise.all(
        stores.map(async (store) => {
          const filters = { distributionPoints: [store.id] };
          const orders = await this.ordersService.findAll({
            storeId: store.id,
            accountId: account.id,
          });
          console.log(orders);

          const filterOpenOrders = orders?.filter((order) => {
            return order.open;
          });
          console.log(filterOpenOrders, 'filterOpenOrders');

          const startDate = new Date(
            Math.min(
              ...filterOpenOrders?.map((order) =>
                new Date(order.createAt).getTime(),
              ),
            ),
          )?.toISOString();
          const endDate = new Date(
            Math.max(
              ...filterOpenOrders?.map((order) =>
                new Date(order.createAt).getTime(),
              ),
            ),
          )?.toISOString();

          const report = await this.ordersService.getAllOrderByStore(
            startDate,
            endDate,
            filters,
          );
          const tableReportExcel = await this.ordersService.exportReport(
            startDate,
            endDate,
            filters,
            1,
            store.id,
          );

          await this.mailService.sendOrderConfirmation({
            account,
            email: account.email,
            subject: `${store.name} Product Summary`,
            template: 'store-report',
            context: {
              storeName: store.name,
              startDate: new Date(startDate).toLocaleDateString(),
              endDate: new Date(endDate).toLocaleDateString(),
              report,
            },
            attachments: tableReportExcel,
          });
        }),
      );

      this.ordersService.setAsCompleted(distributionPoints, req);
    } catch (e) {
      console.error('Error closing store and sending emails:', e);
    }
  }

  generateOrderTableHtml(report: Order[]): string {
    const header = `
      <thead>
        <tr>
          <th>Product</th>
          <th>Amount</th>
          <th>Price</th>
        </tr>
      </thead>
    `;

    const rows = report
      .map(
        (item) => `
        <tr>


        </tr>
      `,
      )
      .join('');

    return `
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        ${header}
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  }
}
