import { OrderStatus } from "src/shared/enums/order.enum";

export class CreateOrderDto {
  total_price: number;
  sub_total: number;
  status: OrderStatus;
}
