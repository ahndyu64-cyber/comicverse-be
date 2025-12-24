import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
    });
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    username?: string,
  ): Promise<void> {
    const resetLink = `${this.configService.get<string>('CLIENT_URL')}/reset-password?token=${resetToken}`;

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px; }
            .content { margin: 20px 0; line-height: 1.6; color: #333; }
            .reset-button { display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
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
              <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng nhấp vào nút dưới đây để tiếp tục:</p>
              <a href="${resetLink}" class="reset-button">Đặt Lại Mật Khẩu</a>
              <p>Hoặc sao chép và dán đường link này vào trình duyệt của bạn:</p>
              <p><small>${resetLink}</small></p>
              <p><strong>Lưu ý:</strong> Liên kết này sẽ hết hạn trong 1 giờ.</p>
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
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM'),
        to: email,
        subject: 'Đặt Lại Mật Khẩu - Comicverse',
        html: htmlContent,
        text: `Xin chào ${username || 'Người dùng'},\n\nVui lòng nhấp vào liên kết dưới đây để đặt lại mật khẩu của bạn:\n${resetLink}\n\nLiên kết này sẽ hết hạn trong 1 giờ.\n\nNếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.`,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  async sendWelcomeEmail(email: string, username?: string): Promise<void> {
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
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM'),
        to: email,
        subject: 'Chào Mừng Đến Comicverse',
        html: htmlContent,
        text: `Xin chào ${username || 'Người dùng'},\n\nCảm ơn bạn đã đăng ký tài khoản trên Comicverse!`,
      });
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw new Error('Failed to send welcome email');
    }
  }
}
