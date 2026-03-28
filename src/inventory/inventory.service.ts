import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateInventoryDto, UpdateInventoryDto } from './dto';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  create(tenantId: string, dto: CreateInventoryDto) {
    return this.prisma.inventory.create({
      data: { ...dto, tenantId } as any,
      include: {
        product: { select: { id: true, name: true, sku: true } },
        tenant: { select: { id: true, name: true } },
      },
    });
  }

  findAll(tenantId: string) {
    return this.prisma.inventory.findMany({
      where: { tenantId },
      include: {
        product: {
          select: { id: true, name: true, sku: true, barcode: true, sellingPrice: true, unit: true },
        },
      },
      orderBy: { product: { name: 'asc' } },
    });
  }

  findLowStock(tenantId: string) {
    return this.prisma.$queryRaw`
      SELECT i.*, p.name as product_name, p.sku
      FROM inventory i
      JOIN products p ON p.id = i.product_id
      WHERE i.tenant_id = ${tenantId}::uuid
        AND i.quantity <= i.min_quantity
      ORDER BY i.quantity ASC
    `;
  }

  async findOne(id: string) {
    const inventory = await this.prisma.inventory.findUnique({
      where: { id },
      include: {
        product: { select: { id: true, name: true, sku: true } },
        tenant: { select: { id: true, name: true } },
      },
    });
    if (!inventory) throw new NotFoundException('Inventory record not found');
    return inventory;
  }

  async update(id: string, dto: UpdateInventoryDto) {
    const inventory = await this.findOne(id);
    const updated = await this.prisma.inventory.update({
      where: { id },
      data: dto as any,
      include: {
        product: { select: { id: true, name: true, sku: true } },
        tenant: { select: { id: true, name: true } },
      },
    });

    // Check low stock after manual update
    this.checkAndNotifyLowStock(inventory.tenantId, [updated.productId]).catch(
      (err) => this.logger.error('Failed to send low-stock notification', err),
    );

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.inventory.delete({ where: { id } });
  }

  /**
   * Check if any of the given products are low in stock and notify the tenant owner.
   * Call this after any operation that decreases inventory (sales, manual updates, etc.)
   */
  async checkAndNotifyLowStock(tenantId: string, productIds: string[]): Promise<void> {
    if (productIds.length === 0) return;

    // Find inventory records where quantity <= minQuantity
    const lowStockItems = await this.prisma.inventory.findMany({
      where: {
        tenantId,
        productId: { in: productIds },
        minQuantity: { not: null },
      },
      include: {
        product: { select: { id: true, name: true, sku: true } },
      },
    });

    // Filter to only items actually below threshold
    const alertItems = lowStockItems.filter(
      (item) => item.minQuantity !== null && Number(item.quantity) <= Number(item.minQuantity),
    );

    if (alertItems.length === 0) return;

    // Find tenant owner
    const owner = await this.prisma.user.findFirst({
      where: { tenantId, role: 'owner', isActive: true },
      select: { id: true, expoPushToken: true },
    });

    if (!owner?.expoPushToken) return;

    const itemsList = alertItems
      .map((item) => `${item.product.name}: ${Number(item.quantity)} left`)
      .join('\n');

    await this.notifications.sendToUser(owner.id, {
      title: '⚠️ Low Stock Alert',
      body: alertItems.length === 1
        ? `${alertItems[0].product.name} is running low — only ${Number(alertItems[0].quantity)} left`
        : `${alertItems.length} products are running low:\n${itemsList}`,
      data: { type: 'low_stock', productIds: alertItems.map((i) => i.product.id) },
    });
  }
}
