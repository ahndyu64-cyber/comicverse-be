import { Module } from '@nestjs/common';
import { ChaptersController } from './';
import { ComicsModule } from '../comics/comics.module';

@Module({
  imports: [ComicsModule],
  controllers: [ChaptersController],
})
export class ChaptersModule {}
