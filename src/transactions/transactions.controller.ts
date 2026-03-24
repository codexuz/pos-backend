import { Controller, Get, Post, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto';
import { CurrentUser } from '../auth/decorators';
import { Roles } from '../auth/decorators';
import { UserRole } from '../generated/prisma/client';

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(private service: TransactionsService) {}

  @Post()
  @Roles(UserRole.owner, UserRole.super_admin)
  @ApiOperation({ summary: 'Create a transaction (expense/income)' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.service.create(tenantId, userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List transactions' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'type', required: false, enum: ['income', 'expense'] })
  findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query('branchId') branchId?: string,
    @Query('type') type?: string,
  ) {
    return this.service.findAll(tenantId, branchId, type as any);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  findOne(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(tenantId, id);
  }
}
