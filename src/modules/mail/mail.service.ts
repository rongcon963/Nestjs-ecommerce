import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { CreateMailDto } from './dto/create-mail.dto';
import { UpdateMailDto } from './dto/update-mail.dto';
import { generateOTP } from 'src/shared/common/codeGenerator';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { SendMail } from './dto/send-mail.dto';

@Injectable()
export class MailService {
  constructor(
    @InjectQueue('email') private readonly emailQueue: Queue,
    private mailerService: MailerService,
  ) {}

  async sendRegisterEmail(data: SendMail) {
    const job = await this.emailQueue.add('register-user', { data });
    return { jobId: job.id };
  }
  
  // async sendUserConfirmation(user: User) {
  //   const otpCode = generateOTP(6);
  //   await this.mailerService.sendMail({
  //     to: user.email,
  //     // from: '"Support Team" <support@example.com>', // override default from
  //     subject: 'Welcome to Nice App! Confirm your Email',
  //     template: './confirmation', // `.hbs` extension is appended automatically
  //     context: { // ✏️ filling curly brackets with content
  //       name: user.username,
  //       code: otpCode,
  //     },
  //   });
  // }
}
