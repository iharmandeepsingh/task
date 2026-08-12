# CT University Database Migration Compatibility Plan

## 1. Migration Overview

This document outlines the safety and data preservation strategy for introducing `OrganizationUnit`, `Employee`, `EmployeeEmail`, `EmployeeOrganizationMembership`, `UserScope`, `EmployeeImportJob`, and `EmployeeImportRow` into the database.

---

## 2. Model Compatibility Analysis

- **Existing Models**: `School`, `Department`, `User`, `EmployeeProfile`, `Role`, `Permission`, `UserRole`, `Task`.
- **Bridge Strategy (Option A - Recommended)**:
  - Preserve `School` and `Department` tables intact to avoid breaking `Task.departmentId` relations, `DepartmentScopeGuard`, and existing API controllers.
  - Add optional `organizationUnitId` foreign key to `Department` bridging it to its corresponding `OrganizationUnit` entry.
  - Link `Employee` to `OrganizationUnit` via `EmployeeOrganizationMembership`.
  - Link `User` to `OrganizationUnit` via `UserScope`.

---

## 3. Migration Execution Safety Rules

1. **Non-Destructive Migration**: Use `npx prisma migrate dev --name add_employee_master_architecture`.
2. **No Database Reset**: Never run `prisma migrate reset` or `prisma db push` on production environments.
3. **Data Backfill**: Seed default `OrganizationUnit` records corresponding to existing `School` and `Department` rows during migration.
