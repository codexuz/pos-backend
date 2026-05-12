import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsModule } from '../notifications/notifications.module';
import { LowStockCron } from './low-stock.cron';
import { DebtReminderCron } from './debt-reminder.cron';

@Module({
  imports: [ScheduleModule.forRoot(), NotificationsModule],
  providers: [LowStockCron, DebtReminderCron],
})
export class CronModule {}
