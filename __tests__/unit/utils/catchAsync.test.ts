import { Request, Response, NextFunction } from 'express';
import catchAsync from '../../../src/utils/catchAsync';

describe('CatchAsync Utility', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('catchAsync', () => {
    it('should execute async function successfully', async () => {
      const mockAsyncFunction = jest.fn().mockResolvedValue('success');

      const wrappedFunction = catchAsync(mockAsyncFunction);

      await wrappedFunction(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockAsyncFunction).toHaveBeenCalledTimes(1);
      expect(mockAsyncFunction).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
      expect(mockNext).not.toHaveBeenCalled(); // Should not call next on success
    });

    it('should catch and pass async function errors to next middleware', async () => {
      const errorMessage = 'Async operation failed';
      const error = new Error(errorMessage);
      const mockAsyncFunction = jest.fn().mockRejectedValue(error);

      const wrappedFunction = catchAsync(mockAsyncFunction);

      await wrappedFunction(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockAsyncFunction).toHaveBeenCalledTimes(1);
      expect(mockAsyncFunction).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle async functions that return data', async () => {
      const mockData = { id: 1, name: 'Test' };
      const mockAsyncFunction = jest.fn(async (req: Request, res: Response, next: NextFunction) => {
        res.status(200).json({ success: true, data: mockData });
        return mockData;
      });

      const wrappedFunction = catchAsync(mockAsyncFunction);

      await wrappedFunction(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockAsyncFunction).toHaveBeenCalledTimes(1);
      expect(mockAsyncFunction).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true, data: mockData });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle database operation errors', async () => {
      const dbError = new Error('Database connection failed');
      (dbError as any).statusCode = 503;
      
      const mockAsyncFunction = jest.fn().mockRejectedValue(dbError);

      const wrappedFunction = catchAsync(mockAsyncFunction);

      await wrappedFunction(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(dbError);
      expect((mockNext.mock.calls[0][0] as any).statusCode).toBe(503);
    });

    it('should handle validation errors', async () => {
      const validationError = new Error('Validation failed');
      (validationError as any).statusCode = 400;
      (validationError as any).errors = ['Name is required', 'Email is invalid'];
      
      const mockAsyncFunction = jest.fn().mockRejectedValue(validationError);

      const wrappedFunction = catchAsync(mockAsyncFunction);

      await wrappedFunction(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(validationError);
      expect((mockNext.mock.calls[0][0] as any).statusCode).toBe(400);
      expect((mockNext.mock.calls[0][0] as any).errors).toEqual(['Name is required', 'Email is invalid']);
    });

    it('should handle async functions with custom errors', async () => {
      const customError = {
        statusCode: 422,
        message: 'Unprocessable Entity',
        details: 'Custom error details'
      };
      
      const mockAsyncFunction = jest.fn().mockRejectedValue(customError);

      const wrappedFunction = catchAsync(mockAsyncFunction);

      await wrappedFunction(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(customError);
    });

    it('should handle multiple sequential calls', async () => {
      let callCount = 0;
      const mockAsyncFunction = jest.fn(async () => {
        callCount++;
        if (callCount === 2) {
          throw new Error('Second call failed');
        }
        return `Call ${callCount}`;
      });

      const wrappedFunction = catchAsync(mockAsyncFunction);

      await wrappedFunction(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockAsyncFunction).toHaveBeenCalledTimes(1);
      expect(mockNext).not.toHaveBeenCalled();

      jest.clearAllMocks();

      await wrappedFunction(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockAsyncFunction).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Second call failed'
      }));
    });

    it('should handle async functions that access request data', async () => {
      mockRequest = {
        body: { name: 'John', temperature: 36.5 },
        params: { id: '123' },
        query: { limit: '10' }
      };

      const mockAsyncFunction = jest.fn(async (req: Request, res: Response, next: NextFunction) => {
        const { name, temperature } = req.body;
        const { id } = req.params;
        const { limit } = req.query;

        res.status(200).json({
          success: true,
          data: { name, temperature, id, limit }
        });
      });

      const wrappedFunction = catchAsync(mockAsyncFunction);

      await wrappedFunction(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockAsyncFunction).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { name: 'John', temperature: 36.5, id: '123', limit: '10' }
      });
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      (timeoutError as any).statusCode = 408;
      
      const mockAsyncFunction = jest.fn().mockRejectedValue(timeoutError);

      const wrappedFunction = catchAsync(mockAsyncFunction);

      await wrappedFunction(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(timeoutError);
    });

    it('should return a function that accepts req, res, next parameters', () => {
      const mockAsyncFunction = jest.fn().mockResolvedValue('test');
      
      const wrappedFunction = catchAsync(mockAsyncFunction);

      expect(typeof wrappedFunction).toBe('function');
      expect(wrappedFunction.length).toBe(3); // Should accept 3 parameters (req, res, next)
    });

    it('should handle promise rejections with non-Error objects', async () => {
      const rejectionValue = 'Something went wrong';
      const mockAsyncFunction = jest.fn().mockRejectedValue(rejectionValue);

      const wrappedFunction = catchAsync(mockAsyncFunction);

      await wrappedFunction(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(rejectionValue);
    });
  });
});
