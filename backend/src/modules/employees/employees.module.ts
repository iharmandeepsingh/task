import { Module } from '@nestjs/common';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { EmployeeImportService } from './services/employee-import.service';
import { EmployeeImportValidationService } from './services/employee-import-validation.service';
import { EmployeeImportNormalizationService } from './services/employee-import-normalization.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [EmployeesController],
  providers: [
    EmployeesService,
    EmployeeImportService,
    EmployeeImportValidationService,
    EmployeeImportNormalizationService,
  ],
  exports: [
    EmployeesService,
    EmployeeImportService,
    EmployeeImportValidationService,
    EmployeeImportNormalizationService,
  ],
})
export class EmployeesModule {}
