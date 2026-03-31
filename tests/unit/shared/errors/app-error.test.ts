import { describe, it, expect } from 'vitest';
import { AppError, type AppErrorType } from '@/shared/errors/app-error';

export type ErrorTestContext = {
  error: AppError;
  message: string;
  code: string;
};

describe('AppError', () => {
  describe('when created with basic parameters', () => {
    it('should create error with correct properties', () => {
      const error = new AppError('TEST_ERROR', 'Test message');
      
      expect(error.code).toBe('TEST_ERROR');
      expect(error.message).toBe('Test message');
      expect(error.name).toBe('AppError');
      expect(error.context).toBeUndefined();
    });

    it('should create error with context', () => {
      const context = { userId: 123, action: 'test' };
      const error = new AppError('TEST_ERROR', 'Test message', context);
      
      expect(error.context).toEqual(context);
    });
  });

  describe('when creating with different error types', () => {
    it('should handle AI service error type', () => {
      const errorType: AppErrorType = 'AI_SERVICE_ERROR';
      const error = new AppError(errorType, 'AI service failed');
      
      expect(error.code).toBe('AI_SERVICE_ERROR');
    });

    it('should handle database error type', () => {
      const errorType: AppErrorType = 'DATABASE_ERROR';
      const error = new AppError(errorType, 'Database failed');
      
      expect(error.code).toBe('DATABASE_ERROR');
    });
  });
});