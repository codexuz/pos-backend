import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UnitsService } from './units.service';
import { CreateUnitDto, UpdateUnitDto } from './dto';
import { CurrentUser } from '../auth/decorators';

@ApiTags('Units')
@ApiBearerAuth()
@Controller('units')
export class UnitsController {
  constructor(private service: UnitsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a unit' })
  create(@CurrentUser('tenantId') tenantId: string, @Body() dto: CreateUnitDto) {
    return this.service.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all units' })
  findAll(@CurrentUser('tenantId') tenantId: string) {
    return this.service.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get unit by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.service.findOne(id, tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a unit' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: UpdateUnitDto,
  ) {
    return this.service.update(id, tenantId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a unit' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.service.remove(id, tenantId);
  }
}
