import { Request, Response, NextFunction } from 'express';
import notFoundHandler from '../../../src/middleware/notFound.middleware';

describe('Not Found Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRequest = {};
    mockResponse = {};
    mockNext = jest.fn();
  });

  describe('notFoundHandler', () => {
    it('should create error with 404 status code for missing route', () => {
      mockRequest = {
        originalUrl: '/api/nonexistent-route'
      };

      notFoundHandler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      
      const calledError = mockNext.mock.calls[0][0] as unknown as Error;
      expect(calledError).toBeInstanceOf(Error);
      expect(calledError.message).toBe('Route /api/nonexistent-route not found');
      expect((calledError as any).statusCode).toBe(404);
    });

    it('should handle root path not found', () => {
      mockRequest = {
        originalUrl: '/'
      };

      notFoundHandler(mockRequest as Request, mockResponse as Response, mockNext);

      const calledError = mockNext.mock.calls[0][0] as unknown as Error;
      expect(calledError.message).toBe('Route / not found');
      expect((calledError as any).statusCode).toBe(404);
    });

    it('should handle API endpoints not found', () => {
      const testRoutes = [
        '/api/users',
        '/api/health-declaration/nonexistent',
        '/api/v1/data'
      ];

      testRoutes.forEach(route => {
        jest.clearAllMocks();

        mockRequest = {
          originalUrl: route
        };

        notFoundHandler(mockRequest as Request, mockResponse as Response, mockNext);

        const calledError = mockNext.mock.calls[0][0] as unknown as Error;
        expect(calledError).toBeInstanceOf(Error);
        expect(calledError.message).toBe(`Route ${route} not found`);
        expect((calledError as any).statusCode).toBe(404);
      });
    });

    it('should create Error instance with correct properties', () => {
      mockRequest = {
        originalUrl: '/test-route'
      };

      notFoundHandler(mockRequest as Request, mockResponse as Response, mockNext);

      const calledError = mockNext.mock.calls[0][0] as unknown as Error;
      
      expect(calledError).toBeInstanceOf(Error);
      expect(calledError.message).toBe('Route /test-route not found');
      expect((calledError as any).statusCode).toBe(404);
      expect(calledError.name).toBe('Error');
      expect(typeof calledError.stack).toBe('string');
    });
  });
});
