import { PaymentStatus } from "../../../shared/enums/payment.enum";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "enum",
    enum: PaymentStatus,
    default: PaymentStatus.CREATED
  })
  status: PaymentStatus;

  @Column({ nullable: true })
  payment_intent_id: string;

  @Column({ nullable: true })
  amount: number;

  @Column({ nullable: true })
  client_secret: string;
}
