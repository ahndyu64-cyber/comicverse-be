# ComicVerse Backend

NestJS backend API cho ứng dụng quản lý và đọc truyện tranh (Comic) trực tuyến.

## 🚀 Tính năng chính

- **Quản lý truyện**: CRUD operations cho truyện, chapter, và ảnh
- **Authentication**: JWT-based authentication với Google OAuth support
- **Image Upload**: Tích hợp Cloudinary để lưu trữ ảnh bìa và ảnh chapter
- **Comments**: Hỗ trợ bình luận flat và nested comments
- **Categories & Genres**: Phân loại truyện
- **Admin Panel**: Quản lý admin và moderator
- **MongoDB**: Lưu trữ dữ liệu với Mongoose ODM

## 📋 Yêu cầu

- Node.js >= 16
- MongoDB >= 4.4
- npm hoặc yarn

## 🔧 Cài đặt

### 1. Clone project
```bash
git clone <repository-url>
cd comicverse-backend
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình environment variables
Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Sửa `.env` với các thông tin thực:
```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/Comicverse

# JWT
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# Server
PORT=3001
CLIENT_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

# Cloudinary - Image Upload
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🚀 Chạy ứng dụng

```bash
# Development mode (với auto-reload)
npm run start:dev

# Production mode
npm run start:prod

# Watch mode
npm run start
```

Server sẽ chạy trên `http://localhost:3001` (hoặc port được cấu hình ở `.env`)

## 📚 API Endpoints

### Authentication
- `POST /auth/login` - Đăng nhập
- `POST /auth/register` - Đăng ký
- `POST /auth/refresh` - Refresh JWT token
- `GET /auth/google/callback` - Google OAuth callback

### Comics
- `GET /comics` - Lấy danh sách truyện (có filter, search, pagination)
- `GET /comics/:id` - Lấy chi tiết truyện
- `GET /comics/hot?limit=10` - Truyện hot nhất
- `GET /comics/latest?limit=20` - Truyện cập nhật mới nhất
- `POST /comics` - Tạo truyện (cần UPLOADER role)
- `PUT /comics/:id` - Cập nhật truyện
- `DELETE /comics/:id` - Xóa truyện (cần ADMIN role)

### Chapters
- `POST /comics/:id/chapters` - Tạo chapter
- `GET /comics/:id/chapters` - Lấy danh sách chapters
- `GET /comics/:id/chapters/:chapterId` - Lấy chi tiết chapter
- `PUT /comics/:id/chapters/:chapterId` - Cập nhật chapter
- `DELETE /comics/:id/chapters/:chapterId` - Xóa chapter

### Upload (Cloudinary)
- `POST /upload` - Upload ảnh
  - Query param: `type=cover|chapter` (mặc định: cover)
  - Form data: `file` (image file)
  - Response: `{ url: string, public_id: string }`

### Comments
- `GET /comics/:id/comments` - Lấy comments
- `POST /comics/:id/comments` - Tạo comment
- `PUT /comments/:id` - Sửa comment
- `DELETE /comments/:id` - Xóa comment

### Categories & Genres
- `GET /categories` - Lấy danh sách thể loại
- `GET /genres` - Lấy danh sách genre
- `POST /categories` - Tạo thể loại (cần ADMIN)

## 🔐 Authentication

### JWT Token
- Access token lưu trong header: `Authorization: Bearer <token>`
- Refresh token để lấy access token mới khi hết hạn

### Roles
- `USER` - Người dùng thường
- `UPLOADER` - Có quyền tải truyện
- `MODERATOR` - Kiểm duyệt nội dung
- `ADMIN` - Quản lý toàn bộ hệ thống

## 📤 Upload Ảnh (Cloudinary)

### Frontend
```javascript
// Upload ảnh bìa
const formData = new FormData();
formData.append('file', imageFile);

const response = await fetch('http://localhost:3001/upload', {
  method: 'POST',
  body: formData,
});

const { url, public_id } = await response.json();
// Lưu url và public_id vào database
```

### Backend tự động
Khi xóa comic hoặc chapter, ảnh tương ứng sẽ tự động bị xóa từ Cloudinary

## 🗄️ Database Schema

### Comic
```typescript
{
  _id: ObjectId,
  title: string,
  slug: string,
  description?: string,
  cover?: string (Cloudinary URL),
  coverPublicId?: string (for deletion),
  authors: string[],
  genres: string[],
  status: 'ongoing' | 'completed' | 'paused',
  chapters: Chapter[],
  views: number,
  createdAt: Date,
  updatedAt: Date,
}
```

### Chapter
```typescript
{
  _id: ObjectId,
  title: string,
  slug: string,
  date: Date,
  images: string[] (Cloudinary URLs),
  imagePublicIds: string[] (for deletion),
  isDraft: boolean,
}
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📦 Build & Deployment

```bash
# Build for production
npm run build

# Output sẽ ở thư mục `dist/`

# Chạy production build
npm run start:prod
```

## 🛠️ Troubleshooting

### MongoDB connection error
- Kiểm tra MongoDB service có chạy không
- Kiểm tra MONGO_URI trong `.env`

### Cloudinary upload fails
- Kiểm tra credentials (CLOUD_NAME, API_KEY, API_SECRET)
- Kiểm tra account Cloudinary có active không
- Kiểm tra file size < 5MB

### JWT token expires
- Frontend cần refresh token bằng refresh token endpoint
- Hoặc user phải đăng nhập lại

## 📖 Tài liệu thêm

- [NestJS Documentation](https://docs.nestjs.com)
- [MongoDB Mongoose](https://mongoosejs.com)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [JWT Guide](https://jwt.io)

## 📝 Project Structure

```
src/
├── auth/              # Authentication & Authorization
├── comics/            # Comic management
├── chapters/          # Chapter management
├── categories/        # Categories & Genres
├── comments/          # Comments system
├── users/             # User management
├── upload/            # Image upload (Cloudinary)
├── admin/             # Admin operations
├── app.module.ts      # Main app module
└── main.ts            # App entry point
```

## 🤝 Contributing

Pull requests được chào đón! Vui lòng tạo branch mới cho mỗi feature/bugfix.

## 📄 License

MIT License

## 👤 Author

ComicVerse Team

---

**Nếu có vấn đề, hãy tạo issue hoặc liên hệ admin team!**
