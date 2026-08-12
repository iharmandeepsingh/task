# CT University Organization Unit Architecture

## 1. Overview

The `OrganizationUnit` model represents the complete organizational structure of CT University, replacing flat department lookups with an extensible, self-referencing hierarchy.

```
CT UNIVERSITY (UNIVERSITY)
│
├── School of Engineering & Technology (SCHOOL)
│      ├── Computer Science & Engineering (DEPARTMENT)
│      └── Mechanical Engineering (DEPARTMENT)
│
├── School of Law (SCHOOL)
│      └── Department of Legal Studies (DEPARTMENT)
│
├── Administrative Offices (OFFICE)
│      ├── Human Resources (OFFICE)
│      └── Examination Cell (CELL)
│
└── Research & Innovation (CENTRE)
```

---

## 2. Organization Unit Types

- `UNIVERSITY`: Top-level institutional entity.
- `SCHOOL`: Academic schools / colleges (e.g. School of Law).
- `DEPARTMENT`: Academic departments (e.g. Computer Science).
- `OFFICE`: Administrative divisions (e.g. HR, Registrar, Accounts).
- `CELL`: Specialized operational cells (e.g. Placement Cell, Exam Cell).
- `CENTRE`: Research or innovation centers.
- `DIVISION`: Operational divisions.
- `OTHER`: Auxiliary units.

---

## 3. Cycle & Deletion Protection Rules

1. **Cycle Prevention**: Service layer (`OrganizationUnitsService.validateNoCycles`) checks unit ancestors prior to setting or updating `parentId`. Self-parenting and circular loops (A ➔ B ➔ A) throw `BadRequestException`.
2. **Safe Deactivation Over Hard Deletion**: Units referenced by employee memberships, user scopes, or historical tasks cannot be hard deleted. Setting `isActive = false` preserves historical data integrity.
