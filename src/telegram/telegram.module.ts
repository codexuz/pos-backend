import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramService } from './telegram.service';
import { TelegramUpdate } from './telegram.update';
import { PrismaModule } from '../prisma/prisma.module';
import { ReportsModule } from '../reports/reports.module';
import { ProductsModule } from '../products/products.module';
import { SalesModule } from '../sales/sales.module';
import { InventoryModule } from '../inventory/inventory.module';
import { ClientsModule } from '../clients/clients.module';
import { DebtsModule } from '../debts/debts.module';
import { BranchesModule } from '../branches/branches.module';
import { CategoriesModule } from '../categories/categories.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const token = config.getOrThrow<string>('TELEGRAM_BOT_TOKEN');
        const isProduction = config.get('NODE_ENV') === 'production';
        const webhookDomain = config.get<string>('TELEGRAM_WEBHOOK_DOMAIN');

        if (isProduction && webhookDomain) {
          return {
            token,
            launchOptions: {
              webhook: {
                domain: webhookDomain,
                path: '/telegram-webhook',
              },
            },
          };
        }

        return { token };
      },
    }),
    PrismaModule,
    ReportsModule,
    ProductsModule,
    SalesModule,
    InventoryModule,
    ClientsModule,
    DebtsModule,
    BranchesModule,
    CategoriesModule,
    TransactionsModule,
  ],
  providers: [TelegramService, TelegramUpdate],
})
export class TelegramModule {}
