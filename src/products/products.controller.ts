import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { CurrentUser } from '../auth/decorators';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private service: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a product' })
  create(@CurrentUser('tenantId') tenantId: string, @Body() dto: CreateProductDto) {
    return this.service.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all products' })
  @ApiQuery({ name: 'search', required: false })
  findAll(@CurrentUser('tenantId') tenantId: string, @Query('search') search?: string) {
    return this.service.findAll(tenantId, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.service.findOne(id, tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.service.update(id, tenantId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a product' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.service.remove(id, tenantId);
  }
}
