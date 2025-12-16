# Quick Start - Cloudinary Integration

## 1. Thiết lập Cloudinary

```bash
cp .env.example .env
```

Sau đó edit `.env` và thêm:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 2. Cài đặt dependencies (nếu chưa có)

```bash
npm install cloudinary
```

Dependencies cần thiết đã có:
- ✅ `cloudinary` ^2.8.0
- ✅ `@nestjs/config` (for environment variables)
- ✅ `@nestjs/platform-express` (for file upload)

## 3. API Endpoints

### Upload ảnh bìa
```bash
POST /upload
Header: Authorization: Bearer {JWT_TOKEN}
Body: form-data
  - file: <image_file>
  - type: cover (or omit, mặc định là cover)

Response:
{
  "url": "https://res.cloudinary.com/.../image.jpg",
  "public_id": "comicverse/covers/xyz"
}
```

### Upload ảnh chapter
```bash
POST /upload?type=chapter
Header: Authorization: Bearer {JWT_TOKEN}
Body: form-data
  - file: <image_file>

Response:
{
  "url": "https://res.cloudinary.com/.../image.jpg",
  "public_id": "comicverse/chapters/abc"
}
```

## 4. Tạo Comic với cover

```bash
POST /comics
Header: Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "title": "Comic Title",
  "description": "Description",
  "cover": "https://res.cloudinary.com/.../image.jpg",
  "coverPublicId": "comicverse/covers/xyz",
  "authors": ["Author"],
  "genres": ["Action", "Adventure"]
}
```

## 5. Tạo Chapter với ảnh

```bash
POST /comics/:id/chapters
Header: Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "title": "Chapter 1",
  "images": [
    "https://res.cloudinary.com/.../page1.jpg",
    "https://res.cloudinary.com/.../page2.jpg"
  ],
  "imagePublicIds": [
    "comicverse/chapters/page1_xyz",
    "comicverse/chapters/page2_abc"
  ]
}
```

## 6. Xóa Comic / Chapter

Xóa tự động sẽ:
- ✅ Xóa record từ MongoDB
- ✅ Xóa ảnh cover từ Cloudinary
- ✅ Xóa tất cả ảnh chapter từ Cloudinary

## Tính năng

✅ Tự động nén ảnh (quality: auto:good)  
✅ Hỗ trợ JPG, PNG, GIF, WebP  
✅ Giới hạn: 5MB per file  
✅ Tự động xóa ảnh khi xóa comic/chapter  
✅ Bảo mật: JWT authentication required  
✅ Phân loại thư mục: covers/ và chapters/  

## Cấu trúc Files

```
src/upload/
├── cloudinary.service.ts      # Service chính
├── upload.controller.ts        # Upload endpoint
└── upload.module.ts            # Module config

src/comics/
├── comics.service.ts           # Integrated with Cloudinary
├── comics.module.ts            # Imports UploadModule
├── schemas/
│   ├── comic.schema.ts        # Added coverPublicId
│   └── chapter.schema.ts      # Added imagePublicIds
└── dto/
    ├── create-comic.dto.ts    # Added coverPublicId
    └── create-chapter.dto.ts  # Added imagePublicIds
```

## Tài liệu thêm

Xem file `CLOUDINARY_SETUP.md` cho thông tin chi tiết hơn.
