import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto, UpdateTenantDto } from './dto';
import { Roles } from '../auth/decorators';

@ApiTags('Tenants')
@ApiBearerAuth()
@Controller('tenants')
export class TenantsController {
  constructor(private service: TenantsService) {}

  @Post()
  @Roles('super_admin')
  @ApiOperation({ summary: 'Create a tenant (super_admin only)' })
  create(@Body() dto: CreateTenantDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles('super_admin')
  @ApiOperation({ summary: 'List all tenants (super_admin only)' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get tenant by ID (super_admin only)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Update a tenant (super_admin only)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTenantDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Deactivate a tenant (super_admin only)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
