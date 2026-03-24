import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  create(tenantId: string, userId: string, dto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        tenantId,
        userId,
        branchId: dto.branchId,
        type: dto.type as any,
        amount: dto.amount,
        expenseCategoryId: dto.expenseCategoryId,
        description: dto.description,
      },
      include: {
        expenseCategory: true,
        user: { select: { id: true, fullName: true } },
        branch: { select: { id: true, name: true } },
      },
    });
  }

  findAll(tenantId: string, branchId?: string, type?: string) {
    return this.prisma.transaction.findMany({
      where: {
        tenantId,
        ...(branchId && { branchId }),
        ...(type && { type: type as any }),
      },
      include: {
        expenseCategory: true,
        user: { select: { id: true, fullName: true } },
        branch: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, tenantId },
      include: {
        expenseCategory: true,
        user: { select: { id: true, fullName: true } },
        branch: { select: { id: true, name: true } },
      },
    });
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }
}
