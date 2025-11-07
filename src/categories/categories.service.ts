import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(dto: CreateCategoryDto) {
    const slug = dto.name.toLowerCase().replace(/\s+/g, '-');
    const created = new this.categoryModel({ ...dto, slug });
    return created.save();
  }

  async findAll() {
    return this.categoryModel.find().sort({ name: 1 }).exec();
  }

  async findOne(id: string) {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const updates: any = { ...dto };
    if (dto.name) {
      updates.slug = dto.name.toLowerCase().replace(/\s+/g, '-');
    }

    const updated = await this.categoryModel
      .findByIdAndUpdate(id, updates, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('Category not found');
    }
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('Category not found');
    }
    return { message: 'Category deleted successfully' };
  }
}