import { Module } from '@nestjs/common';
import { ClientTransactionsService } from './client-transactions.service';
import { ClientTransactionsController } from './client-transactions.controller';

@Module({
  controllers: [ClientTransactionsController],
  providers: [ClientTransactionsService],
  exports: [ClientTransactionsService],
})
export class ClientTransactionsModule {}
