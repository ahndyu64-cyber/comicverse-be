import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, BadRequestException, Query, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CloudinaryService } from './cloudinary.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/image\/(png|jpg|jpeg|gif|webp)/)) {
          return cb(new BadRequestException('Only PNG/JPG/GIF/WebP images are allowed') as any, false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async uploadFile(@UploadedFile() file: any, @Query('type') type: string = 'cover', @Res() res: Response) {
    try {
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const result = type === 'chapter' 
        ? await this.cloudinaryService.uploadChapterImage(file)
        : await this.cloudinaryService.uploadCoverImage(file);

      return res.status(200).json({
        url: result.url,
        public_id: result.public_id,
      });
    } catch (error: any) {
      console.error('[Upload] Error:', error);
      return res.status(500).json({
        error: 'Upload failed',
        message: error.message,
        details: error.response?.error?.message || error.message,
      });
    }
  }
}


