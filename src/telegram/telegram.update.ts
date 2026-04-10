import { Logger } from '@nestjs/common';
import { Update, Ctx, Start, Help, Command, On, Action } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { TelegramService } from './telegram.service';

interface TgContext extends Context {
  match?: RegExpExecArray;
}

@Update()
export class TelegramUpdate {
  private readonly logger = new Logger(TelegramUpdate.name);

  constructor(private readonly telegramService: TelegramService) {}

  // ─── Helpers ──────────────────────────────────────────────────────

  private getChatId(ctx: TgContext): string {
    return String(ctx.chat?.id ?? ctx.from?.id);
  }

  private async requireAuth(ctx: TgContext): Promise<{ userId: string; tenantId: string } | null> {
    const chatId = this.getChatId(ctx);
    const tgUser = await this.telegramService.getTelegramUser(chatId);

    if (!tgUser?.userId || !tgUser?.tenantId) {
      await ctx.reply(
        '🔒 You are not logged in. Please use /login to authenticate first.',
      );
      return null;
    }

    return { userId: tgUser.userId, tenantId: tgUser.tenantId };
  }

  private formatCurrency(amount: number): string {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  // ─── /start ───────────────────────────────────────────────────────

  @Start()
  async onStart(@Ctx() ctx: TgContext) {
    const chatId = this.getChatId(ctx);
    await this.telegramService.findOrCreateTelegramUser(chatId);

    const isAuth = await this.telegramService.isAuthenticated(chatId);

    if (isAuth) {
      await ctx.reply(
        '👋 Welcome back! Use the menu below to manage your POS system.',
        this.mainMenuKeyboard(),
      );
    } else {
      await ctx.reply(
        '👋 Welcome to POS Management Bot!\n\n' +
        'This bot lets you manage your Point of Sale system directly from Telegram.\n\n' +
        '🔐 Please log in with your phone number to get started.\n' +
        'Use /login to authenticate.',
      );
    }
  }

  // ─── /help ────────────────────────────────────────────────────────

  @Help()
  async onHelp(@Ctx() ctx: TgContext) {
    await ctx.reply(
      '📖 *POS Bot Commands*\n\n' +
      '🔐 *Authentication*\n' +
      '/login — Log in with phone number\n' +
      '/logout — Log out\n\n' +
      '📊 *Reports*\n' +
      '/dashboard — Today\'s overview\n' +
      '/sales\\_report — Sales summary\n' +
      '/financial — Financial summary\n' +
      '/top\\_products — Best selling products\n' +
      '/top\\_sellers — Best sellers\n\n' +
      '📦 *Products & Inventory*\n' +
      '/products — List products\n' +
      '/search\\_product — Search products\n' +
      '/low\\_stock — Low stock alerts\n' +
      '/categories — List categories\n\n' +
      '🛒 *Sales & Payments*\n' +
      '/recent\\_sales — Recent sales\n' +
      '/debts — Debt summary\n' +
      '/client\\_balances — Client balances\n\n' +
      '👥 *Other*\n' +
      '/clients — List clients\n' +
      '/branches — List branches\n' +
      '/transactions — Recent transactions\n',
      { parse_mode: 'Markdown' },
    );
  }

  // ─── /login ───────────────────────────────────────────────────────

  @Command('login')
  async onLogin(@Ctx() ctx: TgContext) {
    const chatId = this.getChatId(ctx);
    const isAuth = await this.telegramService.isAuthenticated(chatId);

    if (isAuth) {
      await ctx.reply('✅ You are already logged in. Use /logout to switch accounts.');
      return;
    }

    await this.telegramService.findOrCreateTelegramUser(chatId);
    await this.telegramService.setState(chatId, 'awaiting_phone');

    await ctx.reply(
      '📱 Please share your phone number to log in.\n\n' +
      'You can either:\n' +
      '• Tap the button below to share your contact\n' +
      '• Type your phone number (e.g. +998901234567)',
      Markup.keyboard([
        [Markup.button.contactRequest('📱 Share Phone Number')],
        ['❌ Cancel'],
      ]).resize().oneTime(),
    );
  }

  // ─── /logout ──────────────────────────────────────────────────────

  @Command('logout')
  async onLogout(@Ctx() ctx: TgContext) {
    const chatId = this.getChatId(ctx);
    await this.telegramService.logout(chatId);
    await ctx.reply(
      '👋 You have been logged out. Use /login to authenticate again.',
      Markup.removeKeyboard(),
    );
  }

  // ─── Handle Contact / Phone ───────────────────────────────────────

  @On('contact')
  async onContact(@Ctx() ctx: TgContext) {
    const chatId = this.getChatId(ctx);
    const tgUser = await this.telegramService.getTelegramUser(chatId);

    if (tgUser?.state !== 'awaiting_phone') return;

    const contact = (ctx.message as any)?.contact;
    if (!contact?.phone_number) return;

    await this.handlePhoneLogin(ctx, chatId, contact.phone_number);
  }

  @On('text')
  async onText(@Ctx() ctx: TgContext) {
    const chatId = this.getChatId(ctx);
    const tgUser = await this.telegramService.getTelegramUser(chatId);

    if (!tgUser) return;

    const text = (ctx.message as any)?.text?.trim();
    if (!text) return;

    if (text === '❌ Cancel') {
      await this.telegramService.setState(chatId, 'idle');
      await ctx.reply('Cancelled.', Markup.removeKeyboard());
      return;
    }

    // Handle state-based input
    if (tgUser.state === 'awaiting_phone') {
      await this.handlePhoneLogin(ctx, chatId, text);
      return;
    }

    if (tgUser.state === 'awaiting_product_search') {
      await this.telegramService.setState(chatId, 'idle');
      const auth = await this.requireAuth(ctx);
      if (!auth) return;

      const products = await this.telegramService.getProducts(auth.tenantId, text);
      if (!products.length) {
        await ctx.reply(`No products found for "${text}".`, Markup.removeKeyboard());
        return;
      }

      const lines = products.slice(0, 20).map((p, i) =>
        `${i + 1}. *${this.escMd(p.name)}*\n   💰 ${this.formatCurrency(Number(p.sellingPrice))} | SKU: ${p.sku || '—'}`,
      );
      await ctx.reply(
        `🔍 *Search results for "${this.escMd(text)}":*\n\n${lines.join('\n\n')}`,
        { parse_mode: 'Markdown', ...Markup.removeKeyboard() },
      );
      return;
    }

    // Handle keyboard button presses
    const commandMap: Record<string, () => Promise<void>> = {
      '📊 Dashboard': () => this.onDashboard(ctx),
      '📈 Sales Report': () => this.onSalesReport(ctx),
      '📦 Products': () => this.onProducts(ctx),
      '⚠️ Low Stock': () => this.onLowStock(ctx),
      '💰 Financial': () => this.onFinancialReport(ctx),
      '📋 Debts': () => this.onDebts(ctx),
      '👥 Clients': () => this.onClients(ctx),
      '🏢 Branches': () => this.onBranches(ctx),
      '📒 Transactions': () => this.onTransactions(ctx),
      '📂 Categories': () => this.onCategories(ctx),
      '❓ Help': () => this.onHelp(ctx),
    };

    const handler = commandMap[text];
    if (handler) await handler();
  }

  private async handlePhoneLogin(ctx: TgContext, chatId: string, phone: string) {
    const user = await this.telegramService.linkUserByPhone(chatId, phone);

    if (!user) {
      await this.telegramService.setState(chatId, 'idle');
      await ctx.reply(
        '❌ No owner/admin account found with this phone number.\n' +
        'Make sure you\'re using the phone number registered in the POS system.',
        Markup.removeKeyboard(),
      );
      return;
    }

    await ctx.reply(
      `✅ Welcome, *${this.escMd(user.fullName)}*!\n\n` +
      `🏢 Tenant: *${this.escMd((user as any).tenant?.name ?? '—')}*\n` +
      `📞 Phone: ${user.phone}\n\n` +
      'You can now manage your POS system from here.',
      { parse_mode: 'Markdown', ...this.mainMenuKeyboard() },
    );
  }

  // ─── /dashboard ───────────────────────────────────────────────────

  @Command('dashboard')
  async onDashboard(@Ctx() ctx: TgContext) {
    const auth = await this.requireAuth(ctx);
    if (!auth) return;

    const { salesSummary, financialSummary, debtSummary } =
      await this.telegramService.getDashboard(auth.tenantId);

    const msg =
      `📊 *Today's Dashboard*\n\n` +
      `🛒 *Sales*\n` +
      `  Sales: ${salesSummary.totalSales}\n` +
      `  Revenue: ${this.formatCurrency(salesSummary.totalAmount)}\n` +
      `  Paid: ${this.formatCurrency(salesSummary.totalPaid)}\n` +
      `  Outstanding: ${this.formatCurrency(salesSummary.totalOutstanding)}\n\n` +
      `💰 *Finance*\n` +
      `  Total Income: ${this.formatCurrency(financialSummary.totalIncome)}\n` +
      `  Expenses: ${this.formatCurrency(financialSummary.totalExpenses)}\n` +
      `  Net Profit: ${this.formatCurrency(financialSummary.netProfit)}\n\n` +
      `📋 *Debts*\n` +
      `  Total Debt: ${this.formatCurrency(debtSummary.totalDebt)}\n` +
      `  Pending: ${debtSummary.pendingCount} | Partial: ${debtSummary.partialCount}`;

    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🔄 Refresh', 'refresh_dashboard')],
        [
          Markup.button.callback('📈 Sales Report', 'sales_report'),
          Markup.button.callback('💰 Financial', 'financial_report'),
        ],
        [
          Markup.button.callback('⚠️ Low Stock', 'low_stock'),
          Markup.button.callback('📋 Debts', 'debts_summary'),
        ],
      ]),
    });
  }

  @Action('refresh_dashboard')
  async onRefreshDashboard(@Ctx() ctx: TgContext) {
    await ctx.answerCbQuery('Refreshing...');
    await this.onDashboard(ctx);
  }

  // ─── /sales_report ────────────────────────────────────────────────

  @Command('sales_report')
  @Action('sales_report')
  async onSalesReport(@Ctx() ctx: TgContext) {
    if ('callbackQuery' in ctx.update) await ctx.answerCbQuery();
    const auth = await this.requireAuth(ctx);
    if (!auth) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const summary = await this.telegramService.getSalesSummary(auth.tenantId, today.toISOString());

    await ctx.reply(
      `📈 *Sales Report (Today)*\n\n` +
      `🛒 Total Sales: *${summary.totalSales}*\n` +
      `💵 Total Amount: *${this.formatCurrency(summary.totalAmount)}*\n` +
      `✅ Paid: *${this.formatCurrency(summary.totalPaid)}*\n` +
      `💼 Seller Profit: *${this.formatCurrency(summary.totalSellerProfit)}*\n` +
      `⏳ Outstanding: *${this.formatCurrency(summary.totalOutstanding)}*`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback('📅 This Week', 'sales_week'),
            Markup.button.callback('📅 This Month', 'sales_month'),
          ],
          [Markup.button.callback('🏆 Top Products', 'top_products')],
          [Markup.button.callback('🔙 Dashboard', 'refresh_dashboard')],
        ]),
      },
    );
  }

  @Action('sales_week')
  async onSalesWeek(@Ctx() ctx: TgContext) {
    await ctx.answerCbQuery();
    const auth = await this.requireAuth(ctx);
    if (!auth) return;

    const from = new Date();
    from.setDate(from.getDate() - 7);
    from.setHours(0, 0, 0, 0);
    const summary = await this.telegramService.getSalesSummary(auth.tenantId, from.toISOString());

    await ctx.reply(
      `📈 *Sales Report (Last 7 Days)*\n\n` +
      `🛒 Total Sales: *${summary.totalSales}*\n` +
      `💵 Total Amount: *${this.formatCurrency(summary.totalAmount)}*\n` +
      `✅ Paid: *${this.formatCurrency(summary.totalPaid)}*\n` +
      `⏳ Outstanding: *${this.formatCurrency(summary.totalOutstanding)}*`,
      { parse_mode: 'Markdown' },
    );
  }

  @Action('sales_month')
  async onSalesMonth(@Ctx() ctx: TgContext) {
    await ctx.answerCbQuery();
    const auth = await this.requireAuth(ctx);
    if (!auth) return;

    const from = new Date();
    from.setDate(1);
    from.setHours(0, 0, 0, 0);
    const summary = await this.telegramService.getSalesSummary(auth.tenantId, from.toISOString());

    await ctx.reply(
      `📈 *Sales Report (This Month)*\n\n` +
      `🛒 Total Sales: *${summary.totalSales}*\n` +
      `💵 Total Amount: *${this.formatCurrency(summary.totalAmount)}*\n` +
      `✅ Paid: *${this.formatCurrency(summary.totalPaid)}*\n` +
      `⏳ Outstanding: *${this.formatCurrency(summary.totalOutstanding)}*`,
      { parse_mode: 'Markdown' },
    );
  }

  // ─── /financial ───────────────────────────────────────────────────

  @Command('financial')
  @Action('financial_report')
  async onFinancialReport(@Ctx() ctx: TgContext) {
    if ('callbackQuery' in ctx.update) await ctx.answerCbQuery();
    const auth = await this.requireAuth(ctx);
    if (!auth) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const summary = await this.telegramService.getFinancialSummary(auth.tenantId, today.toISOString());

    await ctx.reply(
      `💰 *Financial Summary (Today)*\n\n` +
      `📊 Sales Revenue: *${this.formatCurrency(summary.salesRevenue)}*\n` +
      `📥 Other Income: *${this.formatCurrency(summary.otherIncome)}*\n` +
      `📈 Total Income: *${this.formatCurrency(summary.totalIncome)}*\n` +
      `📤 Total Expenses: *${this.formatCurrency(summary.totalExpenses)}*\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `💎 Net Profit: *${this.formatCurrency(summary.netProfit)}*`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback('📅 This Week', 'financial_week'),
            Markup.button.callback('📅 This Month', 'financial_month'),
          ],
          [Markup.button.callback('🔙 Dashboard', 'refresh_dashboard')],
        ]),
      },
    );
  }

  @Action('financial_week')
  async onFinancialWeek(@Ctx() ctx: TgContext) {
    await ctx.answerCbQuery();
    const auth = await this.requireAuth(ctx);
    if (!auth) return;

    const from = new Date();
    from.setDate(from.getDate() - 7);
    from.setHours(0, 0, 0, 0);
    const summary = await this.telegramService.getFinancialSummary(auth.tenantId, from.toISOString());

    await ctx.reply(
      `💰 *Financial Summary (Last 7 Days)*\n\n` +
      `📈 Total Income: *${this.formatCurrency(summary.totalIncome)}*\n` +
      `📤 Expenses: *${this.formatCurrency(summary.totalExpenses)}*\n` +
      `💎 Net Profit: *${this.formatCurrency(summary.netProfit)}*`,
      { parse_mode: 'Markdown' },
    );
  }

  @Action('financial_month')
  async onFinancialMonth(@Ctx() ctx: TgContext) {
    await ctx.answerCbQuery();
    const auth = await this.requireAuth(ctx);
    if (!auth) return;

    const from = new Date();
    from.setDate(1);
    from.setHours(0, 0, 0, 0);
    const summary = await this.telegramService.getFinancialSummary(auth.tenantId, from.toISOString());

    await ctx.reply(
      `💰 *Financial Summary (This Month)*\n\n` +
      `📈 Total Income: *${this.formatCurrency(summary.totalIncome)}*\n` +
      `📤 Expenses: *${this.formatCurrency(summary.totalExpenses)}*\n` +
      `💎 Net Profit: *${this.formatCurrency(summary.netProfit)}*`,
      { parse_mode: 'Markdown' },
    );
  }

  // ─── /top_products ────────────────────────────────────────────────

  @Command('top_products')
  @Action('top_products')
  async onTopProducts(@Ctx() ctx: TgContext) {
    if ('callbackQuery' in ctx.update) await ctx.answerCbQuery();
    const auth = await this.requireAuth(ctx);
    if (!auth) return;

    const products = await this.telegramService.getTopProducts(auth.tenantId);

    if (!products.length) {
      await ctx.reply('No sales data available yet.');
      return;
    }

    const lines = products.map((p, i) => {
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
      return `${medal} *${this.escMd(p.name)}*\n   Qty: ${p.totalQuantity} | Revenue: ${this.formatCurrency(p.totalRevenue)}`;
    });

    await ctx.reply(`🏆 *Top Products*\n\n${lines.join('\n\n')}`, { parse_mode: 'Markdown' });
  }

  // ─── /top_sellers ─────────────────────────────────────────────────

  @Command('top_sellers')
  async onTopSellers(@Ctx() ctx: TgContext) {
    const auth = await this.requireAuth(ctx);
    if (!auth) return;

    const sellers = await this.telegramService.getTopSellers(auth.tenantId);

    if (!sellers.length) {
      await ctx.reply('No sales data available yet.');
      return;
    }

    const lines = sellers.map((s, i) => {
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
      return `${medal} *${this.escMd(s.fullName)}*\n   Sales: ${s.salesCount} | Revenue: ${this.formatCurrency(s.totalRevenue)}`;
    });

    await ctx.reply(`👥 *Top Sellers*\n\n${lines.join('\n\n')}`, { parse_mode: 'Markdown' });
  }

  // ─── /products ────────────────────────────────────────────────────

  @Command('products')
  async onProducts(@Ctx() ctx: TgContext) {
    const auth = await this.requireAuth(ctx);
    if (!auth) return;

    const products = await this.telegramService.getProducts(auth.tenantId);

    if (!products.length) {
      await ctx.reply('No products found.');
      return;
    }

    const lines = products.slice(0, 30).map((p, i) =>
      `${i + 1}. *${this.escMd(p.name)}* — 💰 ${this.formatCurrency(Number(p.sellingPrice))}`,
    );

    const total = products.length;
    const shown = Math.min(30, total);

    await ctx.reply(
      `📦 *Products* (${shown}/${total})\n\n${lines.join('\n')}` +
      (total > 30 ? '\n\n_Use /search\\_product to find specific products_' : ''),
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('🔍 Search', 'search_product')],
        ]),
      },
    );
  }

  // ─── /search_product ──────────────────────────────────────────────

  @Command('search_product')
  @Action('search_product')
  async onSearchProduct(@Ctx() ctx: TgContext) {
    if ('callbackQuery' in ctx.update) await ctx.answerCbQuery();
    const auth = await this.requireAuth(ctx);
    if (!auth) return;

    const chatId = this.getChatId(ctx);
    await this.telegramService.setState(chatId, 'awaiting_product_search');

    await ctx.reply('🔍 Type the product name to search:');
  }

  // ─── /recent_sales ────────────────────────────────────────────────

  @Command('recent_sales')
  async onRecentSales(@Ctx() ctx: TgContext) {
    const auth = await this.requireAuth(ctx);
    if (!auth) return;

    const sales = await this.telegramService.getRecentSales(auth.tenantId, 10);

    if (!sales.length) {
      await ctx.reply('No sales found.');
      return;
    }

    const lines = sales.map((s: any, i: number) => {
      const date = new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const statusIcon = s.paymentStatus === 'paid' ? '✅' : s.paymentStatus === 'partial' ? '⚠️' : '⏳';
      return `${i + 1}. ${statusIcon} ${date} — *${this.formatCurrency(Number(s.finalAmount))}* (${s.paymentStatus})`;
    });

    await ctx.reply(`🛒 *Recent Sales*\n\n${lines.join('\n')}`, { parse_mode: 'Markdown' });
  }

  // ─── /low_stock ───────────────────────────────────────────────────

  @Command('low_stock')
  @Action('low_stock')
  async onLowStock(@Ctx() ctx: TgContext) {
    if ('callbackQuery' in ctx.update) await ctx.answerCbQuery();
    const auth = await this.requireAuth(ctx);
    if (!auth) return;

    const items = await this.telegramService.getLowStock(auth.tenantId);

    if (!items.length) {
      await ctx.reply('✅ No low stock items. Everything looks good!');
      return;
    }

    const lines = items.slice(0, 20).map((item: any, i: number) =>
      `${i + 1}. ⚠️ *${this.escMd(item.product?.name ?? item.productName ?? 'Unknown')}*\n   Stock: ${Number(item.quantity)} / Min: ${Number(item.minQuantity)}`,
    );

    await ctx.reply(
      `⚠️ *Low Stock Alert* (${items.length} items)\n\n${lines.join('\n\n')}`,
      { parse_mode: 'Markdown' },
    );
  }

  // ─── /debts ───────────────────────────────────────────────────────

  @Command('debts')
  @Action('debts_summary')
  async onDebts(@Ctx() ctx: TgContext) {
    if ('callbackQuery' in ctx.update) await ctx.answerCbQuery();
    const auth = await this.requireAuth(ctx);
    if (!auth) return;

    const summary = await this.telegramService.getDebtSummary(auth.tenantId);

    await ctx.reply(
      `📋 *Debt Summary*\n\n` +
      `💸 Total Debt: *${this.formatCurrency(summary.totalDebt)}*\n` +
      `📊 Total Unpaid Sales: *${summary.totalSales}*\n` +
      `⏳ Pending: *${summary.pendingCount}*\n` +
      `⚠️ Partial: *${summary.partialCount}*\n\n` +
      `📅 *Aging*\n` +
      `  Current (0-30d): ${this.formatCurrency(summary.aging.current)}\n` +
      `  31-60 days: ${this.formatCurrency(summary.aging['31-60'])}\n` +
      `  61-90 days: ${this.formatCurrency(summary.aging['61-90'])}\n` +
      `  90+ days: ${this.formatCurrency(summary.aging['90+'])}`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('👥 Client Balances', 'client_balances')],
          [Markup.button.callback('🔙 Dashboard', 'refresh_dashboard')],
        ]),
      },
    );
  }

  // ─── /client_balances ─────────────────────────────────────────────

  @Command('client_balances')
  @Action('client_balances')
  async onClientBalances(@Ctx() ctx: TgContext) {
    if ('callbackQuery' in ctx.update) await ctx.answerCbQuery();
    const auth = await this.requireAuth(ctx);
    if (!auth) return;

    const balances = await this.telegramService.getClientBalances(auth.tenantId);

    if (!balances.length) {
      await ctx.reply('No client debts found.');
      return;
    }

    const lines = balances.slice(0, 20).map((b: any, i: number) =>
      `${i + 1}. *${this.escMd(b.client?.fullName ?? b.fullName ?? '—')}*\n   Debt: ${this.formatCurrency(Number(b.totalDebt ?? b.debtAmount ?? 0))}`,
    );

    await ctx.reply(
      `👥 *Client Balances*\n\n${lines.join('\n\n')}`,
      { parse_mode: 'Markdown' },
    );
  }

  // ─── /clients ─────────────────────────────────────────────────────

  @Command('clients')
  async onClients(@Ctx() ctx: TgContext) {
    const auth = await this.requireAuth(ctx);
    if (!auth) return;

    const clients = await this.telegramService.getClients(auth.tenantId);

    if (!clients.length) {
      await ctx.reply('No clients found.');
      return;
    }

    const lines = clients.slice(0, 20).map((c: any, i: number) =>
      `${i + 1}. *${this.escMd(c.fullName)}* — 📞 ${c.phone || '—'}`,
    );

    await ctx.reply(
      `👥 *Clients* (${Math.min(20, clients.length)}/${clients.length})\n\n${lines.join('\n')}`,
      { parse_mode: 'Markdown' },
    );
  }

  // ─── /branches ────────────────────────────────────────────────────

  @Command('branches')
  async onBranches(@Ctx() ctx: TgContext) {
    const auth = await this.requireAuth(ctx);
    if (!auth) return;

    const branches = await this.telegramService.getBranches(auth.tenantId);

    if (!branches.length) {
      await ctx.reply('No branches found.');
      return;
    }

    const lines = branches.map((b: any, i: number) =>
      `${i + 1}. *${this.escMd(b.name)}*${b.address ? `\n   📍 ${this.escMd(b.address)}` : ''}${b.phone ? `\n   📞 ${b.phone}` : ''}`,
    );

    await ctx.reply(`🏢 *Branches*\n\n${lines.join('\n\n')}`, { parse_mode: 'Markdown' });
  }

  // ─── /categories ──────────────────────────────────────────────────

  @Command('categories')
  async onCategories(@Ctx() ctx: TgContext) {
    const auth = await this.requireAuth(ctx);
    if (!auth) return;

    const categories = await this.telegramService.getCategories(auth.tenantId);

    if (!categories.length) {
      await ctx.reply('No categories found.');
      return;
    }

    const lines = categories.map((c: any, i: number) =>
      `${i + 1}. *${this.escMd(c.name)}*${c.description ? ` — ${this.escMd(c.description)}` : ''}`,
    );

    await ctx.reply(`📂 *Categories*\n\n${lines.join('\n')}`, { parse_mode: 'Markdown' });
  }

  // ─── /transactions ────────────────────────────────────────────────

  @Command('transactions')
  async onTransactions(@Ctx() ctx: TgContext) {
    const auth = await this.requireAuth(ctx);
    if (!auth) return;

    const transactions = await this.telegramService.getTransactions(auth.tenantId);

    if (!transactions.length) {
      await ctx.reply('No transactions found.');
      return;
    }

    const lines = transactions.slice(0, 15).map((t: any, i: number) => {
      const icon = t.type === 'income' ? '📥' : '📤';
      const date = new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${i + 1}. ${icon} ${date} — *${this.formatCurrency(Number(t.amount))}* (${t.type})${t.description ? `\n   ${this.escMd(t.description)}` : ''}`;
    });

    await ctx.reply(
      `📒 *Recent Transactions*\n\n${lines.join('\n\n')}`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback('📥 Income Only', 'txn_income'),
            Markup.button.callback('📤 Expenses Only', 'txn_expense'),
          ],
        ]),
      },
    );
  }

  @Action('txn_income')
  async onTxnIncome(@Ctx() ctx: TgContext) {
    await ctx.answerCbQuery();
    const auth = await this.requireAuth(ctx);
    if (!auth) return;

    const transactions = await this.telegramService.getTransactions(auth.tenantId, 'income');
    if (!transactions.length) {
      await ctx.reply('No income transactions found.');
      return;
    }

    const lines = transactions.slice(0, 15).map((t: any, i: number) => {
      const date = new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${i + 1}. 📥 ${date} — *${this.formatCurrency(Number(t.amount))}*${t.description ? ` — ${this.escMd(t.description)}` : ''}`;
    });

    await ctx.reply(`📥 *Income Transactions*\n\n${lines.join('\n')}`, { parse_mode: 'Markdown' });
  }

  @Action('txn_expense')
  async onTxnExpense(@Ctx() ctx: TgContext) {
    await ctx.answerCbQuery();
    const auth = await this.requireAuth(ctx);
    if (!auth) return;

    const transactions = await this.telegramService.getTransactions(auth.tenantId, 'expense');
    if (!transactions.length) {
      await ctx.reply('No expense transactions found.');
      return;
    }

    const lines = transactions.slice(0, 15).map((t: any, i: number) => {
      const date = new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${i + 1}. 📤 ${date} — *${this.formatCurrency(Number(t.amount))}*${t.description ? ` — ${this.escMd(t.description)}` : ''}`;
    });

    await ctx.reply(`📤 *Expense Transactions*\n\n${lines.join('\n')}`, { parse_mode: 'Markdown' });
  }

  // ─── Main Menu ────────────────────────────────────────────────────

  private mainMenuKeyboard() {
    return Markup.keyboard([
      ['📊 Dashboard', '📈 Sales Report'],
      ['📦 Products', '⚠️ Low Stock'],
      ['💰 Financial', '📋 Debts'],
      ['👥 Clients', '🏢 Branches'],
      ['📒 Transactions', '📂 Categories'],
      ['❓ Help'],
    ]).resize();
  }

  // ─── Escape markdown helper ───────────────────────────────────────

  private escMd(text: string): string {
    if (!text) return '';
    return text.replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');
  }
}
