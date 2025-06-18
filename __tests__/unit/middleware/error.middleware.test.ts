import { Request, Response, NextFunction } from 'express';
import globalErrorHandler from '../../../src/middleware/error.middleware';

const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('Error Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe('globalErrorHandler', () => {
    it('should handle error with custom status code and message', () => {
      const customError = {
        statusCode: 404,
        message: 'Resource not found'
      };

      globalErrorHandler(customError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(console.error).toHaveBeenCalledWith('Error:', 'Resource not found');
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Resource not found'
      });
    });

    it('should handle error with default status code when not provided', () => {
      const error = {
        message: 'Something went wrong'
      };

      globalErrorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(console.error).toHaveBeenCalledWith('Error:', 'Something went wrong');
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Something went wrong'
      });
    });

    it('should handle error with default message when not provided', () => {
      const error = {
        statusCode: 400
      };

      globalErrorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(console.error).toHaveBeenCalledWith('Error:', undefined);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal Server Error'
      });
    });

    it('should handle error with both default status code and message', () => {
      const error = {};

      globalErrorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(console.error).toHaveBeenCalledWith('Error:', undefined);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal Server Error'
      });
    });

    it('should handle JavaScript Error objects', () => {
      const error = new Error('Database connection failed');
      (error as any).statusCode = 503;

      globalErrorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(console.error).toHaveBeenCalledWith('Error:', 'Database connection failed');
      expect(mockResponse.status).toHaveBeenCalledWith(503);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database connection failed'
      });
    });

    it('should handle validation errors', () => {
      const validationError = {
        statusCode: 400,
        message: 'Validation failed',
        errors: ['Name is required', 'Temperature must be a number']
      };

      globalErrorHandler(validationError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(console.error).toHaveBeenCalledWith('Error:', 'Validation failed');
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed'
      });
    });

    it('should handle authentication errors', () => {
      const authError = {
        statusCode: 401,
        message: 'Unauthorized access'
      };

      globalErrorHandler(authError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(console.error).toHaveBeenCalledWith('Error:', 'Unauthorized access');
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized access'
      });
    });

    it('should handle server errors', () => {
      const serverError = {
        statusCode: 500,
        message: 'Internal server error occurred'
      };

      globalErrorHandler(serverError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(console.error).toHaveBeenCalledWith('Error:', 'Internal server error occurred');
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error occurred'
      });
    });

    it('should handle errors with falsy message', () => {
      const error = {
        statusCode: 400,
        message: ''
      };

      globalErrorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(console.error).toHaveBeenCalledWith('Error:', '');
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal Server Error'
      });
    });

    it('should handle errors with zero status code', () => {
      const error = {
        statusCode: 0,
        message: 'Zero status code error'
      };

      globalErrorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(console.error).toHaveBeenCalledWith('Error:', 'Zero status code error');
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Zero status code error'
      });
    });

    it('should handle errors with additional properties', () => {
      const error = {
        statusCode: 422,
        message: 'Unprocessable entity',
        stack: 'Error stack trace...',
        name: 'ValidationError',
        details: 'Additional error details'
      };

      globalErrorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(console.error).toHaveBeenCalledWith('Error:', 'Unprocessable entity');
      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unprocessable entity'
      });
    });

    it('should not call next function', () => {
      const error = {
        statusCode: 400,
        message: 'Bad request'
      };

      globalErrorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
