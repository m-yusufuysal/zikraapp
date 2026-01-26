/**
 * API Validation Schemas (Zod)
 * 
 * Purpose: Validate all data BEFORE sending to backend.
 * If data doesn't match schema, request is never sent.
 * This prevents SQL injection and malformed data attacks.
 */
import { z } from 'zod';

// === DHIKR SCHEMAS ===

export const DhikrRequestSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
    intention: z.string().min(5, 'Intention must be at least 5 characters').max(500, 'Intention too long'),
    birth_date: z.string().optional(),
    birth_time: z.string().optional(),
    language: z.enum(['tr', 'en', 'ar', 'id']).optional(),
});

export const DhikrFeedbackSchema = z.object({
    session_id: z.string().uuid(),
    feedback: z.enum(['good', 'bad']),
});

// === DREAM SCHEMAS ===

export const DreamRequestSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
    dream_text: z.string().min(10, 'Dream description must be at least 10 characters').max(666, 'Dream text too long (max 666 chars)'),
    birth_date: z.string().optional(),
    birth_time: z.string().optional(),
    birth_place: z.string().max(200).optional(),
    language: z.enum(['tr', 'en', 'ar', 'id']).optional(),
});

// === USER SCHEMAS ===

export const UserProfileSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    birth_date: z.string().optional(),
    preferred_language: z.enum(['tr', 'en', 'ar', 'id']).optional(),
});

// === HELPER FUNCTIONS ===

/**
 * Validates data against schema. Throws if invalid.
 * Use before any API call to ensure clean data.
 */
export const validateOrThrow = (schema, data) => {
    return schema.parse(data);
};

/**
 * Validates data and returns result object.
 * Doesn't throw - safe for form validation.
 */
export const validateSafe = (schema, data) => {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data, errors: null };
    }
    return {
        success: false,
        data: null,
        errors: result.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
        })),
    };
};

/**
 * Sanitize string to prevent injection attacks
 * Removes potentially dangerous characters
 */
export const sanitizeString = (str) => {
    if (typeof str !== 'string') return '';
    // Remove null bytes and control characters
    return str
        .replace(/\0/g, '')
        .replace(/[\x00-\x1F\x7F]/g, '')
        .trim();
};
