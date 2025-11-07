import { Controller, Get } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('genres')
export class GenresController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }
}
