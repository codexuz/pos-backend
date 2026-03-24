import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExpenseCategoriesService } from './expense-categories.service';
import { CreateExpenseCategoryDto, UpdateExpenseCategoryDto } from './dto';
import { CurrentUser } from '../auth/decorators';

@ApiTags('Expense Categories')
@ApiBearerAuth()
@Controller('expense-categories')
export class ExpenseCategoriesController {
  constructor(private service: ExpenseCategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create an expense category' })
  create(@CurrentUser('tenantId') tenantId: string, @Body() dto: CreateExpenseCategoryDto) {
    return this.service.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List expense categories' })
  findAll(@CurrentUser('tenantId') tenantId: string) {
    return this.service.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get expense category by ID' })
  findOne(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an expense category' })
  update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExpenseCategoryDto,
  ) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an expense category' })
  remove(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(tenantId, id);
  }
}
