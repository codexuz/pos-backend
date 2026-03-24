import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { CurrentUser } from '../auth/decorators';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private service: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a category' })
  create(@CurrentUser('tenantId') tenantId: string, @Body() dto: CreateCategoryDto) {
    return this.service.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all categories' })
  findAll(@CurrentUser('tenantId') tenantId: string) {
    return this.service.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.service.findOne(id, tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.service.update(id, tenantId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.service.remove(id, tenantId);
  }
}
