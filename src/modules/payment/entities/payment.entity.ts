import { PaymentStatus } from "src/shared/enums/payment.enum";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  status: PaymentStatus;

  @Column({ nullable: true })
  payment_intent_id: string;

  @Column({ nullable: true })
  amount: number;

  @Column({ nullable: true })
  client_secret: string;
}
