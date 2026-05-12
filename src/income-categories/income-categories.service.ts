import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncomeCategoryDto, UpdateIncomeCategoryDto } from './dto';

@Injectable()
export class IncomeCategoriesService {
  constructor(private prisma: PrismaService) {}

  create(tenantId: string, dto: CreateIncomeCategoryDto) {
    return this.prisma.incomeCategory.create({
      data: { ...dto, tenantId },
    });
  }

  findAll(tenantId: string) {
    return this.prisma.incomeCategory.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const category = await this.prisma.incomeCategory.findFirst({
      where: { id, tenantId },
    });
    if (!category) throw new NotFoundException('Income category not found');
    return category;
  }

  async update(tenantId: string, id: string, dto: UpdateIncomeCategoryDto) {
    await this.findOne(tenantId, id);
    return this.prisma.incomeCategory.update({
      where: { id },
      data: dto,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.incomeCategory.delete({ where: { id } });
  }
}
