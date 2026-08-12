import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import * as xlsx from 'xlsx';
import { PrismaService } from '../../../database/prisma.service';
import { EmployeeImportValidationService } from './employee-import-validation.service';
import { EmployeeImportJobStatus, ImportRowStatus, EmployeeStatus, EmailType, MembershipType } from '@prisma/client';

@Injectable()
export class EmployeeImportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly validationService: EmployeeImportValidationService,
  ) {}

  /**
   * Parses uploaded Excel/CSV buffer and initializes an import job with header mapping.
   */
  async uploadAndParseImportFile(
    fileBuffer: Buffer,
    fileName: string,
    uploadedById: string,
    columnMapping?: Record<string, string>,
  ) {
    // 1. File Hash Check
    const fileHash = this.validationService.computeFileHash(fileBuffer);
    const existingJobHash = await this.validationService.checkDuplicateFileHash(fileHash);

    // 2. Parse Excel/CSV workbook
    let rawRows: Array<Record<string, any>> = [];
    try {
      const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      rawRows = xlsx.utils.sheet_to_json(worksheet, { defval: '' });
    } catch (err) {
      throw new BadRequestException('Failed to parse Excel/CSV file format. Ensure valid spreadsheet file.');
    }

    if (rawRows.length === 0) {
      throw new BadRequestException('Uploaded spreadsheet contains no data rows.');
    }

    // Default column mapping if not explicitly provided
    const mapping = columnMapping || {
      employeeId: 'ID',
      displayName: 'NAME',
      primaryEmail: 'Email',
      phone: 'Phone',
      designation: 'Designation',
      organizationUnit: 'Department',
    };

    // 3. Validate Rows
    const { validatedRows, counts } = await this.validationService.validateRows(rawRows, mapping);

    // 4. Create EmployeeImportJob in DB
    const importJob = await this.prisma.employeeImportJob.create({
      data: {
        fileName,
        fileHash,
        uploadedById,
        status: EmployeeImportJobStatus.READY_FOR_REVIEW,
        totalRows: validatedRows.length,
        validRows: counts.valid,
        warningRows: counts.warning,
        errorRows: counts.error,
        duplicateRows: counts.duplicate,
        columnMapping: mapping as any,
        rows: {
          create: validatedRows.map((r) => ({
            rowNumber: r.rowNumber,
            rawData: r.rawData as any,
            normalizedData: r.normalizedData as any,
            validationStatus: r.validationStatus,
            validationErrors: r.validationErrors as any,
            validationWarnings: r.validationWarnings as any,
            existingEmployeeId: r.existingEmployeeId,
          })),
        },
      },
      include: {
        _count: { select: { rows: true } },
      },
    });

    // 5. Create Audit Log
    await this.prisma.auditLog.create({
      data: {
        actorId: uploadedById,
        action: 'EMPLOYEE_IMPORT_UPLOADED',
        entity: 'EmployeeImportJob',
        entityId: importJob.id,
        metadata: {
          fileName,
          totalRows: importJob.totalRows,
          hasHashMatch: !!existingJobHash,
          previousJobId: existingJobHash?.id,
        },
      },
    });

    return {
      importJobId: importJob.id,
      fileName: importJob.fileName,
      status: importJob.status,
      summary: {
        total: importJob.totalRows,
        valid: importJob.validRows,
        warning: importJob.warningRows,
        error: importJob.errorRows,
        duplicate: importJob.duplicateRows,
      },
      fileHashWarning: existingJobHash
        ? `Identical file was previously uploaded by ${existingJobHash.uploadedBy?.email} on ${existingJobHash.createdAt.toISOString()}`
        : null,
    };
  }

  /**
   * Fetches paginated staging rows for import preview screen.
   */
  async getImportJobPreview(jobId: string, page = 1, limit = 50, statusFilter?: ImportRowStatus) {
    const job = await this.prisma.employeeImportJob.findUnique({
      where: { id: jobId },
    });
    if (!job) {
      throw new NotFoundException(`Import job ID ${jobId} not found`);
    }

    const whereClause: any = { jobId };
    if (statusFilter) {
      whereClause.validationStatus = statusFilter;
    }

    const skip = (page - 1) * limit;
    const [rows, totalCount] = await Promise.all([
      this.prisma.employeeImportRow.findMany({
        where: whereClause,
        orderBy: { rowNumber: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.employeeImportRow.count({ where: whereClause }),
    ]);

    return {
      jobId: job.id,
      fileName: job.fileName,
      status: job.status,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
      summary: {
        total: job.totalRows,
        valid: job.validRows,
        warning: job.warningRows,
        error: job.errorRows,
        duplicate: job.duplicateRows,
      },
      rows,
    };
  }

  /**
   * Executes transactional batch commit of valid and confirmed staged employee rows.
   */
  async confirmImportJob(jobId: string, actorId: string) {
    const job = await this.prisma.employeeImportJob.findUnique({
      where: { id: jobId },
      include: {
        rows: {
          where: {
            validationStatus: {
              in: [ImportRowStatus.VALID, ImportRowStatus.WARNING],
            },
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException(`Import job ID ${jobId} not found`);
    }

    if (job.status === EmployeeImportJobStatus.CONFIRMED || job.status === EmployeeImportJobStatus.COMPLETED) {
      throw new ConflictException('Import job has already been confirmed and processed');
    }

    if (job.errorRows > 0) {
      throw new BadRequestException(`Cannot confirm import job with ${job.errorRows} blocking errors. Please resolve or remove invalid rows.`);
    }

    // Update job status to PROCESSING
    await this.prisma.employeeImportJob.update({
      where: { id: jobId },
      data: { status: EmployeeImportJobStatus.PROCESSING, confirmedAt: new Date() },
    });

    let importedCount = 0;

    // Transactional batch commit
    await this.prisma.$transaction(async (tx) => {
      for (const row of job.rows) {
        const norm = row.normalizedData as any;
        if (!norm || !norm.employeeId) continue;

        // Resolve or create OrganizationUnit
        let orgUnit = await tx.organizationUnit.findFirst({
          where: {
            OR: [
              { name: { equals: norm.organizationUnitName, mode: 'insensitive' } },
              { code: { equals: norm.organizationUnitName, mode: 'insensitive' } },
            ],
          },
        });

        if (!orgUnit) {
          const code = `ORG-${norm.organizationUnitName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 10)}`;
          orgUnit = await tx.organizationUnit.create({
            data: {
              name: norm.organizationUnitName,
              code: code.length > 0 ? code : `ORG-${Date.now()}`,
              isActive: true,
            },
          });
        }

        // Upsert Employee Master Record
        const employee = await tx.employee.upsert({
          where: { employeeId: norm.employeeId },
          update: {
            displayName: norm.displayName,
            phone: norm.phone || undefined,
            designation: norm.designation,
          },
          create: {
            employeeId: norm.employeeId,
            displayName: norm.displayName,
            primaryEmail: norm.primaryEmail || undefined,
            phone: norm.phone,
            designation: norm.designation,
            employmentStatus: EmployeeStatus.ACTIVE,
            source: 'EXCEL_IMPORT',
            importJobId: jobId,
            sourceRowNumber: row.rowNumber,
            memberships: {
              create: {
                organizationUnitId: orgUnit.id,
                membershipType: MembershipType.PRIMARY,
                isPrimary: true,
              },
            },
          },
        });

        // Add Email records
        if (norm.primaryEmail) {
          await tx.employeeEmail.upsert({
            where: {
              employeeId_email: {
                employeeId: employee.id,
                email: norm.primaryEmail,
              },
            },
            update: { isPrimary: true },
            create: {
              employeeId: employee.id,
              email: norm.primaryEmail,
              type: EmailType.UNIVERSITY,
              isPrimary: true,
            },
          });
        }

        for (const altEmail of norm.alternateEmails || []) {
          await tx.employeeEmail.upsert({
            where: {
              employeeId_email: {
                employeeId: employee.id,
                email: altEmail,
              },
            },
            update: {},
            create: {
              employeeId: employee.id,
              email: altEmail,
              type: EmailType.PERSONAL,
              isPrimary: false,
            },
          });
        }

        importedCount++;
      }

      // Mark Job Completed
      await tx.employeeImportJob.update({
        where: { id: jobId },
        data: {
          status: EmployeeImportJobStatus.COMPLETED,
          completedAt: new Date(),
        },
      });

      // Log Audit Event
      await tx.auditLog.create({
        data: {
          actorId,
          action: 'EMPLOYEE_IMPORT_CONFIRMED',
          entity: 'EmployeeImportJob',
          entityId: jobId,
          metadata: { importedCount, totalRows: job.totalRows },
        },
      });
    });

    return {
      message: 'Employee batch import successfully executed',
      jobId,
      importedEmployeesCount: importedCount,
      status: EmployeeImportJobStatus.COMPLETED,
    };
  }
}
