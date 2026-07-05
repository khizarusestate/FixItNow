import { describe, expect, it } from 'vitest';
import { formatCnicInput, isValidCnic } from '../utils/workerSignup.js';

describe('worker signup CNIC helpers', () => {
    it('formats CNIC input with dashes for better UX', () => {
        expect(formatCnicInput('1234512345678')).toBe('12345-1234567-8');
        expect(formatCnicInput('12345')).toBe('12345');
    });

    it('validates only 13-digit CNIC values', () => {
        expect(isValidCnic('12345-1234567-8')).toBe(true);
        expect(isValidCnic('12345-1234567')).toBe(false);
        expect(isValidCnic('abc')).toBe(false);
    });
});
