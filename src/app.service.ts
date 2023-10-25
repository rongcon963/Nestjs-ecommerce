import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    var a = 1;
    var b = 2;
    var c = a + b;
    console.log(c)
    return 'Hello World!';
  }
}
