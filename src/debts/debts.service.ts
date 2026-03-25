import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DebtsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, branchId?: string, clientId?: string) {
    const sales = await this.prisma.sale.findMany({
      where: {
        tenantId,
        paymentStatus: { in: ['pending', 'partial'] },
        ...(branchId && { branchId }),
        ...(clientId && { clientId }),
      },
      include: {
        client: { select: { id: true, fullName: true, phone: true } },
        branch: { select: { id: true, name: true } },
        seller: { select: { id: true, fullName: true } },
        _count: { select: { payments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sales.map((sale) => ({
      saleId: sale.id,
      client: sale.client,
      branch: sale.branch,
      seller: sale.seller,
      totalAmount: Number(sale.finalAmount),
      paidAmount: Number(sale.paidAmount),
      debtAmount: +(Number(sale.finalAmount) - Number(sale.paidAmount)).toFixed(2),
      paymentStatus: sale.paymentStatus,
      paymentsCount: sale._count.payments,
      createdAt: sale.createdAt,
      ageDays: Math.floor(
        (Date.now() - sale.createdAt.getTime()) / (1000 * 60 * 60 * 24),
      ),
    }));
  }

  async summary(tenantId: string, branchId?: string) {
    const sales = await this.prisma.sale.findMany({
      where: {
        tenantId,
        paymentStatus: { in: ['pending', 'partial'] },
        ...(branchId && { branchId }),
      },
    });

    const totalDebt = sales.reduce(
      (sum, s) => sum + (Number(s.finalAmount) - Number(s.paidAmount)),
      0,
    );
    const pendingCount = sales.filter((s) => s.paymentStatus === 'pending').length;
    const partialCount = sales.filter((s) => s.paymentStatus === 'partial').length;

    const now = Date.now();
    const aging = { current: 0, days30: 0, days60: 0, days90plus: 0 };
    for (const sale of sales) {
      const days = Math.floor((now - sale.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      const debt = Number(sale.finalAmount) - Number(sale.paidAmount);
      if (days <= 30) aging.current += debt;
      else if (days <= 60) aging.days30 += debt;
      else if (days <= 90) aging.days60 += debt;
      else aging.days90plus += debt;
    }

    return {
      totalDebt: +totalDebt.toFixed(2),
      totalSales: sales.length,
      pendingCount,
      partialCount,
      aging: {
        current: +aging.current.toFixed(2),
        '31-60': +aging.days30.toFixed(2),
        '61-90': +aging.days60.toFixed(2),
        '90+': +aging.days90plus.toFixed(2),
      },
    };
  }

  async clientBalances(tenantId: string) {
    const sales = await this.prisma.sale.findMany({
      where: {
        tenantId,
        paymentStatus: { in: ['pending', 'partial'] },
        clientId: { not: null },
      },
      include: {
        client: { select: { id: true, fullName: true, phone: true } },
      },
    });

    const clientMap: Record<
      string,
      { client: any; totalDebt: number; salesCount: number; oldestDate: Date }
    > = {};

    for (const sale of sales) {
      const cid = sale.clientId!;
      const debt = Number(sale.finalAmount) - Number(sale.paidAmount);
      if (!clientMap[cid]) {
        clientMap[cid] = {
          client: sale.client,
          totalDebt: 0,
          salesCount: 0,
          oldestDate: sale.createdAt,
        };
      }
      clientMap[cid].totalDebt += debt;
      clientMap[cid].salesCount++;
      if (sale.createdAt < clientMap[cid].oldestDate) {
        clientMap[cid].oldestDate = sale.createdAt;
      }
    }

    return Object.values(clientMap)
      .sort((a, b) => b.totalDebt - a.totalDebt)
      .map((entry) => ({
        ...entry.client,
        totalDebt: +entry.totalDebt.toFixed(2),
        unpaidSalesCount: entry.salesCount,
        oldestDebtDate: entry.oldestDate,
        oldestDebtDays: Math.floor(
          (Date.now() - entry.oldestDate.getTime()) / (1000 * 60 * 60 * 24),
        ),
      }));
  }

  async clientDebt(tenantId: string, clientId: string) {
    const client = await this.prisma.client.findFirst({
      where: { id: clientId, tenantId },
    });
    if (!client) throw new NotFoundException('Client not found');

    const sales = await this.prisma.sale.findMany({
      where: {
        tenantId,
        clientId,
        paymentStatus: { in: ['pending', 'partial'] },
      },
      include: {
        branch: { select: { id: true, name: true } },
        payments: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalDebt = sales.reduce(
      (sum, s) => sum + (Number(s.finalAmount) - Number(s.paidAmount)),
      0,
    );

    return {
      client,
      totalDebt: +totalDebt.toFixed(2),
      unpaidSalesCount: sales.length,
      sales: sales.map((sale) => ({
        saleId: sale.id,
        branch: sale.branch,
        totalAmount: Number(sale.finalAmount),
        paidAmount: Number(sale.paidAmount),
        debtAmount: +(Number(sale.finalAmount) - Number(sale.paidAmount)).toFixed(2),
        paymentStatus: sale.paymentStatus,
        createdAt: sale.createdAt,
        ageDays: Math.floor(
          (Date.now() - sale.createdAt.getTime()) / (1000 * 60 * 60 * 24),
        ),
        payments: sale.payments,
      })),
    };
  }
}
