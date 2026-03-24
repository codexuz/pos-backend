import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto } from './dto';
import { CurrentUser } from '../auth/decorators';

@ApiTags('Clients')
@ApiBearerAuth()
@Controller('clients')
export class ClientsController {
  constructor(private service: ClientsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a client' })
  create(@CurrentUser('tenantId') tenantId: string, @Body() dto: CreateClientDto) {
    return this.service.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List clients' })
  @ApiQuery({ name: 'search', required: false })
  findAll(@CurrentUser('tenantId') tenantId: string, @Query('search') search?: string) {
    return this.service.findAll(tenantId, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get client by ID' })
  findOne(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a client' })
  update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClientDto,
  ) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a client' })
  remove(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(tenantId, id);
  }
}
