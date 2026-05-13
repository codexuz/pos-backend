import { Module } from '@nestjs/common';
import { ClientTransactionsService } from './client-transactions.service';
import { ClientTransactionsController } from './client-transactions.controller';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [TelegramModule],
  controllers: [ClientTransactionsController],
  providers: [ClientTransactionsService],
  exports: [ClientTransactionsService],
})
export class ClientTransactionsModule {}
