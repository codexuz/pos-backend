import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionPlansService } from './subscription-plans.service';
import { CreateSubscriptionPlanDto, UpdateSubscriptionPlanDto } from './dto';
import { Roles } from '../auth/decorators';

@ApiTags('Subscription Plans')
@ApiBearerAuth()
@Controller('subscription-plans')
export class SubscriptionPlansController {
  constructor(private service: SubscriptionPlansService) {}

  @Post()
  @Roles('super_admin')
  @ApiOperation({ summary: 'Create a subscription plan (super_admin only)' })
  create(@Body() dto: CreateSubscriptionPlanDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all active subscription plans' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a subscription plan by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Update a subscription plan (super_admin only)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSubscriptionPlanDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Deactivate a subscription plan (super_admin only)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
