import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../../database/prisma.service';
import { EmployeeImportNormalizationService } from './employee-import-normalization.service';
import { ImportRowStatus } from '@prisma/client';

export interface ValidatedRowResult {
  rowNumber: number;
  rawData: Record<string, any>;
  normalizedData: {
    employeeId: string;
    displayName: string;
    primaryEmail: string | null;
    alternateEmails: string[];
    phone: string | null;
    designation: string;
    organizationUnitName: string;
  };
  validationStatus: ImportRowStatus;
  validationErrors: string[];
  validationWarnings: string[];
  existingEmployeeId?: string;
}

@Injectable()
export class EmployeeImportValidationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly normalizationService: EmployeeImportNormalizationService,
  ) {}

  /**
   * Computes SHA-256 file hash for idempotency checking.
   */
  computeFileHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Checks if an identical file buffer has been previously uploaded.
   */
  async checkDuplicateFileHash(fileHash: string) {
    return this.prisma.employeeImportJob.findFirst({
      where: { fileHash },
      include: {
        uploadedBy: {
          select: { email: true, employeeId: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Validates raw parsed row data against business rules and database constraints.
   */
  async validateRows(
    rows: Array<Record<string, any>>,
    columnMapping: Record<string, string>,
  ): Promise<{
    validatedRows: ValidatedRowResult[];
    counts: { valid: number; warning: number; error: number; duplicate: number };
  }> {
    const validatedRows: ValidatedRowResult[] = [];
    const counts = { valid: 0, warning: 0, error: 0, duplicate: 0 };

    const seenInFileIds = new Set<string>();
    const seenInFileEmails = new Set<string>();

    for (let index = 0; index < rows.length; index++) {
      const rawRow = rows[index];
      const rowNumber = index + 2; // Row 1 is header
      const errors: string[] = [];
      const warnings: string[] = [];

      // Extract mapped fields using column mapping DTO
      const rawEmployeeId = rawRow[columnMapping.employeeId || 'ID'] || rawRow['EMP CODE'] || rawRow['Employee ID'] || rawRow['ID'];
      const rawName = rawRow[columnMapping.displayName || 'NAME'] || rawRow['Faculty Name'] || rawRow['Name'] || rawRow['NAME'];
      const rawEmail = rawRow[columnMapping.primaryEmail || 'Email'] || rawRow['E-mail'] || rawRow['email'] || rawRow['Email'];
      const rawPhone = rawRow[columnMapping.phone || 'Phone'] || rawRow['Contact No'] || rawRow['Mobile'] || rawRow['Phone'];
      const rawDesignation = rawRow[columnMapping.designation || 'Designation'] || rawRow['Designation'] || rawRow['Role'] || 'Faculty';
      const rawOrgUnit = rawRow[columnMapping.organizationUnit || 'Department'] || rawRow['Dept'] || rawRow['School'] || rawRow['Department'] || 'General';

      const normalizedId = this.normalizationService.normalizeEmployeeId(rawEmployeeId);
      const normalizedName = this.normalizationService.normalizeDisplayName(rawName);
      const emailParse = this.normalizationService.splitMultipleEmails(rawEmail);
      const normalizedPhone = this.normalizationService.normalizePhone(rawPhone);

      // Rule 1: Validate Required Fields
      if (!normalizedId) {
        errors.push('Missing required Employee ID');
      }
      if (!normalizedName) {
        errors.push('Missing required Employee Name');
      }

      // Rule 2: Email Warning / Warning checks
      if (!emailParse.primary && rawEmail) {
        warnings.push(`Malformed or invalid email address "${rawEmail}". Email will not be used for login.`);
      }
      if (emailParse.alternates.length > 0) {
        warnings.push(`Multiple emails detected. Primary: ${emailParse.primary}, Alternates: ${emailParse.alternates.join(', ')}`);
      }

      let status: ImportRowStatus = ImportRowStatus.VALID;
      let existingEmployeeId: string | undefined;

      // Rule 3: In-file Duplicate Detection
      if (normalizedId) {
        if (seenInFileIds.has(normalizedId)) {
          status = ImportRowStatus.DUPLICATE;
          errors.push(`Duplicate Employee ID "${normalizedId}" found within the uploaded file`);
        } else {
          seenInFileIds.add(normalizedId);
        }
      }

      if (emailParse.primary) {
        if (seenInFileEmails.has(emailParse.primary)) {
          status = ImportRowStatus.DUPLICATE;
          warnings.push(`Duplicate email "${emailParse.primary}" found within the uploaded file`);
        } else {
          seenInFileEmails.add(emailParse.primary);
        }
      }

      // Rule 4: Database Duplicate Detection
      if (status !== ImportRowStatus.DUPLICATE && normalizedId) {
        const existingEmp = await this.prisma.employee.findUnique({
          where: { employeeId: normalizedId },
        });
        if (existingEmp) {
          status = ImportRowStatus.DUPLICATE;
          existingEmployeeId = existingEmp.id;
          warnings.push(`Employee ID "${normalizedId}" matches existing employee "${existingEmp.displayName}"`);
        }
      }

      if (status !== ImportRowStatus.DUPLICATE && emailParse.primary) {
        const existingEmail = await this.prisma.employee.findUnique({
          where: { primaryEmail: emailParse.primary },
        });
        if (existingEmail) {
          status = ImportRowStatus.DUPLICATE;
          existingEmployeeId = existingEmail.id;
          warnings.push(`Primary email "${emailParse.primary}" matches existing employee "${existingEmail.displayName}"`);
        }
      }

      // Final Status Determination
      if (errors.length > 0 && status !== ImportRowStatus.DUPLICATE) {
        status = ImportRowStatus.ERROR;
      } else if (warnings.length > 0 && status === ImportRowStatus.VALID) {
        status = ImportRowStatus.WARNING;
      }

      // Tally counts
      if (status === ImportRowStatus.VALID) counts.valid++;
      else if (status === ImportRowStatus.WARNING) counts.warning++;
      else if (status === ImportRowStatus.ERROR) counts.error++;
      else if (status === ImportRowStatus.DUPLICATE) counts.duplicate++;

      validatedRows.push({
        rowNumber,
        rawData: rawRow,
        normalizedData: {
          employeeId: normalizedId,
          displayName: normalizedName,
          primaryEmail: emailParse.primary,
          alternateEmails: emailParse.alternates,
          phone: normalizedPhone,
          designation: String(rawDesignation).trim(),
          organizationUnitName: String(rawOrgUnit).trim(),
        },
        validationStatus: status,
        validationErrors: errors,
        validationWarnings: warnings,
        existingEmployeeId,
      });
    }

    return { validatedRows, counts };
  }
}
