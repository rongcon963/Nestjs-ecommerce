import { Module, OnModuleInit } from '@nestjs/common';
import { MailTemplateService } from './mail-template.service';
import { MailTemplateController } from './mail-template.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { MailTemplate } from './entities/mail-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MailTemplate])],
  controllers: [MailTemplateController],
  providers: [MailTemplateService],
})
export class MailTemplateModule implements OnModuleInit{
  constructor(private mailTemplateService: MailTemplateService) {}

  async onModuleInit() {
    // Load all templates from the database
    const templates = await this.mailTemplateService.getAllTemplates();

    // Render each template to an `.hbs` file
    for (const template of templates) {
      const content = await this.mailTemplateService.renderTemplate(template, {}); // Replace with your context
      const filePath = path.join(process.cwd(), `./src/modules/mail-template/templates/${template.name}.hbs`);
      await fs.promises.writeFile(filePath, content);
    }
  }
  
}
