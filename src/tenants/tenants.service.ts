import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto, UpdateTenantDto } from './dto';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateTenantDto) {
    return this.prisma.tenant.create({ data: dto as any });
  }

  findAll() {
    return this.prisma.tenant.findMany({
      include: { subscriptionPlan: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        subscriptionPlan: true,
        branches: true,
        _count: { select: { users: true, products: true } },
      },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async update(id: string, dto: UpdateTenantDto) {
    await this.findOne(id);
    return this.prisma.tenant.update({
      where: { id },
      data: dto as any,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.tenant.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
