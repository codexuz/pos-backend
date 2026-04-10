import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportsService } from '../reports/reports.service';
import { ProductsService } from '../products/products.service';
import { SalesService } from '../sales/sales.service';
import { InventoryService } from '../inventory/inventory.service';
import { ClientsService } from '../clients/clients.service';
import { DebtsService } from '../debts/debts.service';
import { BranchesService } from '../branches/branches.service';
import { CategoriesService } from '../categories/categories.service';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(
    private prisma: PrismaService,
    private reportsService: ReportsService,
    private productsService: ProductsService,
    private salesService: SalesService,
    private inventoryService: InventoryService,
    private clientsService: ClientsService,
    private debtsService: DebtsService,
    private branchesService: BranchesService,
    private categoriesService: CategoriesService,
    private transactionsService: TransactionsService,
  ) {}

  // ─── Auth & State ──────────────────────────────────────────────────

  async findOrCreateTelegramUser(chatId: string) {
    return this.prisma.telegramUser.upsert({
      where: { chatId },
      update: {},
      create: { chatId },
    });
  }

  async getTelegramUser(chatId: string) {
    return this.prisma.telegramUser.findUnique({ where: { chatId } });
  }

  async setState(chatId: string, state: string, stateData?: any) {
    await this.prisma.telegramUser.update({
      where: { chatId },
      data: { state, stateData: stateData ?? null },
    });
  }

  async linkUserByPhone(chatId: string, phone: string) {
    const normalizedPhone = phone.replace(/[^0-9+]/g, '');

    const user = await this.prisma.user.findFirst({
      where: {
        phone: normalizedPhone,
        isActive: true,
        role: { in: ['owner', 'super_admin'] },
      },
      include: { tenant: true },
    });

    if (!user || !user.tenantId) return null;

    await this.prisma.telegramUser.update({
      where: { chatId },
      data: {
        userId: user.id,
        tenantId: user.tenantId,
        phone: normalizedPhone,
        state: 'idle',
        stateData: null,
      },
    });

    return user;
  }

  async isAuthenticated(chatId: string): Promise<boolean> {
    const tgUser = await this.getTelegramUser(chatId);
    return !!(tgUser?.userId && tgUser?.tenantId);
  }

  async logout(chatId: string) {
    await this.prisma.telegramUser.update({
      where: { chatId },
      data: { userId: null, tenantId: null, phone: null, state: 'idle', stateData: null },
    });
  }

  // ─── Dashboard / Reports ──────────────────────────────────────────

  async getDashboard(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const from = today.toISOString();

    const [salesSummary, financialSummary, debtSummary] = await Promise.all([
      this.reportsService.salesSummary(tenantId, undefined, from),
      this.reportsService.financialSummary(tenantId, undefined, from),
      this.debtsService.summary(tenantId),
    ]);

    return { salesSummary, financialSummary, debtSummary };
  }

  async getSalesSummary(tenantId: string, from?: string, to?: string) {
    return this.reportsService.salesSummary(tenantId, undefined, from, to);
  }

  async getFinancialSummary(tenantId: string, from?: string, to?: string) {
    return this.reportsService.financialSummary(tenantId, undefined, from, to);
  }

  async getTopProducts(tenantId: string, limit = 10) {
    return this.reportsService.topProducts(tenantId, undefined, limit);
  }

  async getTopSellers(tenantId: string) {
    return this.reportsService.topSellers(tenantId);
  }

  // ─── Products ─────────────────────────────────────────────────────

  async getProducts(tenantId: string, search?: string) {
    return this.productsService.findAll(tenantId, search);
  }

  async getProduct(tenantId: string, productId: string) {
    return this.productsService.findOne(productId, tenantId);
  }

  // ─── Sales ────────────────────────────────────────────────────────

  async getRecentSales(tenantId: string, limit = 10) {
    const sales = await this.salesService.findAll(tenantId);
    return sales.slice(0, limit);
  }

  async getSale(tenantId: string, saleId: string) {
    return this.salesService.findOne(tenantId, saleId);
  }

  // ─── Inventory ────────────────────────────────────────────────────

  async getInventory(tenantId: string) {
    return this.inventoryService.findAll(tenantId);
  }

  async getLowStock(tenantId: string) {
    const result = await this.inventoryService.findLowStock(tenantId);
    return result as any[];
  }

  // ─── Clients ──────────────────────────────────────────────────────

  async getClients(tenantId: string, search?: string) {
    return this.clientsService.findAll(tenantId, search);
  }

  // ─── Debts ────────────────────────────────────────────────────────

  async getDebtSummary(tenantId: string) {
    return this.debtsService.summary(tenantId);
  }

  async getDebts(tenantId: string) {
    return this.debtsService.findAll(tenantId);
  }

  async getClientBalances(tenantId: string) {
    return this.debtsService.clientBalances(tenantId);
  }

  // ─── Branches ─────────────────────────────────────────────────────

  async getBranches(tenantId: string) {
    return this.branchesService.findAll(tenantId);
  }

  // ─── Categories ───────────────────────────────────────────────────

  async getCategories(tenantId: string) {
    return this.categoriesService.findAll(tenantId);
  }

  // ─── Transactions ─────────────────────────────────────────────────

  async getTransactions(tenantId: string, type?: string) {
    return this.transactionsService.findAll(tenantId, undefined, type);
  }
}
