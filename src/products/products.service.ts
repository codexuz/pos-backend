import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateProductDto) {
    const { quantity, minQuantity, ...productData } = dto;

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: { ...productData, tenantId } as any,
        include: { category: true, unit: true },
      });

      await tx.inventory.create({
        data: {
          productId: product.id,
          tenantId,
          quantity: quantity ?? 0,
          minQuantity: minQuantity ?? 0,
        },
      });

      return tx.product.findUnique({
        where: { id: product.id },
        include: { category: true, unit: true, inventory: true },
      }).then(product => {
        const inventory = product.inventory && product.inventory.length > 0 ? product.inventory[0] : null;
        return {
          ...product,
          inventoryStatus: inventory && inventory.quantity <= (inventory.minQuantity || 0) ? 'low-stock' : 'in-stock'
        };
      });
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
      include: { category: true, unit: true, inventory: true },
      orderBy: { createdAt: 'desc' },
    }).then(products => products.map(product => {
      const inventory = product.inventory && product.inventory.length > 0 ? product.inventory[0] : null;
      return {
        ...product,
        inventoryStatus: inventory && inventory.quantity <= (inventory.minQuantity || 0) ? 'low-stock' : 'in-stock'
      };
    }));
  }

  async findOne(id: string, tenantId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId },
      include: {
        category: true,
        unit: true,
        inventory: true,
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    const inventory = product.inventory && product.inventory.length > 0 ? product.inventory[0] : null;
    return {
      ...product,
      inventoryStatus: inventory && inventory.quantity <= (inventory.minQuantity || 0) ? 'low-stock' : 'in-stock'
    };
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
