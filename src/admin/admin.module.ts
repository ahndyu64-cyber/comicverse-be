import { Module } from '@nestjs/common';
import { AdminService, AdminController } from './';
import { UsersModule } from '../users/users.module';
import { ComicsModule } from '../comics/comics.module';
import { BannersModule } from '../banners/banners.module';

@Module({
  imports: [UsersModule, ComicsModule, BannersModule],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
