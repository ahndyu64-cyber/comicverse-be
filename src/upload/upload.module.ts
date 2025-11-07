import { Module } from '@nestjs/common';
import { UploadController } from './';

@Module({
  controllers: [UploadController],
})
export class UploadModule {}
