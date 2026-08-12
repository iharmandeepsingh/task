# CT University Employee Master-Data Architecture

## 1. Core Architectural Principle

The system enforces strict separation between employment identity and application authorization:

```
EMPLOYEE MASTER RECORD ──► USER ACCOUNT ──► ROLE(S) ──► PERMISSIONS ──► AUTHORIZATION SCOPE
```

### Security & Non-Derivation Rules
1. **Source Data Categories ≠ Application Roles**: Excel sheet names (e.g., `Updated Faculty`, `Admin`) represent source data categories ONLY and **NEVER** dictate application access or roles.
2. **Designation ≠ Application Role**: Employee designations (e.g. `Head of Department`, `Dean`, `HR Lead`) describe employment and **NEVER** automatically grant RBAC roles or permissions.
3. **Employee Record ≠ Active User Account**: Importing an employee record creates an institutional `Employee` entry with no active login capability (`userId == null`). Account provisioning is a separate, deliberate administrative action.
4. **Super Admin Privilege Protection**: `SUPER_ADMIN` accounts can **NEVER** be created automatically via import.
5. **Backend Authoritative**: Permission and scope enforcement is strictly executed by NestJS backend guards (`PermissionsGuard`, `DepartmentScopeGuard`).

---

## 2. Model Specifications

### Employee Model
- `id`: UUID primary key.
- `employeeId`: Unique institutional identifier (e.g. `CTU-EMP-1001`), trimmed and normalized.
- `displayName`: Required canonical full name (preserves source string without destructive name splitting).
- `firstName`, `middleName`, `lastName`: Optional structured name fields.
- `primaryEmail`: Optional canonical primary email (`String? @unique`). Nullable unique in PostgreSQL.
- `phone`: Optional normalized phone number (E.164 / Indian standard).
- `designation`: Employment job title string.
- `employmentType`: `REGULAR`, `CONTRACT`, `ADJUNCT`, `VISITING`, `GUEST`.
- `employmentStatus`: `IMPORTED`, `ACTIVE`, `INACTIVE`, `LEFT_ORGANIZATION`.
- `userId`: Optional foreign key link to provisioned `User` account.
- `source`: Provenance tracking (`EXCEL_IMPORT`, `CSV_IMPORT`, `MANUAL`).

### EmployeeEmail Model (Relational Emails)
- `id`: UUID.
- `employeeId`: Foreign key to `Employee`.
- `email`: Normalized email string.
- `type`: `UNIVERSITY`, `PERSONAL`, `OTHER`.
- `isPrimary`: Boolean flag.
- `isVerified`: Boolean verification status.

### EmployeeOrganizationMembership Model (Multiple Memberships)
- `id`: UUID.
- `employeeId`: Foreign key to `Employee`.
- `organizationUnitId`: Foreign key to `OrganizationUnit`.
- `membershipType`: `PRIMARY`, `SECONDARY`, `COORDINATOR`, `MEMBER`, `ADMINISTRATIVE`, `OTHER`.
- `isPrimary`: Boolean flag.
- `titleOrResponsibility`: Optional responsibility title string.
