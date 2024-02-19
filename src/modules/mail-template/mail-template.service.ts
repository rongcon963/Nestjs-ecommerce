import { Injectable } from '@nestjs/common';
import { CreateMailTemplateDto } from './dto/create-mail-template.dto';
import { UpdateMailTemplateDto } from './dto/update-mail-template.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MailTemplate } from './entities/mail-template.entity';
import { Repository } from 'typeorm';
import * as Handlebars from 'handlebars';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class MailTemplateService {
  public templateSubjects = new BehaviorSubject<Map<string, string>>({} as any);
  
  constructor(
    @InjectRepository(MailTemplate)
    private mailTemplateRepository: Repository<MailTemplate>,
  ) {}

  // async getAllTemplates() {
  //   return await this.mailTemplateRepository.find();
  // }

  // async getTemplateById(id: number) {
  //   return await this.mailTemplateRepository.findOneBy({ id });
  // }

  // async getTemplateByName(name: string) {
  //   return await this.mailTemplateRepository.findOneBy({ name });
  // }

  // async renderTemplate(template: MailTemplate, context: any) {
  //   const compiledTemplate = Handlebars.compile(template.content);
  //   return compiledTemplate(context);
  // }

  async getAllTemplates(): Promise<MailTemplate[]> {
    return await this.mailTemplateRepository.find();
  }

  async renderTemplate(template: MailTemplate, context: any): Promise<string> {
    // Use Handlebars to render the template with context
    const hbs = require('handlebars');
    const compiledTemplate = hbs.compile(template.content);
    return compiledTemplate(context);
  }

  async updateTemplate(template: MailTemplate): Promise<MailTemplate> {
    await this.mailTemplateRepository.save(template);
    return template;
  }
}
