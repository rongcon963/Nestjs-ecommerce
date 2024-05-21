import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}
  
  getHello(): string {
    var a = 1;
    var b = 2;
    var c = a + b;
    console.log(c)
    return 'Hello World!';
  }

  getEnvironmentVariable(key: string): string {
    return this.configService.get<string>(key);
  }
}
