import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    console.log('[Cloudinary] Initializing with cloud_name:', cloudName);

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('[Cloudinary] Missing credentials:', {
        cloudName: !!cloudName,
        apiKey: !!apiKey,
        apiSecret: !!apiSecret,
      });
      throw new InternalServerErrorException('Cloudinary configuration missing');
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    console.log('[Cloudinary] Initialized successfully');
  }

  async uploadCoverImage(file: UploadedFile): Promise<{ url: string; public_id: string }> {
    console.log('[Cloudinary] uploadCoverImage:', file.originalname);
    return this.uploadToCloudinary(file, 'comicverse/covers');
  }

  async uploadChapterImage(file: UploadedFile): Promise<{ url: string; public_id: string }> {
    console.log('[Cloudinary] uploadChapterImage:', file.originalname);
    return this.uploadToCloudinary(file, 'comicverse/chapters');
  }

  async uploadToCloudinary(
    file: UploadedFile,
    folder: string,
  ): Promise<{ url: string; public_id: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    console.log(`[Cloudinary] Uploading to folder: ${folder}, file: ${file.originalname}`);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto',
          allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
          max_bytes: 5 * 1024 * 1024, // 5MB
          quality: 'auto:good',
        },
        (error: any, result: any) => {
          if (error) {
            console.error('[Cloudinary] Upload error:', error);
            return reject(new BadRequestException(`Upload failed: ${error.message}`));
          }
          if (!result) {
            console.error('[Cloudinary] No result returned');
            return reject(new BadRequestException('Upload failed: No result returned'));
          }

          console.log('[Cloudinary] Upload success:', result.public_id);
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
          });
        },
      );

      uploadStream.on('error', (error: any) => {
        console.error('[Cloudinary] Stream error:', error);
        reject(new InternalServerErrorException(`Stream error: ${error.message}`));
      });

      uploadStream.end(file.buffer);
    });
  }

  async deleteImage(public_id: string): Promise<void> {
    try {
      console.log('[Cloudinary] Deleting image:', public_id);
      await cloudinary.uploader.destroy(public_id);
      console.log('[Cloudinary] Image deleted successfully:', public_id);
    } catch (error: any) {
      console.error('[Cloudinary] Error deleting image:', error);
      throw new BadRequestException(`Failed to delete image: ${error.message}`);
    }
  }

  async deleteMultipleImages(public_ids: string[]): Promise<void> {
    if (!public_ids || public_ids.length === 0) return;

    try {
      console.log('[Cloudinary] Deleting multiple images:', public_ids);
      await Promise.all(public_ids.map((id) => cloudinary.uploader.destroy(id)));
      console.log('[Cloudinary] Images deleted successfully');
    } catch (error: any) {
      console.error('[Cloudinary] Error deleting images:', error);
      throw new BadRequestException(`Failed to delete images: ${error.message}`);
    }
  }
}
