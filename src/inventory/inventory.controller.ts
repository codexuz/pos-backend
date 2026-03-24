import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto, UpdateInventoryDto } from './dto';
import { CurrentUser } from '../auth/decorators';

@ApiTags('Inventory')
@ApiBearerAuth()
@Controller('inventory')
export class InventoryController {
  constructor(private service: InventoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create an inventory record' })
  create(@CurrentUser('tenantId') tenantId: string, @Body() dto: CreateInventoryDto) {
    return this.service.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List inventory for a tenant' })
  findAll(@CurrentUser('tenantId') tenantId: string) {
    return this.service.findAll(tenantId);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get low stock items for a tenant' })
  findLowStock(@CurrentUser('tenantId') tenantId: string) {
    return this.service.findLowStock(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get inventory record by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update inventory quantity' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateInventoryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an inventory record' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
