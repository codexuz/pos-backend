import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto';

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
}
