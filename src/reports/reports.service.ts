import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType } from '../generated/prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async salesSummary(tenantId: string, branchId?: string, from?: string, to?: string) {
    const where: any = { tenantId };
    if (branchId) where.branchId = branchId;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const sales = await this.prisma.sale.findMany({ where });

    const totalSales = sales.length;
    const totalAmount = sales.reduce((sum, s) => sum + Number(s.finalAmount), 0);
    const totalPaid = sales.reduce((sum, s) => sum + Number(s.paidAmount), 0);
    const totalDiscount = sales.reduce((sum, s) => sum + Number(s.discountAmount), 0);
    const totalOutstanding = totalAmount - totalPaid;

    return {
      totalSales,
      totalAmount: +totalAmount.toFixed(2),
      totalPaid: +totalPaid.toFixed(2),
      totalDiscount: +totalDiscount.toFixed(2),
      totalOutstanding: +totalOutstanding.toFixed(2),
    };
  }

  async salesByDay(tenantId: string, branchId?: string, from?: string, to?: string) {
    const where: any = { tenantId };
    if (branchId) where.branchId = branchId;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const sales = await this.prisma.sale.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    const grouped: Record<string, { count: number; total: number }> = {};
    for (const sale of sales) {
      const day = sale.createdAt.toISOString().slice(0, 10);
      if (!grouped[day]) grouped[day] = { count: 0, total: 0 };
      grouped[day].count++;
      grouped[day].total += Number(sale.finalAmount);
    }

    return Object.entries(grouped).map(([date, data]) => ({
      date,
      count: data.count,
      total: +data.total.toFixed(2),
    }));
  }

  async topProducts(tenantId: string, branchId?: string, limit = 10) {
    const where: any = { sale: { tenantId } };
    if (branchId) where.sale.branchId = branchId;

    const items = await this.prisma.saleItem.findMany({
      where,
      include: { product: { select: { id: true, name: true, sku: true } } },
    });

    const productMap: Record<string, { product: any; quantity: number; revenue: number }> = {};
    for (const item of items) {
      const pid = item.productId;
      if (!productMap[pid]) productMap[pid] = { product: item.product, quantity: 0, revenue: 0 };
      productMap[pid].quantity += Number(item.quantity);
      productMap[pid].revenue += Number(item.totalPrice);
    }

    return Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit)
      .map((p) => ({
        ...p.product,
        totalQuantity: +p.quantity.toFixed(2),
        totalRevenue: +p.revenue.toFixed(2),
      }));
  }

  async topSellers(tenantId: string, branchId?: string, from?: string, to?: string) {
    const where: any = { tenantId };
    if (branchId) where.branchId = branchId;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const sales = await this.prisma.sale.findMany({
      where,
      include: { seller: { select: { id: true, fullName: true, phone: true } } },
    });

    const sellerMap: Record<string, { seller: any; count: number; total: number }> = {};
    for (const sale of sales) {
      const sid = sale.sellerId;
      if (!sellerMap[sid]) sellerMap[sid] = { seller: sale.seller, count: 0, total: 0 };
      sellerMap[sid].count++;
      sellerMap[sid].total += Number(sale.finalAmount);
    }

    return Object.values(sellerMap)
      .sort((a, b) => b.total - a.total)
      .map((s) => ({
        ...s.seller,
        salesCount: s.count,
        totalRevenue: +s.total.toFixed(2),
      }));
  }

  async inventoryReport(tenantId: string, branchId?: string) {
    const where: any = { tenantId };

    const items = await this.prisma.inventory.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, sku: true, costPrice: true, sellingPrice: true } },
      },
      orderBy: { quantity: 'asc' },
    });

    const totalItems = items.length;
    const totalStockValue = items.reduce(
      (sum, i) => sum + Number(i.quantity) * Number(i.product.costPrice),
      0,
    );
    const lowStockItems = items.filter(
      (i) => i.minQuantity !== null && Number(i.quantity) <= Number(i.minQuantity),
    );

    return {
      totalItems,
      totalStockValue: +totalStockValue.toFixed(2),
      lowStockCount: lowStockItems.length,
      items: items.map((i) => ({
        inventoryId: i.id,
        product: i.product,
        quantity: Number(i.quantity),
        minQuantity: i.minQuantity ? Number(i.minQuantity) : null,
        isLowStock: i.minQuantity !== null && Number(i.quantity) <= Number(i.minQuantity),
        stockValue: +(Number(i.quantity) * Number(i.product.costPrice)).toFixed(2),
      })),
    };
  }

  async financialSummary(tenantId: string, branchId?: string, from?: string, to?: string) {
    const where: any = { tenantId };
    if (branchId) where.branchId = branchId;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const transactions = await this.prisma.transaction.findMany({ where });

    const income = transactions
      .filter((t) => t.type === TransactionType.income)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = transactions
      .filter((t) => t.type === TransactionType.expense)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Also include sales revenue
    const salesWhere: any = { tenantId };
    if (branchId) salesWhere.branchId = branchId;
    if (from || to) {
      salesWhere.createdAt = {};
      if (from) salesWhere.createdAt.gte = new Date(from);
      if (to) salesWhere.createdAt.lte = new Date(to);
    }

    const sales = await this.prisma.sale.findMany({ where: salesWhere });
    const salesRevenue = sales.reduce((sum, s) => sum + Number(s.finalAmount), 0);

    return {
      salesRevenue: +salesRevenue.toFixed(2),
      otherIncome: +income.toFixed(2),
      totalIncome: +(salesRevenue + income).toFixed(2),
      totalExpenses: +expenses.toFixed(2),
      netProfit: +(salesRevenue + income - expenses).toFixed(2),
      transactionCount: transactions.length,
      salesCount: sales.length,
    };
  }

  async expensesByCategory(tenantId: string, branchId?: string, from?: string, to?: string) {
    const where: any = { tenantId, type: TransactionType.expense };
    if (branchId) where.branchId = branchId;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      include: { expenseCategory: { select: { id: true, name: true } } },
    });

    const categoryMap: Record<string, { category: any; total: number; count: number }> = {};
    for (const tx of transactions) {
      const key = tx.expenseCategoryId || 'uncategorized';
      if (!categoryMap[key])
        categoryMap[key] = {
          category: tx.expenseCategory || { id: null, name: 'Uncategorized' },
          total: 0,
          count: 0,
        };
      categoryMap[key].total += Number(tx.amount);
      categoryMap[key].count++;
    }

    return Object.values(categoryMap)
      .sort((a, b) => b.total - a.total)
      .map((c) => ({
        ...c.category,
        totalAmount: +c.total.toFixed(2),
        transactionCount: c.count,
      }));
  }
}
