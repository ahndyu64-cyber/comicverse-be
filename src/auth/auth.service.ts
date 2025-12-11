import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto, UpdateProfileDto } from './dto/auth.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const { password, confirmPassword, ...rest } = dto;
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const exists = await this.userModel.findOne({ email: rest.email }).exec();
    if (exists) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({
      ...rest,
      password: hashedPassword,
    });

    await user.save();
    const tokens = await this.getTokens(user._id.toString(), user.email);
    await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);

    return {
      user: { id: user._id, email: user.email, username: user.username, roles: user.roles },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ email: dto.email }).exec();
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isBlocked) {
      throw new UnauthorizedException('Account is blocked');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.getTokens(user._id.toString(), user.email);
    await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);

    return {
      user: { id: user._id, email: user.email, username: user.username, roles: user.roles },
      ...tokens,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userModel.findOne({ email: dto.email }).exec();
    if (!user) {
      throw new BadRequestException('Email not found');
    }

    const token = Math.random().toString(36).slice(-8);
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

    // TODO: Send email with reset token
    return { message: 'Password reset instructions sent to email' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.userModel.findOne({
      resetPasswordToken: dto.token,
      resetPasswordExpires: { $gt: new Date() },
    }).exec();

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.password = await bcrypt.hash(dto.password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { message: 'Password successfully reset' };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const updates: any = {};
    
    if (dto.username) {
      updates.username = dto.username;
    }
    
    if (dto.avatar) {
      updates.avatar = dto.avatar;
    }

    if (dto.currentPassword && dto.newPassword) {
      const user = await this.userModel.findById(userId).exec();
      if (!user) throw new NotFoundException('User not found');
      const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
      if (!isPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }
      updates.password = await bcrypt.hash(dto.newPassword, 10);
    }

    const updated = await this.userModel
      .findByIdAndUpdate(userId, updates, { new: true })
      .select('-password -refreshToken')
      .exec();

    return updated;
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (!refreshTokenMatches) throw new UnauthorizedException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    await this.userModel
      .findByIdAndUpdate(userId, { refreshToken: null })
      .exec();
    return { message: 'Logged out successfully' };
  }

  // Called after OAuth login (Google/Facebook)
  async handleOAuthLogin(user: UserDocument) {
    const tokens = await this.getTokens(user._id.toString(), user.email);
    await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);
    return {
      user: { id: user._id, email: user.email, username: user.username, roles: user.roles },
      ...tokens,
    };
  }

  private async getTokens(userId: string, email: string) {
    const user = await this.userModel.findById(userId).select('roles').exec();
    const roles = user?.roles || [];

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, roles },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '2d',
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, roles },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userModel
      .findByIdAndUpdate(userId, { refreshToken: hashedRefreshToken })
      .exec();
  }
}