import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService, UsersController } from './';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { Comic, ComicSchema } from '../comics/schemas/comic.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Comic.name, schema: ComicSchema },
    ]),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
