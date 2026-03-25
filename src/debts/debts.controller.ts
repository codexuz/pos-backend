import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DebtsService } from './debts.service';
import { CurrentUser } from '../auth/decorators';

@ApiTags('Debts')
@ApiBearerAuth()
@Controller('debts')
export class DebtsController {
  constructor(private service: DebtsService) {}

  @Get()
  @ApiOperation({ summary: 'List all unpaid/partially paid sales (debts)' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'clientId', required: false })
  findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query('branchId') branchId?: string,
    @Query('clientId') clientId?: string,
  ) {
    return this.service.findAll(tenantId, branchId, clientId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Debt summary with aging breakdown' })
  @ApiQuery({ name: 'branchId', required: false })
  summary(
    @CurrentUser('tenantId') tenantId: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.service.summary(tenantId, branchId);
  }

  @Get('clients')
  @ApiOperation({ summary: 'Per-client debt balances (sorted by highest debt)' })
  clientBalances(@CurrentUser('tenantId') tenantId: string) {
    return this.service.clientBalances(tenantId);
  }

  @Get('clients/:clientId')
  @ApiOperation({ summary: 'Single client debt detail with unpaid sales and payments' })
  clientDebt(
    @CurrentUser('tenantId') tenantId: string,
    @Param('clientId', ParseUUIDPipe) clientId: string,
  ) {
    return this.service.clientDebt(tenantId, clientId);
  }
}
