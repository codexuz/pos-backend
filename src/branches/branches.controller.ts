import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BranchesService } from './branches.service';
import { CreateBranchDto, UpdateBranchDto } from './dto';
import { CurrentUser, Roles } from '../auth/decorators';

@ApiTags('Branches')
@ApiBearerAuth()
@Roles('owner', 'super_admin')
@Controller('branches')
export class BranchesController {
  constructor(private service: BranchesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a branch' })
  create(@CurrentUser('tenantId') tenantId: string, @Body() dto: CreateBranchDto) {
    return this.service.create(tenantId, dto);
  }

  @Get()
  @Roles('owner', 'super_admin', 'seller')
  @ApiOperation({ summary: 'List all branches' })
  findAll(@CurrentUser('tenantId') tenantId: string) {
    return this.service.findAll(tenantId);
  }

  @Get(':id')
  @Roles('owner', 'super_admin', 'seller')
  @ApiOperation({ summary: 'Get branch by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.service.findOne(id, tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a branch' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: UpdateBranchDto,
  ) {
    return this.service.update(id, tenantId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a branch' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.service.remove(id, tenantId);
  }
}
