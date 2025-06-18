import { Request, Response, NextFunction } from 'express';
import { getHealthDeclaration, createHealthDeclaration } from '../../../src/controllers/health-declaration.controller';
import * as healthService from '../../../src/service/health-declaration.service';

jest.mock('../../../src/service/health-declaration.service');
jest.mock('../../../src/utils/catchAsync', () => {
  return jest.fn((fn) => async (req: any, res: any, next: any) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  });
});

const mockHealthService = healthService as jest.Mocked<typeof healthService>;

describe('Health Declaration Controller', () => {
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

  describe('getHealthDeclaration', () => {
    it('should return health declarations successfully', async () => {
      const mockHealthDeclarations = [
        {
          _id: '507f1f77bcf86cd799439011',
          name: 'John Doe',
          temperature: 36.5,
          symptoms: ['cough', 'fever'],
          contactWithInfected: false,
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01')
        },
        {
          _id: '507f1f77bcf86cd799439012',
          name: 'Jane Smith',
          temperature: 37.2,
          symptoms: ['headache'],
          contactWithInfected: true,
          createdAt: new Date('2023-01-02'),
          updatedAt: new Date('2023-01-02')
        }
      ];

      mockHealthService.getHealthDeclarationList.mockResolvedValue(mockHealthDeclarations as any);

      await getHealthDeclaration(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockHealthService.getHealthDeclarationList).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Health declarations retrieved successfully',
        data: mockHealthDeclarations
      });
    });

    it('should handle empty health declarations list', async () => {
      mockHealthService.getHealthDeclarationList.mockResolvedValue([]);

      await getHealthDeclaration(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockHealthService.getHealthDeclarationList).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Health declarations retrieved successfully',
        data: []
      });
    });

    it('should handle service errors by calling next middleware', async () => {
      const errorMessage = 'Database error';
      const error = new Error(errorMessage);
      mockHealthService.getHealthDeclarationList.mockRejectedValue(error);

      await getHealthDeclaration(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockHealthService.getHealthDeclarationList).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('createHealthDeclaration', () => {
    it('should create health declaration successfully', async () => {
      const requestBody = {
        name: 'Test User',
        temperature: 36.8,
        symptoms: ['cough', 'sore throat'],
        contactWithInfected: false
      };

      mockRequest = {
        body: requestBody
      };

      const mockCreatedDeclaration = {
        _id: '507f1f77bcf86cd799439013',
        ...requestBody,
        createdAt: new Date('2023-01-03'),
        updatedAt: new Date('2023-01-03')
      };

      mockHealthService.createHealthDeclarationItem.mockResolvedValue(mockCreatedDeclaration as any);

      await createHealthDeclaration(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockHealthService.createHealthDeclarationItem).toHaveBeenCalledWith({
        name: requestBody.name,
        temperature: requestBody.temperature,
        symptoms: requestBody.symptoms,
        contactWithInfected: requestBody.contactWithInfected
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Health declaration created successfully',
        data: mockCreatedDeclaration
      });
    });

    it('should handle creation with different symptom combinations', async () => {
      const testCases = [
        {
          name: 'User with fever',
          temperature: 38.5,
          symptoms: ['fever'],
          contactWithInfected: true
        },
        {
          name: 'User with multiple symptoms',
          temperature: 37.0,
          symptoms: ['cough', 'headache', 'fatigue', 'sore throat'],
          contactWithInfected: false
        },
        {
          name: 'User with no contact',
          temperature: 36.2,
          symptoms: ['runny nose'],
          contactWithInfected: false
        }
      ];

      for (const testCase of testCases) {
        jest.clearAllMocks();

        mockRequest = { body: testCase };

        const mockCreatedDeclaration = {
          _id: `507f1f77bcf86cd79943901${testCases.indexOf(testCase)}`,
          ...testCase,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        mockHealthService.createHealthDeclarationItem.mockResolvedValue(mockCreatedDeclaration as any);

        await createHealthDeclaration(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockHealthService.createHealthDeclarationItem).toHaveBeenCalledWith(testCase);
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: true,
          message: 'Health declaration created successfully',
          data: mockCreatedDeclaration
        });
      }
    });

    it('should handle partial request body data', async () => {
      const requestBody = {
        name: 'Test User',
        temperature: 36.5,
        symptoms: ['cough'],
        contactWithInfected: undefined // This should be handled gracefully
      };

      mockRequest = { body: requestBody };

      const mockCreatedDeclaration = {
        _id: '507f1f77bcf86cd799439014',
        name: requestBody.name,
        temperature: requestBody.temperature,
        symptoms: requestBody.symptoms,
        contactWithInfected: requestBody.contactWithInfected,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockHealthService.createHealthDeclarationItem.mockResolvedValue(mockCreatedDeclaration as any);

      await createHealthDeclaration(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockHealthService.createHealthDeclarationItem).toHaveBeenCalledWith({
        name: requestBody.name,
        temperature: requestBody.temperature,
        symptoms: requestBody.symptoms,
        contactWithInfected: requestBody.contactWithInfected
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it('should handle service errors by calling next middleware', async () => {
      mockRequest = {
        body: {
          name: 'Test User',
          temperature: 36.8,
          symptoms: ['cough'],
          contactWithInfected: false
        }
      };

      const errorMessage = 'Creation failed';
      const error = new Error(errorMessage);
      mockHealthService.createHealthDeclarationItem.mockRejectedValue(error);

      await createHealthDeclaration(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockHealthService.createHealthDeclarationItem).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });
});
