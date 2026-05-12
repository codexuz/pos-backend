import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandCategoryDto, UpdateBrandCategoryDto } from './dto';

@Injectable()
export class BrandCategoriesService {
  constructor(private prisma: PrismaService) {}

  create(tenantId: string, dto: CreateBrandCategoryDto) {
    return this.prisma.brandCategory.create({
      data: { ...dto, tenantId },
    });
  }

  findAll(tenantId: string) {
    return this.prisma.brandCategory.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const brand = await this.prisma.brandCategory.findFirst({
      where: { id, tenantId },
    });
    if (!brand) throw new NotFoundException('Brand category not found');
    return brand;
  }

  async update(tenantId: string, id: string, dto: UpdateBrandCategoryDto) {
    await this.findOne(tenantId, id);
    return this.prisma.brandCategory.update({
      where: { id },
      data: dto,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.brandCategory.delete({ where: { id } });
  }
}
