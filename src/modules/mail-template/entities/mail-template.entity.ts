import { MailTemplateStatus } from "src/shared/enums/mail-template.enum";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('mail_template')
export class MailTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  name: string;

  @Column()
  locale: string;

  @Column()
  content: string;

  @Column({
    type: "enum",
    enum: MailTemplateStatus,
    default: MailTemplateStatus.ENABLED
  })
  status: MailTemplateStatus;
}
