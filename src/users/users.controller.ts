import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { CurrentUser, Roles } from '../auth/decorators';

@ApiTags('Users')
@ApiBearerAuth()
@Roles('owner', 'super_admin')
@Controller('users')
export class UsersController {
  constructor(private service: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a user (owner/super_admin)' })
  create(@CurrentUser('tenantId') tenantId: string, @Body() dto: CreateUserDto) {
    return this.service.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all users' })
  findAll(@CurrentUser('tenantId') tenantId: string) {
    return this.service.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.service.findOne(id, tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.service.update(id, tenantId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a user' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.service.remove(id, tenantId);
  }
}
