import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  create(tenantId: string, dto: CreateProductDto) {
    return this.prisma.product.create({
      data: { ...dto, tenantId } as any,
      include: { category: true, unit: true },
    });
  }

  findAll(tenantId: string, search?: string) {
    return this.prisma.product.findMany({
      where: {
        tenantId,
        isActive: true,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { sku: { contains: search, mode: 'insensitive' as const } },
            { barcode: { contains: search, mode: 'insensitive' as const } },
          ],
        }),
      },
      include: { category: true, unit: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId },
      include: {
        category: true,
        unit: true,
        inventory: { include: { branch: { select: { id: true, name: true } } } },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, tenantId: string, dto: UpdateProductDto) {
    await this.findOne(id, tenantId);
    return this.prisma.product.update({
      where: { id },
      data: dto as any,
      include: { category: true, unit: true },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
