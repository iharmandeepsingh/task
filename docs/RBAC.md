# CT University Enterprise RBAC & Scope Authorization Policy

## 1. Security Core Principles

```
EMPLOYEE MASTER RECORD ──► USER ACCOUNT ──► ROLE(S) ──► PERMISSIONS ──► AUTHORIZATION SCOPE
```

1. **Non-Derivation Rule**: Employee import and designation text do **NOT** grant application roles or permissions.
2. **Account Provisioning**: `User` accounts are provisioned via explicit administrative action (`POST /api/v1/employees/:id/provision-account`).
3. **Privileged Role Protections**:
   - `EMPLOYEE_IMPORT` permission allows importing master records but does **NOT** grant `ROLE_ASSIGN` or `SUPER_ADMIN_ASSIGN`.
   - Assigning `SUPER_ADMIN` requires an existing `SUPER_ADMIN` actor session.
   - Assigning `ADMIN_HEAD` / `HOD` / `HR` requires explicit privileged role assignment authority.
4. **Authorization Scope (`UserScope`)**:
   - Distinct from `EmployeeOrganizationMembership`.
   - Defines where an authenticated user is authorized to perform administrative actions.
   - Enforced by NestJS backend guards (`PermissionsGuard`, `DepartmentScopeGuard`).
