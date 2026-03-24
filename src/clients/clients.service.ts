import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto, UpdateClientDto } from './dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  create(tenantId: string, dto: CreateClientDto) {
    return this.prisma.client.create({
      data: { ...dto, tenantId },
    });
  }

  findAll(tenantId: string, search?: string) {
    return this.prisma.client.findMany({
      where: {
        tenantId,
        ...(search && {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' as const } },
            { phone: { contains: search, mode: 'insensitive' as const } },
          ],
        }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, tenantId },
      include: {
        sales: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async update(id: string, tenantId: string, dto: UpdateClientDto) {
    await this.findOne(id, tenantId);
    return this.prisma.client.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.client.delete({ where: { id } });
  }
}
