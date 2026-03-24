import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto, UpdateBranchDto } from './dto';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  create(tenantId: string, dto: CreateBranchDto) {
    return this.prisma.branch.create({
      data: { ...dto, tenantId },
    });
  }

  findAll(tenantId: string) {
    return this.prisma.branch.findMany({
      where: { tenantId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const branch = await this.prisma.branch.findFirst({
      where: { id, tenantId },
      include: {
        _count: { select: { users: true, inventory: true, sales: true } },
      },
    });
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async update(id: string, tenantId: string, dto: UpdateBranchDto) {
    await this.findOne(id, tenantId);
    return this.prisma.branch.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.branch.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
