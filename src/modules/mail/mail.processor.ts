import { MailerService } from '@nestjs-modules/mailer';
import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { SendMail } from './dto/send-mail.dto';

@Processor('email')
export class EmailProcessor {
  constructor(private readonly mailService: MailerService) {}

  @OnQueueFailed()
  handler(job: Job, error: Error) {
    console.log(job)
    console.log(error)
    console.log('fired exception');
  }
  
  @Process('register-user')
  async sendRegisterEmail(job: Job<SendMail>) {
    const { data } = job;
    // send the welcome email here
    await this.mailService.sendMail({
      to: data.data.email,
      subject: 'Welcome to Nice App! Confirm your Email',
      template: './confirmation',
      context: {
        name: data.data.username,
        code: data.data.otpCode
      },
    });
  }

  @Process('forgot-password-token')
  async forgotPassword(job: Job<SendMail>) {
    const { data } = job;
    // send forgot password token here
    await this.mailService.sendMail({
      to: data.data.email,
      subject: 'Welcome to Nice App! Link forgot password',
      template: './forgot-password-token',
      context: {
        url: data.data.resetUrl
      }
    })
  }

  @Process('reset-password-token')
  async resetPassword(job: Job<SendMail>) {
    const { data } = job;
    // send confirm reset password token here
    await this.mailService.sendMail({
      to: data.data.email,
      subject: 'Welcome to Nice App! Password Reset Confirm',
      template: './reset-password-token',
      context: {}
    })
  }
}