import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto, UpdateTransactionDto } from './dto';

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

  async update(id: string, tenantId: string, dto: UpdateTransactionDto) {
    await this.findOne(id, tenantId);
    return this.prisma.transaction.update({
      where: { id },
      data: {
        ...(dto.branchId && { branchId: dto.branchId }),
        ...(dto.type && { type: dto.type as any }),
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.expenseCategoryId !== undefined && { expenseCategoryId: dto.expenseCategoryId }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
      include: {
        expenseCategory: true,
        user: { select: { id: true, fullName: true } },
        branch: { select: { id: true, name: true } },
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.transaction.delete({ where: { id } });
  }
}
