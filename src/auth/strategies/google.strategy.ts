import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService, @InjectModel(User.name) private userModel: Model<UserDocument>) {
    const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:3001/auth/google/callback';
    console.log('🔐 Google OAuth Config:', {
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      callbackURL: callbackURL,
    });
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: callbackURL,
      scope: ['email', 'profile'],
      passReqToCallback: false,
    } as any);
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    try {
      const email = profile?.emails?.[0]?.value;
  if (!email) return done(new Error('No email from Google'), undefined);

      let user = await this.userModel.findOne({ email }).exec();
      if (!user) {
        user = new this.userModel({
          username: profile.displayName || email.split('@')[0],
          email,
          password: Math.random().toString(36).slice(2), // random password (not used)
          avatar: profile.photos?.[0]?.value,
        });
        await user.save();
      }

      return done(null, user);
    } catch (err) {
      return done(err, undefined);
    }
  }
}
