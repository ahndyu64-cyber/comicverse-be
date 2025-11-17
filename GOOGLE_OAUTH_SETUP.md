# Hướng dẫn tích hợp Google OAuth

## Giới thiệu
Hệ thống Comic Verse hỗ trợ đăng nhập bằng Google OAuth 2.0, cho phép người dùng đăng nhập an toàn bằng tài khoản Google của họ.

## Bước 1: Tạo Google Cloud Project

### 1.1. Truy cập Google Cloud Console
- Đi tới [Google Cloud Console](https://console.cloud.google.com/)
- Đăng nhập bằng tài khoản Google của bạn

### 1.2. Tạo Project mới
- Click vào dropdown project ở phía trên cùng
- Click "NEW PROJECT"
- Nhập tên project (ví dụ: "ComicVerse")
- Click "CREATE"

### 1.3. Đợi project được tạo
- Chọn project mới từ dropdown

## Bước 2: Kích hoạt Google+ API

### 2.1. Tìm Google+ API
- Ở menu bên trái, click "APIs & Services" > "Library"
- Tìm kiếm "Google+ API"
- Click vào kết quả đầu tiên

### 2.2. Kích hoạt API
- Click nút "ENABLE"
- Đợi API được kích hoạt

## Bước 3: Tạo OAuth 2.0 Credentials

### 3.1. Tạo OAuth Consent Screen
- Ở menu bên trái, click "APIs & Services" > "OAuth consent screen"
- Chọn "External" cho User type
- Click "CREATE"

### 3.2. Điền thông tin OAuth Consent Screen
**Trang 1: OAuth consent screen**
- **App name**: ComicVerse
- **User support email**: email của bạn
- **Developer contact information**: email của bạn
- Click "SAVE AND CONTINUE"

**Trang 2: Scopes**
- Click "ADD OR REMOVE SCOPES"
- Tìm và chọn:
  - `email`
  - `profile`
  - `openid`
- Click "UPDATE"
- Click "SAVE AND CONTINUE"

**Trang 3: Test users**
- Click "ADD USERS"
- Thêm email của bạn để test
- Click "SAVE AND CONTINUE"

**Trang 4: Summary**
- Review lại thông tin
- Click "BACK TO DASHBOARD"

### 3.3. Tạo OAuth 2.0 Client ID
- Ở menu bên trái, click "APIs & Services" > "Credentials"
- Click "CREATE CREDENTIALS" > "OAuth client ID"
- Chọn "Web application"

### 3.4. Cấu hình Web Application
**Tên**: ComicVerse OAuth Client

**Authorized JavaScript origins** (thêm):
```
http://localhost:3001
http://localhost:3000
https://yourdomain.com
```

**Authorized redirect URIs** (thêm):
```
http://localhost:3001/auth/google/callback
http://localhost:3000/auth/callback
https://yourdomain.com/auth/callback
```

### 3.5. Lấy Credentials
- Click "CREATE"
- Một dialog sẽ hiển thị
- **Copy** `Client ID` và `Client Secret`

## Bước 4: Cấu hình Environment Variables

Cập nhật file `.env` trong thư mục gốc của backend:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

# Frontend URL (để redirect sau khi login thành công)
CLIENT_URL=http://localhost:3000
```

**Lưu ý**: Thay `your_client_id_here` và `your_client_secret_here` bằng giá trị thực từ Google Cloud Console

## Bước 5: Kiểm tra Backend Configuration

Đảm bảo backend đã được khởi động:

```bash
npm run start:dev
```

Backend sẽ tự động tải các environment variables từ file `.env`.

## Cách sử dụng

### Đăng nhập bằng Google

**Frontend URL để bắt đầu Google login**:
```
http://localhost:3001/auth/google
```

**Flow**:
1. Người dùng click vào nút "Đăng nhập bằng Google"
2. Frontend redirect tới `http://localhost:3001/auth/google`
3. Backend sẽ redirect tới Google's OAuth dialog
4. Người dùng authorize ứng dụng
5. Google redirect về `http://localhost:3001/auth/google/callback`
6. Backend xử lý callback và tạo/cập nhật user
7. Backend redirect về `http://localhost:3000/auth/callback?accessToken=...&refreshToken=...`
8. Frontend nhận tokens và lưu trữ

### Frontend Implementation

```typescript
// pages/auth/login.tsx
const handleGoogleLogin = () => {
  window.location.href = 'http://localhost:3001/auth/google';
};

// pages/auth/callback.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const { accessToken, refreshToken } = router.query;
    
    if (accessToken && refreshToken) {
      // Lưu tokens
      localStorage.setItem('accessToken', accessToken as string);
      localStorage.setItem('refreshToken', refreshToken as string);
      
      // Redirect tới home
      router.push('/');
    }
  }, [router.query]);

  return <div>Đang xử lý đăng nhập...</div>;
}
```

## Troubleshooting

### Error: "Client ID not configured"
- Kiểm tra file `.env` có chứa `GOOGLE_CLIENT_ID`
- Ensure `.env` file được load bởi ConfigModule

### Error: "Redirect URI mismatch"
- Đảm bảo `GOOGLE_CALLBACK_URL` trong `.env` match với URI đã cấu hình trong Google Cloud Console
- Ví dụ: `http://localhost:3001/auth/google/callback` phải chính xác

### Error: "Access blocked: Unauthenticated users cannot access this app"
- Vào Google Cloud Console > OAuth consent screen
- Thêm email của bạn vào "Test users"

### Người dùng bị redirect nhưng không thấy tokens
- Kiểm tra browser console cho errors
- Đảm bảo `CLIENT_URL` được cấu hình đúng trong `.env`
- Kiểm tra database MongoDB có lưu user mới không

## Production Deployment

### Cập nhật Environment Variables

```env
GOOGLE_CLIENT_ID=your_production_client_id
GOOGLE_CLIENT_SECRET=your_production_client_secret
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/auth/google/callback
CLIENT_URL=https://yourdomain.com
```

### Cập nhật Google Cloud Console

1. Vào "APIs & Services" > "Credentials"
2. Chọn OAuth 2.0 Client ID của bạn
3. Thêm authorized origins và redirect URIs:
   - **Authorized JavaScript origins**: `https://yourdomain.com`
   - **Authorized redirect URIs**: `https://api.yourdomain.com/auth/google/callback`

## Tài liệu tham khảo

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport.js Google Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)
- [NestJS Authentication](https://docs.nestjs.com/security/authentication)

