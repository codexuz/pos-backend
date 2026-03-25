import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto, UpdateSaleDto } from './dto';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, branchId: string, sellerId: string, dto: CreateSaleDto) {
    const items = dto.items.map((item) => {
      const totalPrice = item.quantity * item.unitPrice;
      return { ...item, totalPrice };
    });

    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const discountAmount = dto.discountAmount ?? 0;
    const finalAmount = totalAmount - discountAmount;
    const paidAmount = dto.paidAmount ?? 0;

    let paymentStatus: 'pending' | 'partial' | 'paid' = 'pending';
    if (dto.paymentStatus) {
      paymentStatus = dto.paymentStatus;
    } else if (paidAmount >= finalAmount) {
      paymentStatus = 'paid';
    } else if (paidAmount > 0) {
      paymentStatus = 'partial';
    }

    const productIds = items.map((item) => item.productId);
    const existingProducts = await this.prisma.product.findMany({
      where: { id: { in: productIds }, tenantId },
      select: { id: true },
    });
    const existingIds = new Set(existingProducts.map((p) => p.id));
    const missingIds = productIds.filter((id) => !existingIds.has(id));
    if (missingIds.length > 0) {
      throw new NotFoundException(`Products not found: ${missingIds.join(', ')}`);
    }

    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.create({
        data: {
          tenantId,
          branchId,
          sellerId,
          clientId: dto.clientId,
          totalAmount,
          discountAmount,
          finalAmount,
          paidAmount,
          paymentStatus,
          notes: dto.notes,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
            })),
          },
        },
        include: {
          items: { include: { product: { select: { id: true, name: true } } } },
          client: true,
          seller: { select: { id: true, fullName: true } },
        },
      });

      // Create payment if paid
      if (paidAmount > 0) {
        await tx.payment.create({
          data: {
            tenantId,
            saleId: sale.id,
            amount: paidAmount,
            paymentMethod: (dto.paymentMethod as any) ?? 'cash',
          },
        });
      }

      // Deduct inventory
      for (const item of items) {
        await tx.inventory.updateMany({
          where: { productId: item.productId, tenantId },
          data: { quantity: { decrement: item.quantity } },
        });
      }

      return sale;
    });
  }

  findAll(tenantId: string, branchId?: string) {
    return this.prisma.sale.findMany({
      where: {
        tenantId,
        ...(branchId && { branchId }),
      },
      include: {
        seller: { select: { id: true, fullName: true } },
        client: { select: { id: true, fullName: true } },
        branch: { select: { id: true, name: true } },
        _count: { select: { items: true, payments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const sale = await this.prisma.sale.findFirst({
      where: { id, tenantId },
      include: {
        items: { include: { product: { select: { id: true, name: true, sku: true } } } },
        payments: true,
        seller: { select: { id: true, fullName: true } },
        client: true,
        branch: { select: { id: true, name: true } },
      },
    });
    if (!sale) throw new NotFoundException('Sale not found');
    return sale;
  }

  async update(tenantId: string, id: string, dto: UpdateSaleDto) {
    const existing = await this.prisma.sale.findFirst({
      where: { id, tenantId },
      include: { items: true },
    });
    if (!existing) throw new NotFoundException('Sale not found');

    return this.prisma.$transaction(async (tx) => {
      let totalAmount = Number(existing.totalAmount);
      let discountAmount = dto.discountAmount ?? Number(existing.discountAmount);

      // If items are being replaced
      if (dto.items) {
        // Restore inventory for old items
        for (const oldItem of existing.items) {
          await tx.inventory.updateMany({
            where: { productId: oldItem.productId, tenantId },
            data: { quantity: { increment: Number(oldItem.quantity) } },
          });
        }

        // Validate new products
        const productIds = dto.items.map((item) => item.productId);
        const existingProducts = await tx.product.findMany({
          where: { id: { in: productIds }, tenantId },
          select: { id: true },
        });
        const existingIds = new Set(existingProducts.map((p) => p.id));
        const missingIds = productIds.filter((pid) => !existingIds.has(pid));
        if (missingIds.length > 0) {
          throw new NotFoundException(`Products not found: ${missingIds.join(', ')}`);
        }

        // Delete old items and create new ones
        await tx.saleItem.deleteMany({ where: { saleId: id } });

        const newItems = dto.items.map((item) => ({
          ...item,
          totalPrice: item.quantity * item.unitPrice,
        }));

        await tx.saleItem.createMany({
          data: newItems.map((item) => ({
            saleId: id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        });

        // Deduct inventory for new items
        for (const item of newItems) {
          await tx.inventory.updateMany({
            where: { productId: item.productId, tenantId },
            data: { quantity: { decrement: item.quantity } },
          });
        }

        totalAmount = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
      }

      const finalAmount = totalAmount - discountAmount;

      let paymentStatus = dto.paymentStatus;
      if (!paymentStatus) {
        const paidAmount = Number(existing.paidAmount);
        if (paidAmount >= finalAmount) paymentStatus = 'paid';
        else if (paidAmount > 0) paymentStatus = 'partial';
        else paymentStatus = 'pending';
      }

      return tx.sale.update({
        where: { id },
        data: {
          ...(dto.clientId !== undefined && { clientId: dto.clientId }),
          ...(dto.notes !== undefined && { notes: dto.notes }),
          ...(dto.items && { totalAmount, finalAmount }),
          discountAmount,
          paymentStatus,
        },
        include: {
          items: { include: { product: { select: { id: true, name: true } } } },
          client: true,
          seller: { select: { id: true, fullName: true } },
        },
      });
    });
  }

  async remove(tenantId: string, id: string) {
    const sale = await this.prisma.sale.findFirst({
      where: { id, tenantId },
      include: { items: true },
    });
    if (!sale) throw new NotFoundException('Sale not found');

    return this.prisma.$transaction(async (tx) => {
      // Restore inventory
      for (const item of sale.items) {
        await tx.inventory.updateMany({
          where: { productId: item.productId, tenantId },
          data: { quantity: { increment: Number(item.quantity) } },
        });
      }

      await tx.sale.delete({ where: { id } });
      return { message: 'Sale deleted successfully' };
    });
  }
}
