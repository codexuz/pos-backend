import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionPlanDto, UpdateSubscriptionPlanDto } from './dto';

@Injectable()
export class SubscriptionPlansService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateSubscriptionPlanDto) {
    return this.prisma.subscriptionPlan.create({ data: dto as any });
  }

  findAll() {
    return this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
  }

  async findOne(id: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
      include: { tenants: { select: { id: true, name: true } } },
    });
    if (!plan) throw new NotFoundException('Subscription plan not found');
    return plan;
  }

  async update(id: string, dto: UpdateSubscriptionPlanDto) {
    await this.findOne(id);
    return this.prisma.subscriptionPlan.update({
      where: { id },
      data: dto as any,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.subscriptionPlan.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
