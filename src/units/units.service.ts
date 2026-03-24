import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUnitDto, UpdateUnitDto } from './dto';

@Injectable()
export class UnitsService {
  constructor(private prisma: PrismaService) {}

  create(tenantId: string, dto: CreateUnitDto) {
    return this.prisma.unit.create({
      data: { ...dto, tenantId },
    });
  }

  findAll(tenantId: string) {
    return this.prisma.unit.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const unit = await this.prisma.unit.findFirst({
      where: { id, tenantId },
    });
    if (!unit) throw new NotFoundException('Unit not found');
    return unit;
  }

  async update(id: string, tenantId: string, dto: UpdateUnitDto) {
    await this.findOne(id, tenantId);
    return this.prisma.unit.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.unit.delete({ where: { id } });
  }
}
