import { Controller, Get, Render, Res } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @Get()
  // getHello(): string {
  //   return this.appService.getHello();
  // }

  @Get()
  getIndex(@Res() res) {
    const public_key = this.appService.getEnvironmentVariable('STRIPE_PUBLIC_KEY');
    return res.render(
      'index',
      { public_key },
    );
  }
}
