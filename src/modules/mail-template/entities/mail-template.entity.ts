import { MailTemplateStatus } from "src/shared/enums/mail-template.enum";
import { AfterUpdate, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { MailTemplateService } from "../mail-template.service";
import * as fs from 'fs';
import * as path from 'path';

@Entity('mail_template')
export class MailTemplate {
  constructor(private readonly mailTemplateService: MailTemplateService) {}

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

  @Column()
  status: MailTemplateStatus;

  @AfterUpdate()
  async beforeUpdate() {
    // Render the updated template data
    const content = await this.mailTemplateService.renderTemplate(this, {});

    // Update the .hbs file
    const filePath = path.join(process.cwd(), `./src/modules/mail-template/templates/${this.name}.hbs`);
    await fs.promises.writeFile(filePath, content);
  }
}
