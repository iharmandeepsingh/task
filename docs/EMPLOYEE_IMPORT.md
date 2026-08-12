# CT University Employee Import Architecture & Pipeline

## 1. Import Pipeline Overview

The employee import pipeline follows a strict multi-stage staging architecture:

```
UPLOAD FILE ──► SECURITY VALIDATION ──► PARSE HEADERS ──► COLUMN MAPPING ──► NORMALIZE
                                                                                  │
                                                                                  ▼
CONFIRMATION ◄── STAGING PREVIEW ◄── CONFLICT RESOLUTION ◄── ORG RESOLUTION ◄── VALIDATE & DUPLICATES
     │
     ▼
TRANSACTIONAL BATCH COMMIT ──► EMPLOYEE MASTER DATA ──► AUDIT LOG ──► OPTIONAL ACCOUNT PROVISIONING
```

---

## 2. Pipeline Stages

1. **File Upload & Security Validation**: Accepts `.xlsx` / `.csv`. Checks extension, MIME type, file size limit (max 10MB). Computes SHA-256 `fileHash`.
2. **File Hash Idempotency Check**: If SHA-256 match found in `EmployeeImportJob`, generates a `WARNING` alert displaying previous import metadata (Uploaded by X on Y date). Allows authorized inspection before proceeding.
3. **Parse Headers & Column Mapping**: Reads spreadsheet header row. Applies mapping rules (e.g. `EMP CODE`, `ID` ➔ `employeeId`; `NAME`, `Faculty Name` ➔ `displayName`; `Email` ➔ `primaryEmail`). Supports template versions (`CT_EMPLOYEE_IMPORT_V1`).
4. **Data Normalization**:
   - Trims whitespace.
   - Splits multiple emails (sets first valid as primary, secondary as alternate).
   - Normalizes Indian phone numbers into E.164 / standard national format.
5. **Validation & Duplicate Detection**:
   - Validates required fields, syntax, and duplicate IDs/emails across rows and against PostgreSQL database.
   - Row validation statuses: `VALID`, `WARNING`, `ERROR`, `DUPLICATE`, `SKIPPED`.
6. **Organization Resolution**:
   - Maps department names to `OrganizationUnit` records.
   - If unmapped, flags row with `ORGANIZATION_MATCH_REQUIRED` allowing manual alias mapping.
7. **Staging Preview & Conflict Resolution**:
   - Paginated preview (`GET /api/v1/employees/import/:jobId/preview?page=1&limit=50&status=WARNING`).
   - Conflict resolution options: `SKIP`, `LINK_TO_EXISTING`, `UPDATE_EXISTING`, `MANUAL_REVIEW`. Default V1 = `MANUAL_REVIEW`.
8. **Transactional Confirmation**: Batch commits confirmed valid/reviewed rows in Prisma `$transaction`.
