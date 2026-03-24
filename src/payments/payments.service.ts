import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreatePaymentDto) {
    // Verify sale belongs to tenant
    const sale = await this.prisma.sale.findFirst({
      where: { id: dto.saleId, tenantId },
    });
    if (!sale) throw new NotFoundException('Sale not found');

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          tenantId,
          saleId: dto.saleId,
          amount: dto.amount,
          paymentMethod: (dto.paymentMethod as any) ?? 'cash',
          notes: dto.notes,
        },
      });

      // Update sale paid amount and status
      const newPaidAmount = Number(sale.paidAmount) + dto.amount;
      const finalAmount = Number(sale.finalAmount);
      let paymentStatus: 'pending' | 'partial' | 'paid' = 'pending';
      if (newPaidAmount >= finalAmount) paymentStatus = 'paid';
      else if (newPaidAmount > 0) paymentStatus = 'partial';

      await tx.sale.update({
        where: { id: dto.saleId },
        data: { paidAmount: newPaidAmount, paymentStatus },
      });

      return payment;
    });
  }

  findAll(tenantId: string, saleId?: string) {
    return this.prisma.payment.findMany({
      where: {
        tenantId,
        ...(saleId && { saleId }),
      },
      include: {
        sale: { select: { id: true, finalAmount: true, paymentStatus: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id, tenantId },
      include: { sale: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }
}
