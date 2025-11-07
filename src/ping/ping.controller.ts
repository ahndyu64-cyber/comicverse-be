import { Controller, Get } from '@nestjs/common';

@Controller('ping')
export class PingController {
  @Get()
  ping() {
    return { status: 'ok', time: new Date().toISOString() };
  }
}
