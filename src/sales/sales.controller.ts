import { Controller, Get, Post, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto';
import { CurrentUser } from '../auth/decorators';

@ApiTags('Sales')
@ApiBearerAuth()
@Controller('sales')
export class SalesController {
  constructor(private service: SalesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a sale with items' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') sellerId: string,
    @Body() dto: CreateSaleDto,
  ) {
    return this.service.create(tenantId, sellerId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List sales' })
  @ApiQuery({ name: 'branchId', required: false })
  findAll(@CurrentUser('tenantId') tenantId: string, @Query('branchId') branchId?: string) {
    return this.service.findAll(tenantId, branchId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sale by ID' })
  findOne(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(tenantId, id);
  }
}
