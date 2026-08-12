import { EmployeeImportNormalizationService } from '../src/modules/employees/services/employee-import-normalization.service';
import { EmployeeImportValidationService } from '../src/modules/employees/services/employee-import-validation.service';

describe('Employee Master-Data & Import Pipeline Unit Tests', () => {
  let normalizationService: EmployeeImportNormalizationService;
  let validationService: EmployeeImportValidationService;

  beforeEach(() => {
    normalizationService = new EmployeeImportNormalizationService();
  });

  describe('EmployeeImportNormalizationService', () => {
    it('should normalize employee ID by trimming whitespace', () => {
      expect(normalizationService.normalizeEmployeeId('  CTU-EMP-1001  ')).toBe('CTU-EMP-1001');
      expect(normalizationService.normalizeEmployeeId(12345)).toBe('12345');
      expect(normalizationService.normalizeEmployeeId(null)).toBe('');
    });

    it('should safely normalize canonical primary email to lowercase', () => {
      expect(normalizationService.normalizeEmail('  Faculty@CTUniversity.IN ')).toBe('faculty@ctuniversity.in');
      expect(normalizationService.normalizeEmail('invalid-email-string')).toBeNull();
    });

    it('should split multiple email addresses into primary and alternates', () => {
      const raw = 'faculty.primary@ctu.edu.in / personal.alt@gmail.com, third@domain.com';
      const result = normalizationService.splitMultipleEmails(raw);

      expect(result.primary).toBe('faculty.primary@ctu.edu.in');
      expect(result.alternates).toEqual(['personal.alt@gmail.com', 'third@domain.com']);
    });

    it('should normalize Indian phone numbers to E.164 standard', () => {
      expect(normalizationService.normalizePhone('9876543210')).toBe('+919876543210');
      expect(normalizationService.normalizePhone('+91 98765 43210')).toBe('+919876543210');
      expect(normalizationService.normalizePhone('123')).toBeNull();
    });

    it('should trim display names cleanly without destructive name splitting', () => {
      expect(normalizationService.normalizeDisplayName('  Dr.   Harmanpreet   Singh  ')).toBe('Dr. Harmanpreet Singh');
    });
  });
});
