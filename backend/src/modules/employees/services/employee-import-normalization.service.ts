import { Injectable } from '@nestjs/common';

@Injectable()
export class EmployeeImportNormalizationService {
  /**
   * Trims whitespace and normalizes employee ID string.
   */
  normalizeEmployeeId(rawId: string | number | null | undefined): string {
    if (!rawId) return '';
    return String(rawId).trim();
  }

  /**
   * Normalizes email address safely.
   */
  normalizeEmail(rawEmail: string | null | undefined): string | null {
    if (!rawEmail) return null;
    const trimmed = String(rawEmail).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmed) ? trimmed : null;
  }

  /**
   * Parses raw email field which may contain multiple email addresses separated by `/`, `,`, `;`, or spaces.
   * Extracts one canonical primary email and secondary alternate emails.
   */
  splitMultipleEmails(rawEmailString: string | null | undefined): { primary: string | null; alternates: string[] } {
    if (!rawEmailString) {
      return { primary: null, alternates: [] };
    }

    // Split on slash, comma, semicolon, or space
    const tokens = String(rawEmailString)
      .split(/[\/,;\s]+/)
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails: string[] = [];

    for (const token of tokens) {
      if (emailRegex.test(token) && !validEmails.includes(token)) {
        validEmails.push(token);
      }
    }

    if (validEmails.length === 0) {
      return { primary: null, alternates: [] };
    }

    return {
      primary: validEmails[0],
      alternates: validEmails.slice(1),
    };
  }

  /**
   * Normalizes Indian phone numbers into standard format (+91XXXXXXXXXX or national 10-digit).
   */
  normalizePhone(rawPhone: string | number | null | undefined): string | null {
    if (!rawPhone) return null;
    const digitsOnly = String(rawPhone).replace(/\D/g, '');

    if (digitsOnly.length === 10) {
      return `+91${digitsOnly}`;
    } else if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
      return `+${digitsOnly}`;
    } else if (digitsOnly.length > 6) {
      return digitsOnly;
    }

    return null;
  }

  /**
   * Trims display name string cleanly without destructive name splitting.
   */
  normalizeDisplayName(rawName: string | null | undefined): string {
    if (!rawName) return '';
    return String(rawName).replace(/\s+/g, ' ').trim();
  }
}
