import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';

import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { RolesModule } from './modules/roles/roles.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { ExtensionsModule } from './modules/extensions/extensions.module';
import { SubmissionsModule } from './modules/submissions/submissions.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ChatModule } from './modules/chat/chat.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    HealthModule,
    AuthModule,
    UsersModule,
    OrganizationModule,
    EmployeesModule,
    RolesModule,
    TasksModule,
    ExtensionsModule,
    SubmissionsModule,
    NotificationsModule,
    ChatModule,
    ReportsModule,
    AuditModule,
  ],
})
export class AppModule {}
