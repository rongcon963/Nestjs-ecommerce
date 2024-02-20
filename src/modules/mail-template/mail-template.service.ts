import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as Handlebars from 'handlebars';
import { Repository } from 'typeorm';
import { MailTemplate } from './entities/mail-template.entity';

@Injectable()
export class MailTemplateService {
  constructor(
    @InjectRepository(MailTemplate)
    private mailTemplateRepository: Repository<MailTemplate>,
  ) {}

  async getAllTemplates(): Promise<MailTemplate[]> {
    return await this.mailTemplateRepository.find();
  }

  async renderTemplate(template: MailTemplate, context: any): Promise<string> {
    // Use Handlebars to render the template with context
    const compiledTemplate = Handlebars.compile(template.content);
    return compiledTemplate(context);
  }

  async updateTemplate(template: MailTemplate): Promise<MailTemplate> {
    await this.mailTemplateRepository.save(template);
    return template;
  }
}
