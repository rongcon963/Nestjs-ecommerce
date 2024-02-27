import { Controller } from '@nestjs/common';
import { MailTemplateService } from './mail-template.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('mail-template')
@Controller('mail-template')
export class MailTemplateController {
  constructor(private readonly mailTemplateService: MailTemplateService) {}

  
}
