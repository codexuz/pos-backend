import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, ChangeLanguageDto } from './dto';
import { CurrentUser, Roles } from '../auth/decorators';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private service: UsersService) {}

  @Patch('me/language')
  @Roles('owner', 'seller', 'super_admin')
  @ApiOperation({ summary: 'Change current user language' })
  changeLanguage(
    @CurrentUser('sub') userId: string,
    @Body() dto: ChangeLanguageDto,
  ) {
    return this.service.changeLanguage(userId, dto.language);
  }

  @Post()
  @Roles('owner', 'super_admin')
  @ApiOperation({ summary: 'Create a user (owner/super_admin)' })
  create(@CurrentUser('tenantId') tenantId: string, @Body() dto: CreateUserDto) {
    return this.service.create(tenantId, dto);
  }

  @Get()
  @Roles('owner', 'super_admin')
  @ApiOperation({ summary: 'List all users' })
  findAll(@CurrentUser('tenantId') tenantId: string) {
    return this.service.findAll(tenantId);
  }

  @Get(':id')
  @Roles('owner', 'super_admin')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.service.findOne(id, tenantId);
  }

  @Patch(':id')
  @Roles('owner', 'super_admin')
  @ApiOperation({ summary: 'Update a user' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.service.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('owner', 'super_admin')
  @ApiOperation({ summary: 'Deactivate a user' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.service.remove(id, tenantId);
  }
}
