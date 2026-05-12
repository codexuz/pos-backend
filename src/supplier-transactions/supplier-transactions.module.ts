import { Module } from '@nestjs/common';
import { SupplierTransactionsService } from './supplier-transactions.service';
import { SupplierTransactionsController } from './supplier-transactions.controller';

@Module({
  controllers: [SupplierTransactionsController],
  providers: [SupplierTransactionsService],
  exports: [SupplierTransactionsService],
})
export class SupplierTransactionsModule {}
