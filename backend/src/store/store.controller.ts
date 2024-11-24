import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Req,
} from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { Store } from './entities/store.entity';
import { log } from 'console';

@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  create(@Body() store: Store): Promise<Store> {
    return this.storeService.create(store);
  }

  @Get()
  findAll(): Promise<Store[]> {
    return this.storeService.findAll();
  }

  @Get('findAllActive')
  findAllActive(): Promise<Store[]> {
    return this.storeService.findAllActive();
  }

  @Get('getStoresOfOpenedOrders')
  async getStoresOfOpenedOrders(req: any): Promise<Store[]> {
    const accountId = req?.accountId;
    return await this.storeService.getStoresOfOpenedOrders(1);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Store> {
    return this.storeService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.storeService.remove(+id);
  }

  @Put(':id')
  async updateStore(
    @Param('id') id: number,
    @Body() updateStoreDto: CreateStoreDto,
  ): Promise<Store> {
    return this.storeService.update(id, updateStoreDto);
  }

  @Post('closeStoreEndOfDayAndSendEmail')
  async closeStoreEndOfDayAndSendEmail(
    @Body() storesId: number[],
    @Req() req: any,
  ) {
    return this.storeService.closeStoreEndOfDayAndSendEmail(storesId, req);
  }
}
