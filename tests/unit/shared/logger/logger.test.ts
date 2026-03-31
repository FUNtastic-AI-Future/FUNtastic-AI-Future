import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createLogger, type Logger } from '@/shared/logger/logger';

export type LoggerTestContext = {
  logger: Logger;
  mockStdout: ReturnType<typeof vi.fn>;
  mockStderr: ReturnType<typeof vi.fn>;
};

describe('Logger', () => {
  let logger: Logger;
  let mockStdout: ReturnType<typeof vi.fn>;
  let mockStderr: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockStdout = vi.fn();
    mockStderr = vi.fn();
    vi.spyOn(process.stdout, 'write').mockImplementation(mockStdout);
    vi.spyOn(process.stderr, 'write').mockImplementation(mockStderr);
    logger = createLogger('test');
  });

  describe('when logging info messages', () => {
    it('should write to stdout', () => {
      logger.info('test message');
      expect(mockStdout).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] [test] test message\n')
      );
    });

    it('should include arguments', () => {
      logger.info('test message', { key: 'value' });
      expect(mockStdout).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] [test] test message {"key":"value"}\n')
      );
    });
  });

  describe('when logging error messages', () => {
    it('should write to stderr', () => {
      logger.error('error message');
      expect(mockStderr).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR] [test] error message\n')
      );
    });
  });

  describe('when logging debug messages', () => {
    it('should write to stdout', () => {
      logger.debug('debug message');
      expect(mockStdout).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG] [test] debug message\n')
      );
    });
  });

  describe('when logging warn messages', () => {
    it('should write to stdout', () => {
      logger.warn('warn message');
      expect(mockStdout).toHaveBeenCalledWith(
        expect.stringContaining('[WARN] [test] warn message\n')
      );
    });
  });
});