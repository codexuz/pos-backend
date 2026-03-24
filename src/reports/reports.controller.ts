import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CurrentUser, Roles } from '../auth/decorators';
import { UserRole } from '../generated/prisma/client';

@ApiTags('Reports')
@ApiBearerAuth()
@Roles(UserRole.owner, UserRole.super_admin)
@Controller('reports')
export class ReportsController {
  constructor(private service: ReportsService) {}

  @Get('sales-summary')
  @ApiOperation({ summary: 'Sales summary (total, paid, outstanding)' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'from', required: false, description: 'ISO date string' })
  @ApiQuery({ name: 'to', required: false, description: 'ISO date string' })
  salesSummary(
    @CurrentUser('tenantId') tenantId: string,
    @Query('branchId') branchId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.salesSummary(tenantId, branchId, from, to);
  }

  @Get('sales-by-day')
  @ApiOperation({ summary: 'Sales grouped by day' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  salesByDay(
    @CurrentUser('tenantId') tenantId: string,
    @Query('branchId') branchId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.salesByDay(tenantId, branchId, from, to);
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Top selling products by revenue' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  topProducts(
    @CurrentUser('tenantId') tenantId: string,
    @Query('branchId') branchId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.topProducts(tenantId, branchId, limit ? parseInt(limit, 10) : undefined);
  }

  @Get('top-sellers')
  @ApiOperation({ summary: 'Top sellers by revenue' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  topSellers(
    @CurrentUser('tenantId') tenantId: string,
    @Query('branchId') branchId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.topSellers(tenantId, branchId, from, to);
  }

  @Get('inventory')
  @ApiOperation({ summary: 'Inventory report with stock values and low-stock items' })
  @ApiQuery({ name: 'branchId', required: false })
  inventoryReport(
    @CurrentUser('tenantId') tenantId: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.service.inventoryReport(tenantId, branchId);
  }

  @Get('financial-summary')
  @ApiOperation({ summary: 'Financial summary (income, expenses, net profit)' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  financialSummary(
    @CurrentUser('tenantId') tenantId: string,
    @Query('branchId') branchId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.financialSummary(tenantId, branchId, from, to);
  }

  @Get('expenses-by-category')
  @ApiOperation({ summary: 'Expenses grouped by category' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  expensesByCategory(
    @CurrentUser('tenantId') tenantId: string,
    @Query('branchId') branchId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.expensesByCategory(tenantId, branchId, from, to);
  }
}
