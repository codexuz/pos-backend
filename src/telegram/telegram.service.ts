import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportsService } from '../reports/reports.service';
import { ProductsService } from '../products/products.service';
import { InventoryService } from '../inventory/inventory.service';
import { ClientsService } from '../clients/clients.service';
import { BranchesService } from '../branches/branches.service';
import { CategoriesService } from '../categories/categories.service';
import { TransactionsService } from '../transactions/transactions.service';
import { Lang } from './telegram.i18n';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(
    private prisma: PrismaService,
    private reportsService: ReportsService,
    private productsService: ProductsService,
    private inventoryService: InventoryService,
    private clientsService: ClientsService,
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

  async getLanguage(chatId: string): Promise<Lang> {
    const tgUser = await this.getTelegramUser(chatId);
    return (tgUser?.language as Lang) ?? 'en';
  }

  async setLanguage(chatId: string, lang: Lang) {
    await this.prisma.telegramUser.update({
      where: { chatId },
      data: { language: lang as any },
    });
  }

  async linkUserByPhone(chatId: string, phone: string) {
    const digitsOnly = phone.replace(/[^0-9]/g, '');
    const variants = [
      phone.replace(/[^0-9+]/g, ''),
      `+${digitsOnly}`,
      digitsOnly,
      digitsOnly.replace(/^998/, ''),
    ];

    const user = await this.prisma.user.findFirst({
      where: {
        phone: { in: [...new Set(variants)] },
        isActive: true,
      },
      include: { tenant: true },
    });

    if (!user || !user.tenantId) return null;

    await this.prisma.telegramUser.update({
      where: { chatId },
      data: {
        userId: user.id,
        tenantId: user.tenantId,
        phone: user.phone,
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

  async getUserRole(chatId: string): Promise<string | null> {
    const tgUser = await this.getTelegramUser(chatId);
    if (!tgUser?.userId) return null;
    const user = await this.prisma.user.findUnique({ where: { id: tgUser.userId }, select: { role: true } });
    return user?.role ?? null;
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

    const [financialSummary, inventoryReport] = await Promise.all([
      this.reportsService.financialSummary(tenantId, undefined, from),
      this.reportsService.inventoryReport(tenantId),
    ]);

    return { financialSummary, inventoryReport };
  }

  async getFinancialSummary(tenantId: string, from?: string, to?: string) {
    return this.reportsService.financialSummary(tenantId, undefined, from, to);
  }

  async getTopProducts(tenantId: string, limit = 10) {
    return this.reportsService.topProducts(tenantId, undefined, limit);
  }

  // ─── Products (CRUD) ─────────────────────────────────────────────

  async getProducts(tenantId: string, search?: string) {
    return this.productsService.findAll(tenantId, search);
  }

  async getProduct(tenantId: string, productId: string) {
    return this.productsService.findOne(productId, tenantId);
  }

  async createProduct(tenantId: string, data: { name: string; sellingPrice: number; costPrice?: number; categoryId?: string }) {
    return this.productsService.create(tenantId, {
      name: data.name,
      sellingPrice: data.sellingPrice,
      costPrice: data.costPrice,
      categoryId: data.categoryId,
    } as any);
  }

  async updateProduct(tenantId: string, productId: string, data: Record<string, any>) {
    return this.productsService.update(productId, tenantId, data as any);
  }

  async deleteProduct(tenantId: string, productId: string) {
    return this.productsService.remove(productId, tenantId);
  }

  // ─── Clients (CRUD) ──────────────────────────────────────────────

  async getClients(tenantId: string, search?: string) {
    return this.clientsService.findAll(tenantId, search);
  }

  async getClient(tenantId: string, clientId: string) {
    return this.clientsService.findOne(tenantId, clientId);
  }

  async createClient(tenantId: string, data: { fullName: string; phone?: string; address?: string; notes?: string }) {
    return this.clientsService.create(tenantId, data as any);
  }

  async updateClient(tenantId: string, clientId: string, data: Record<string, any>) {
    return this.clientsService.update(tenantId, clientId, data as any);
  }

  async deleteClient(tenantId: string, clientId: string) {
    return this.clientsService.remove(tenantId, clientId);
  }

  // ─── Branches (CRUD) ─────────────────────────────────────────────

  async getBranches(tenantId: string) {
    return this.branchesService.findAll(tenantId);
  }

  async getBranch(tenantId: string, branchId: string) {
    return this.branchesService.findOne(branchId, tenantId);
  }

  async createBranch(tenantId: string, data: { name: string; address?: string; phone?: string }) {
    return this.branchesService.create(tenantId, data as any);
  }

  async updateBranch(tenantId: string, branchId: string, data: Record<string, any>) {
    return this.branchesService.update(branchId, tenantId, data as any);
  }

  async deleteBranch(tenantId: string, branchId: string) {
    return this.branchesService.remove(branchId, tenantId);
  }

  // ─── Categories (CRUD) ───────────────────────────────────────────

  async getCategories(tenantId: string) {
    return this.categoriesService.findAll(tenantId);
  }

  async getCategory(tenantId: string, categoryId: string) {
    return this.categoriesService.findOne(categoryId, tenantId);
  }

  async createCategory(tenantId: string, data: { name: string; description?: string }) {
    return this.categoriesService.create(tenantId, data as any);
  }

  async updateCategory(tenantId: string, categoryId: string, data: Record<string, any>) {
    return this.categoriesService.update(categoryId, tenantId, data as any);
  }

  async deleteCategory(tenantId: string, categoryId: string) {
    return this.categoriesService.remove(categoryId, tenantId);
  }

  // ─── Inventory (CRUD) ────────────────────────────────────────────

  async getInventory(tenantId: string) {
    return this.inventoryService.findAll(tenantId);
  }

  async getInventoryItem(id: string) {
    return this.inventoryService.findOne(id);
  }

  async getLowStock(tenantId: string) {
    return this.inventoryService.findLowStock(tenantId) as Promise<any[]>;
  }

  async createInventory(tenantId: string, data: { productId: string; quantity: number; minQuantity?: number }) {
    return this.inventoryService.create(tenantId, data as any);
  }

  async updateInventory(id: string, tenantId: string, userId: string, data: { quantity?: number; minQuantity?: number }) {
    return this.inventoryService.adjust(id, tenantId, userId, data as any);
  }

  async deleteInventory(id: string) {
    return this.inventoryService.remove(id);
  }

  // ─── Transactions (CRUD) ─────────────────────────────────────────

  async getTransactions(tenantId: string, type?: string) {
    return this.transactionsService.findAll(tenantId, undefined, type);
  }

  async getTransaction(tenantId: string, transactionId: string) {
    return this.transactionsService.findOne(transactionId, tenantId);
  }

  async createTransaction(tenantId: string, userId: string, data: { branchId: string; type: string; amount: number; description?: string }) {
    return this.transactionsService.create(tenantId, userId, data as any);
  }

  async updateTransaction(tenantId: string, transactionId: string, data: Record<string, any>) {
    return this.transactionsService.update(transactionId, tenantId, data as any);
  }

  async deleteTransaction(tenantId: string, transactionId: string) {
    return this.transactionsService.remove(transactionId, tenantId);
  }

  // ─── Compatibility shims (telegram.update.ts still uses these names) ─

  /** Alias → financialSummary */
  async getSalesSummary(tenantId: string, from?: string, to?: string) {
    return this.reportsService.financialSummary(tenantId, undefined, from, to);
  }

  /** Replaces old debtsService.summary — returns client outcome balance totals */
  async getDebtSummary(tenantId: string) {
    const balances = await this.reportsService.clientBalances(tenantId);
    const totalDebt = balances.reduce((s, b) => s + (b.balanceUzs < 0 ? Math.abs(b.balanceUzs) : 0), 0);
    return { totalDebt: +totalDebt.toFixed(2), clientCount: balances.length };
  }

  /** Replaces old debtsService.clientBalances */
  async getClientBalances(tenantId: string) {
    return this.reportsService.clientBalances(tenantId);
  }

  /** Replaces old salesService.findAll — returns recent transactions instead */
  async getRecentSales(tenantId: string, limit = 10) {
    return this.transactionsService.findAll(tenantId, undefined, undefined);
  }

  /** Replaces old salesService.create — creates a client income transaction */
  async createSale(
    tenantId: string,
    branchId: string,
    userId: string,
    data: {
      items?: { productId: string; quantity: number; unitPrice: number }[];
      clientId?: string;
      paidAmount?: number;
      notes?: string;
    },
  ) {
    const total = data.paidAmount ??
      (data.items?.reduce((s, i) => s + i.quantity * i.unitPrice, 0) ?? 0);

    return this.transactionsService.create(tenantId, userId, {
      branchId,
      type: 'income',
      amount: total,
      description: data.notes ?? 'POS transaction',
    } as any);
  }
}
