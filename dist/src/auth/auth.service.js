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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = __importStar(require("bcrypt"));
const user_schema_1 = require("./schemas/user.schema");
const config_1 = require("@nestjs/config");
const email_service_1 = require("../email/email.service");
let AuthService = class AuthService {
    constructor(userModel, jwtService, configService, emailService) {
        this.userModel = userModel;
        this.jwtService = jwtService;
        this.configService = configService;
        this.emailService = emailService;
    }
    async register(dto) {
        const { password, confirmPassword, ...rest } = dto;
        if (password !== confirmPassword) {
            throw new common_1.BadRequestException('Passwords do not match');
        }
        const exists = await this.userModel.findOne({ email: rest.email }).exec();
        if (exists) {
            throw new common_1.BadRequestException('Email already registered');
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
    async login(dto) {
        const user = await this.userModel.findOne({ email: dto.email }).exec();
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.isBlocked) {
            throw new common_1.UnauthorizedException('Account is blocked');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const tokens = await this.getTokens(user._id.toString(), user.email);
        await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);
        return {
            user: { id: user._id, email: user.email, username: user.username, roles: user.roles },
            ...tokens,
        };
    }
    async forgotPassword(dto) {
        const user = await this.userModel.findOne({ email: dto.email }).exec();
        if (!user) {
            throw new common_1.BadRequestException('Email not found');
        }
        const token = Math.random().toString(36).slice(-8);
        const expires = new Date();
        expires.setHours(expires.getHours() + 1);
        user.resetPasswordToken = token;
        user.resetPasswordExpires = expires;
        await user.save();
        try {
            await this.emailService.sendPasswordResetEmail(user.email, token, user.username);
        }
        catch (error) {
            console.error('Failed to send password reset email:', error);
        }
        return {
            message: 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn',
            email: user.email,
        };
    }
    async resetPassword(dto) {
        if (dto.password !== dto.confirmPassword) {
            throw new common_1.BadRequestException('Passwords do not match');
        }
        const user = await this.userModel.findOne({
            resetPasswordToken: dto.token,
            resetPasswordExpires: { $gt: new Date() },
        }).exec();
        if (!user) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        user.password = await bcrypt.hash(dto.password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        return { message: 'Password successfully reset' };
    }
    async updateProfile(userId, dto) {
        const updates = {};
        if (dto.username) {
            updates.username = dto.username;
        }
        if (dto.avatar) {
            updates.avatar = dto.avatar;
        }
        if (dto.currentPassword && dto.newPassword) {
            const user = await this.userModel.findById(userId).exec();
            if (!user)
                throw new common_1.NotFoundException('User not found');
            const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
            if (!isPasswordValid) {
                throw new common_1.BadRequestException('Current password is incorrect');
            }
            updates.password = await bcrypt.hash(dto.newPassword, 10);
        }
        const updated = await this.userModel
            .findByIdAndUpdate(userId, updates, { new: true })
            .select('-password -refreshToken')
            .exec();
        return updated;
    }
    async refreshTokens(userId, refreshToken) {
        const user = await this.userModel.findById(userId).exec();
        if (!user || !user.refreshToken) {
            throw new common_1.UnauthorizedException('Access Denied');
        }
        const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!refreshTokenMatches)
            throw new common_1.UnauthorizedException('Access Denied');
        const tokens = await this.getTokens(user.id, user.email);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        return tokens;
    }
    async logout(userId) {
        await this.userModel
            .findByIdAndUpdate(userId, { refreshToken: null })
            .exec();
        return { message: 'Logged out successfully' };
    }
    async handleOAuthLogin(user) {
        const tokens = await this.getTokens(user._id.toString(), user.email);
        await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);
        return {
            user: { id: user._id, email: user.email, username: user.username, roles: user.roles },
            ...tokens,
        };
    }
    async getTokens(userId, email) {
        const user = await this.userModel.findById(userId).select('roles').exec();
        const roles = (user === null || user === void 0 ? void 0 : user.roles) || [];
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync({ sub: userId, email, roles }, {
                secret: this.configService.get('JWT_ACCESS_SECRET'),
                expiresIn: '2d',
            }),
            this.jwtService.signAsync({ sub: userId, email, roles }, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: '7d',
            }),
        ]);
        return {
            accessToken,
            refreshToken,
        };
    }
    async updateRefreshToken(userId, refreshToken) {
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        await this.userModel
            .findByIdAndUpdate(userId, { refreshToken: hashedRefreshToken })
            .exec();
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        jwt_1.JwtService,
        config_1.ConfigService,
        email_service_1.EmailService])
], AuthService);
