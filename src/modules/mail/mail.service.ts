import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { SendMail } from './dto/send-mail.dto';

@Injectable()
export class MailService {
  constructor(
    @InjectQueue('email') private readonly emailQueue: Queue,
  ) {}

  async sendRegisterEmail(data: SendMail) {
    const job = await this.emailQueue.add('register-user', { data });
    return { jobId: job.id };
  }
}
