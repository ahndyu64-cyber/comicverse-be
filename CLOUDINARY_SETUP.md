# Hướng dẫn tích hợp Cloudinary

## Giới thiệu
Hệ thống Comic Verse đã được cấu hình để lưu trữ các ảnh (bìa truyện và ảnh chapter) trên **Cloudinary** - một dịch vụ lưu trữ ảnh đáng tin cậy trong cloud.

## Cấu hình Cloudinary

### 1. Đăng ký Cloudinary
- Truy cập https://cloudinary.com/
- Đăng ký tài khoản miễn phí
- Điều hướng đến trang Dashboard

### 2. Lấy thông tin API
Trên Dashboard Cloudinary, bạn sẽ tìm thấy:
- **Cloud Name**: Tên cloud của bạn
- **API Key**: Khóa API
- **API Secret**: Bí mật API

### 3. Cấu hình biến môi trường
Cập nhật file `.env` trong thư mục gốc:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Cách sử dụng

### Upload ảnh bìa truyện
**Endpoint**: `POST /upload`

**Query parameter**: 
- `type=cover` (mặc định)

**Request**:
```bash
curl -X POST http://localhost:3000/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@path/to/cover.jpg"
```

**Response**:
```json
{
  "url": "https://res.cloudinary.com/.../image.jpg",
  "public_id": "comicverse/covers/xyz123"
}
```

### Upload ảnh chapter
**Endpoint**: `POST /upload`

**Query parameter**: 
- `type=chapter`

**Request**:
```bash
curl -X POST http://localhost:3000/upload?type=chapter \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@path/to/chapter-page.jpg"
```

**Response**:
```json
{
  "url": "https://res.cloudinary.com/.../image.jpg",
  "public_id": "comicverse/chapters/abc456"
}
```

## Cấu trúc lưu trữ trong Cloudinary

Các ảnh được tổ chức thành các thư mục:
- **`comicverse/covers/`**: Lưu trữ ảnh bìa truyện
- **`comicverse/chapters/`**: Lưu trữ ảnh các chapter

## Cơ sở dữ liệu

### Comic Schema
```typescript
{
  title: string,
  cover: string,              // URL từ Cloudinary
  coverPublicId: string,      // Public ID để xóa sau này
  description: string,
  authors: string[],
  genres: string[],
  chapters: Chapter[]
}
```

### Chapter Schema
```typescript
{
  title: string,
  images: string[],           // URLs từ Cloudinary
  imagePublicIds: string[],   // Public IDs để xóa sau này
  isDraft: boolean
}
```

## Xóa ảnh

Khi xóa một truyện hoặc chapter, hệ thống sẽ tự động:
1. Xóa record từ cơ sở dữ liệu
2. Xóa tất cả các ảnh liên quan từ Cloudinary

Không cần thao tác thủ công gì thêm.

## Tính năng Cloudinary

### Tối ưu hóa ảnh
- Tự động nén ảnh với chất lượng tốt (`quality: 'auto:good'`)
- Hỗ trợ các định dạng: JPG, PNG, GIF, WebP

### Giới hạn upload
- Kích thước tối đa: **5MB** per file
- Định dạng chấp nhận: PNG, JPG, JPEG, GIF, WebP

### Tính bảo mật
- API Secret không được expose ở client-side
- Upload được bảo vệ bằng JWT authentication

## Lưu ý quan trọng

1. **Không lưu ảnh cục bộ**: Folder `/uploads` không còn được sử dụng
2. **URL Cloudinary bền vững**: Các URL từ Cloudinary là bền vững và có thể được lưu trực tiếp vào database
3. **Quản lý chi phí**: Cloudinary cung cấp free tier với dung lượng hợp lý. Kiểm tra giới hạn của bạn

## Troubleshooting

### Lỗi: "CLOUDINARY_CLOUD_NAME không được định nghĩa"
- Kiểm tra file `.env` có các biến Cloudinary
- Khởi động lại ứng dụng sau khi thay đổi `.env`

### Lỗi: "Upload failed: Invalid credentials"
- Kiểm tra `CLOUDINARY_API_KEY` và `CLOUDINARY_API_SECRET`
- Đảm bảo không có khoảng trắng hoặc ký tự đặc biệt

### Ảnh tải lên nhưng không hiển thị
- Kiểm tra URL trong response có hợp lệ
- Kiểm tra CORS settings trên Cloudinary (nếu cần)
- Đảm bảo ảnh không bị set thành private
