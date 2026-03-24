import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  create(tenantId: string, dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: { ...dto, tenantId },
    });
  }

  findAll(tenantId: string) {
    return this.prisma.category.findMany({
      where: { tenantId },
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, tenantId },
      include: { _count: { select: { products: true } } },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: string, tenantId: string, dto: UpdateCategoryDto) {
    await this.findOne(id, tenantId);
    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.category.delete({ where: { id } });
  }
}
