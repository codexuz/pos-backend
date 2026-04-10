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
import { Lang } from './telegram.i18n';

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

  async updateInventory(id: string, data: { quantity?: number; minQuantity?: number }) {
    return this.inventoryService.update(id, data as any);
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

  // ─── Sales ────────────────────────────────────────────────────────

  async getRecentSales(tenantId: string, limit = 10) {
    const sales = await this.salesService.findAll(tenantId);
    return sales.slice(0, limit);
  }

  async getSale(tenantId: string, saleId: string) {
    return this.salesService.findOne(tenantId, saleId);
  }

  async createSale(tenantId: string, branchId: string, sellerId: string, data: {
    items: { productId: string; quantity: number; unitPrice: number }[];
    clientId?: string;
    paymentMethod?: string;
    paidAmount?: number;
    notes?: string;
  }) {
    return this.salesService.create(tenantId, branchId, sellerId, {
      branchId,
      items: data.items,
      clientId: data.clientId,
      paymentMethod: data.paymentMethod as any,
      paidAmount: data.paidAmount,
      notes: data.notes,
    } as any);
  }

  // ─── Debts (Read-only) ───────────────────────────────────────────

  async getDebtSummary(tenantId: string) {
    return this.debtsService.summary(tenantId);
  }

  async getDebts(tenantId: string) {
    return this.debtsService.findAll(tenantId);
  }

  async getClientBalances(tenantId: string) {
    return this.debtsService.clientBalances(tenantId);
  }
}
