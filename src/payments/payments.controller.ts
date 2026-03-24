import { Controller, Get, Post, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto';
import { CurrentUser } from '../auth/decorators';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private service: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a payment for a sale' })
  create(@CurrentUser('tenantId') tenantId: string, @Body() dto: CreatePaymentDto) {
    return this.service.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List payments' })
  @ApiQuery({ name: 'saleId', required: false })
  findAll(@CurrentUser('tenantId') tenantId: string, @Query('saleId') saleId?: string) {
    return this.service.findAll(tenantId, saleId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.service.findOne(id, tenantId);
  }
}
