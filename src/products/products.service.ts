import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import { CreateProductDto, UpdateProductDto } from './dto';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private minio: MinioService,
  ) {}

  async create(tenantId: string, dto: CreateProductDto, image?: Express.Multer.File) {
    const { quantity, minQuantity, ...productData } = dto;

    if (image) {
      productData.imageUrl = await this.minio.uploadImage(
        image.buffer,
        image.originalname,
        image.mimetype,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: { ...productData, tenantId } as any,
        include: { category: true, unit: true },
      });

      await tx.inventory.create({
        data: {
          productId: product.id,
          tenantId,
          quantity: quantity ?? 0,
          minQuantity: minQuantity ?? 0,
        },
      });

      return tx.product.findUnique({
        where: { id: product.id },
        include: { category: true, unit: true, inventory: true },
      }).then(product => {
        const inventory = product.inventory && product.inventory.length > 0 ? product.inventory[0] : null;
        return {
          ...product,
          inventoryStatus: inventory && inventory.quantity <= (inventory.minQuantity || 0) ? 'low-stock' : 'in-stock'
        };
      });
    });
  }

  findAll(tenantId: string, search?: string) {
    return this.prisma.product.findMany({
      where: {
        tenantId,
        isActive: true,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { sku: { contains: search, mode: 'insensitive' as const } },
            { barcode: { contains: search, mode: 'insensitive' as const } },
          ],
        }),
      },
      include: { category: true, unit: true, inventory: true },
      orderBy: { createdAt: 'desc' },
    }).then(products => products.map(product => {
      const inventory = product.inventory && product.inventory.length > 0 ? product.inventory[0] : null;
      return {
        ...product,
        inventoryStatus: inventory && inventory.quantity <= (inventory.minQuantity || 0) ? 'low-stock' : 'in-stock'
      };
    }));
  }

  async findOne(id: string, tenantId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId },
      include: {
        category: true,
        unit: true,
        inventory: true,
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    const inventory = product.inventory && product.inventory.length > 0 ? product.inventory[0] : null;
    return {
      ...product,
      inventoryStatus: inventory && inventory.quantity <= (inventory.minQuantity || 0) ? 'low-stock' : 'in-stock'
    };
  }

  async update(id: string, tenantId: string, dto: UpdateProductDto) {
    await this.findOne(id, tenantId);
    return this.prisma.product.update({
      where: { id },
      data: dto as any,
      include: { category: true, unit: true },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async uploadImage(id: string, tenantId: string, file: Express.Multer.File) {
    const product = await this.findOne(id, tenantId);

    if (product.imageUrl) {
      await this.minio.deleteImage(product.imageUrl);
    }

    const objectName = await this.minio.uploadImage(
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    return this.prisma.product.update({
      where: { id },
      data: { imageUrl: objectName },
      include: { category: true, unit: true },
    });
  }

  async removeImage(id: string, tenantId: string) {
    const product = await this.findOne(id, tenantId);

    if (product.imageUrl) {
      await this.minio.deleteImage(product.imageUrl);
    }

    return this.prisma.product.update({
      where: { id },
      data: { imageUrl: null },
      include: { category: true, unit: true },
    });
  }

  async getImageUrl(objectName: string): Promise<string> {
    return this.minio.getImageUrl(objectName);
  }
}
