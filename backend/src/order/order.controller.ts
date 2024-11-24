import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('create')
  async create(@Body() {orderDetails, cardDetails}, req: any) {
    console.log('fdsfadsfdsfsadfsfsf');
    console.log(cardDetails);
    
    return await this.orderService.create(orderDetails,cardDetails, req);
  }

  @Get()
  findAll() {
    return this.orderService.findAll({});
  }

  @Post('getAllOrderByStore')
  async getAllOrderByStore(
    @Body()
    {
      startDate,
      endDate,
      filters,
    }: {
      startDate: string;
      endDate: string;
      filters: Record<string, number[]>;
    },
  ) {    
    console.log('fdsfdsafdasfdsafas');
    
    return this.orderService.getAllOrderByStore(startDate, endDate, filters);
  }

  @Post('exportReport')
  async exportReport(
    @Body()
    {
      storeId,
      startDate,
      endDate,
      filters,
    }: {
      storeId?: number;
      startDate: string;
      endDate: string;
      filters: Record<string, number[]>;
    },
    @Req() req: Request,
  ) {
    return this.orderService.exportReport(
      startDate,
      endDate,
      filters,
      1,
      +storeId,
    );
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
  //   return this.orderService.update(+id, updateOrderDto);
  // }
}
