import {
  Body,
  Controller,
  Post,
  Get,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  UpdateProfileDto,
} from './dto/auth.dto';
import { JwtAuthGuard, RefreshTokenGuard } from './guards';
import { AuthGuard } from '@nestjs/passport';
import { Res } from '@nestjs/common';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Request() req) {
    return this.authService.logout(req.user.sub);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  refreshTokens(@Request() req) {
    const userId = req.user.sub;
    const refreshToken = req.user.refreshToken;
    return this.authService.refreshTokens(userId, refreshToken);
  }

  // Google OAuth
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // initiates the Google OAuth2 login flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Request() req: any, @Res() res: Response) {
    // req.user is set by GoogleStrategy validate -> user document
    const result = await this.authService.handleOAuthLogin(req.user);
    // Redirect to frontend client with tokens (client should handle storing tokens)
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const redirectPath = '/auth/callback';
    const redirectUrl = `${clientUrl.replace(/\/$/, '')}${redirectPath}?accessToken=${encodeURIComponent(
      result.accessToken,
    )}&refreshToken=${encodeURIComponent(result.refreshToken)}`;
    return res.redirect(redirectUrl);
  }
}