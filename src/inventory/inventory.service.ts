import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryDto, UpdateInventoryDto } from './dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  create(tenantId: string, dto: CreateInventoryDto) {
    return this.prisma.inventory.create({
      data: { ...dto, tenantId } as any,
      include: {
        product: { select: { id: true, name: true, sku: true } },
        tenant: { select: { id: true, name: true } },
      },
    });
  }

  findAll(tenantId: string) {
    return this.prisma.inventory.findMany({
      where: { tenantId },
      include: {
        product: {
          select: { id: true, name: true, sku: true, barcode: true, sellingPrice: true, unit: true },
        },
      },
      orderBy: { product: { name: 'asc' } },
    });
  }

  findLowStock(tenantId: string) {
    return this.prisma.$queryRaw`
      SELECT i.*, p.name as product_name, p.sku
      FROM inventory i
      JOIN products p ON p.id = i.product_id
      WHERE i.tenant_id = ${tenantId}::uuid
        AND i.quantity <= i.min_quantity
      ORDER BY i.quantity ASC
    `;
  }

  async findOne(id: string) {
    const inventory = await this.prisma.inventory.findUnique({
      where: { id },
      include: {
        product: { select: { id: true, name: true, sku: true } },
        tenant: { select: { id: true, name: true } },
      },
    });
    if (!inventory) throw new NotFoundException('Inventory record not found');
    return inventory;
  }

  async update(id: string, dto: UpdateInventoryDto) {
    await this.findOne(id);
    return this.prisma.inventory.update({
      where: { id },
      data: dto as any,
      include: {
        product: { select: { id: true, name: true, sku: true } },
        tenant: { select: { id: true, name: true } },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.inventory.delete({ where: { id } });
  }
}
