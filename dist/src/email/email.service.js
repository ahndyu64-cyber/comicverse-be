"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
let EmailService = class EmailService {
    constructor(configService) {
        this.configService = configService;
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('SMTP_HOST'),
            port: this.configService.get('SMTP_PORT'),
            secure: false,
            auth: {
                user: this.configService.get('SMTP_USER'),
                pass: this.configService.get('SMTP_PASSWORD'),
            },
        });
    }
    async sendPasswordResetEmail(email, resetToken, username) {
        const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px; }
            .content { margin: 20px 0; line-height: 1.6; color: #333; }
            .code-box { background-color: #f5f5f5; border: 2px dashed #007bff; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0; }
            .code-text { font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px; font-family: monospace; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Đặt Lại Mật Khẩu</h1>
            </div>
            <div class="content">
              <p>Xin chào ${username || 'Người dùng'},</p>
              <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Sử dụng mã xác thực dưới đây để tiếp tục:</p>
              
              <div class="code-box">
                <div class="code-text">${resetToken}</div>
              </div>
              
              <p>Vui lòng nhập mã này vào ứng dụng để xác thực yêu cầu của bạn.</p>
              <p><strong>Lưu ý:</strong> Mã này sẽ hết hạn trong 1 giờ.</p>
              <p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Comicverse. Tất cả quyền được bảo lưu.</p>
            </div>
          </div>
        </body>
      </html>
    `;
        try {
            console.log('📧 Sending password reset email to:', email);
            const response = await this.transporter.sendMail({
                from: this.configService.get('SMTP_FROM'),
                to: email,
                subject: 'Đặt Lại Mật Khẩu - Comicverse',
                html: htmlContent,
                text: `Xin chào ${username || 'Người dùng'},\n\nMã xác thực của bạn: ${resetToken}\n\nVui lòng nhập mã này để đặt lại mật khẩu.\n\nMã này sẽ hết hạn trong 1 giờ.\n\nNếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.`,
            });
            console.log('✅ Email sent successfully:', response);
        }
        catch (error) {
            console.error('❌ Error sending email:', error);
            throw new Error(`Failed to send password reset email: ${error.message}`);
        }
    }
    async sendWelcomeEmail(email, username) {
        const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 5px; }
            .content { margin: 20px 0; line-height: 1.6; color: #333; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Chào Mừng Đến Comicverse</h1>
            </div>
            <div class="content">
              <p>Xin chào ${username || 'Người dùng'},</p>
              <p>Cảm ơn bạn đã đăng ký tài khoản trên Comicverse!</p>
              <p>Bây giờ bạn có thể:</p>
              <ul>
                <li>Khám phá hàng nghìn bộ truyện</li>
                <li>Theo dõi những bộ truyện yêu thích</li>
                <li>Tham gia cộng đồng</li>
              </ul>
              <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Comicverse. Tất cả quyền được bảo lưu.</p>
            </div>
          </div>
        </body>
      </html>
    `;
        try {
            console.log('📧 Sending welcome email to:', email);
            const response = await this.transporter.sendMail({
                from: this.configService.get('SMTP_FROM'),
                to: email,
                subject: 'Chào Mừng Đến Comicverse',
                html: htmlContent,
                text: `Xin chào ${username || 'Người dùng'},\n\nCảm ơn bạn đã đăng ký tài khoản trên Comicverse!`,
            });
            console.log('✅ Welcome email sent successfully:', response);
        }
        catch (error) {
            console.error('❌ Error sending welcome email:', error);
            throw new Error(`Failed to send welcome email: ${error.message}`);
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
