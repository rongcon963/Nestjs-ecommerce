import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MailTemplateService } from './mail-template.service';
import { CreateMailTemplateDto } from './dto/create-mail-template.dto';
import { UpdateMailTemplateDto } from './dto/update-mail-template.dto';

@Controller('mail-template')
export class MailTemplateController {
  constructor(private readonly mailTemplateService: MailTemplateService) {}

  
}
