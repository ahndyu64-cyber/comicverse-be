import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('upload')
export class UploadController {
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (req, file, cb) => {
          const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          const fileExtName = extname(file.originalname);
          cb(null, `${name}${fileExtName}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/image\/(png|jpg|jpeg)/)) {
          return cb(new BadRequestException('Only PNG/JPG images are allowed') as any, false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  uploadFile(@UploadedFile() file: any) {
    if (!file) throw new BadRequestException('No file uploaded');
    // return a public URL path. Ensure main.ts serves /uploads static
    const url = `${process.env.BASE_URL || ''}/uploads/${file.filename}`;
    return { url, filename: file.filename };
  }
}
