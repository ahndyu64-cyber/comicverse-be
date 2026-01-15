"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cloudinary_1 = require("cloudinary");
let CloudinaryService = class CloudinaryService {
    constructor(configService) {
        this.configService = configService;
        const cloudName = this.configService.get('CLOUDINARY_CLOUD_NAME');
        const apiKey = this.configService.get('CLOUDINARY_API_KEY');
        const apiSecret = this.configService.get('CLOUDINARY_API_SECRET');
        console.log('[Cloudinary] Initializing with cloud_name:', cloudName);
        if (!cloudName || !apiKey || !apiSecret) {
            console.error('[Cloudinary] Missing credentials:', {
                cloudName: !!cloudName,
                apiKey: !!apiKey,
                apiSecret: !!apiSecret,
            });
            throw new common_1.InternalServerErrorException('Cloudinary configuration missing');
        }
        cloudinary_1.v2.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
        });
        console.log('[Cloudinary] Initialized successfully');
    }
    async uploadCoverImage(file) {
        console.log('[Cloudinary] uploadCoverImage:', file.originalname);
        return this.uploadToCloudinary(file, 'comicverse/covers');
    }
    async uploadChapterImage(file) {
        console.log('[Cloudinary] uploadChapterImage:', file.originalname);
        return this.uploadToCloudinary(file, 'comicverse/chapters');
    }
    async uploadToCloudinary(file, folder) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        console.log(`[Cloudinary] Uploading to folder: ${folder}, file: ${file.originalname}`);
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                folder: folder,
                resource_type: 'auto',
                allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
                max_bytes: 5 * 1024 * 1024,
                quality: 'auto:good',
            }, (error, result) => {
                if (error) {
                    console.error('[Cloudinary] Upload error:', error);
                    return reject(new common_1.BadRequestException(`Upload failed: ${error.message}`));
                }
                if (!result) {
                    console.error('[Cloudinary] No result returned');
                    return reject(new common_1.BadRequestException('Upload failed: No result returned'));
                }
                console.log('[Cloudinary] Upload success:', result.public_id);
                resolve({
                    url: result.secure_url,
                    public_id: result.public_id,
                });
            });
            uploadStream.on('error', (error) => {
                console.error('[Cloudinary] Stream error:', error);
                reject(new common_1.InternalServerErrorException(`Stream error: ${error.message}`));
            });
            uploadStream.end(file.buffer);
        });
    }
    async deleteImage(public_id) {
        try {
            console.log('[Cloudinary] Deleting image:', public_id);
            await cloudinary_1.v2.uploader.destroy(public_id);
            console.log('[Cloudinary] Image deleted successfully:', public_id);
        }
        catch (error) {
            console.error('[Cloudinary] Error deleting image:', error);
            throw new common_1.BadRequestException(`Failed to delete image: ${error.message}`);
        }
    }
    async deleteMultipleImages(public_ids) {
        if (!public_ids || public_ids.length === 0)
            return;
        try {
            console.log('[Cloudinary] Deleting multiple images:', public_ids);
            await Promise.all(public_ids.map((id) => cloudinary_1.v2.uploader.destroy(id)));
            console.log('[Cloudinary] Images deleted successfully');
        }
        catch (error) {
            console.error('[Cloudinary] Error deleting images:', error);
            throw new common_1.BadRequestException(`Failed to delete images: ${error.message}`);
        }
    }
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CloudinaryService);
