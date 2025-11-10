import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ComicsModule } from './comics';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { CommentsModule } from './comments/comments.module';
import { UsersModule } from './users/users.module';
import { UploadModule } from './upload/upload.module';
import { ChaptersModule } from './chapters/chapters.module';
import { PingModule } from './ping/ping.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('MONGO_URI') || 'mongodb://localhost:27017/comicverse';
        console.log('Connecting to MongoDB at:', uri);
        return {
          uri,
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 5000,
        };
      },
    }),
    ComicsModule,
    AuthModule,
    CategoriesModule,
    CommentsModule,
    UsersModule,
    UploadModule,
    ChaptersModule,
    PingModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
