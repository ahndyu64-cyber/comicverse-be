import { Module } from '@nestjs/common';
import { AdminService, AdminController } from './';
import { UsersModule } from '../users/users.module';
import { ComicsModule } from '../comics/comics.module';

@Module({
  imports: [UsersModule, ComicsModule],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
