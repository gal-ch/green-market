import { forwardRef, Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { AccountModule } from '../account/account.module'; // Import AccountModule
import { Order } from 'order/entities/order.entity';
import { OrderController } from 'order/order.controller';
import { OrderModule } from 'order/order.module';
import { MailModule } from 'mail/mail.module';
import { AccountService } from 'account/account.service';
import { OrderService } from 'order/order.service';
import { MailService } from 'mail/mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Store, Order]),
    AccountModule,
    OrderModule,
    MailModule
  ],
  controllers: [StoreController],
  providers: [StoreService],
  exports: [StoreService],
})
export class StoreModule {}
