import { Module } from '@nestjs/common';
import { UploadController } from './';
import { CloudinaryService } from './cloudinary.service';

@Module({
  controllers: [UploadController],
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class UploadModule {}
