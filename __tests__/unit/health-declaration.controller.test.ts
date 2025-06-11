import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { getHealthDeclaration, createHealthDeclaration } from '../../src/controllers/health-declaration.controller';
import * as healthDeclarationService from '../../src/service/health-declaration.service';

jest.mock('../../src/service/health-declaration.service');

const mockedService = healthDeclarationService as jest.Mocked<typeof healthDeclarationService>;

describe('Health Declaration Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    } as any;
    mockNext = jest.fn();
  });

  describe('getHealthDeclaration', () => {
    it('should return 200 with success response and data', async () => {
      const mockDeclarations = [
        {
          _id: '1',
          name: 'John Doe',
          temperature: 36.5,
          symptoms: ['Cough'],
          contactWithInfected: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: '2',
          name: 'Jane Smith',
          temperature: 37.2,
          symptoms: ['Fever'],
          contactWithInfected: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ] as any;

      mockedService.getHealthDeclarationList.mockResolvedValue(mockDeclarations);

      await getHealthDeclaration(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockedService.getHealthDeclarationList).toHaveBeenCalledTimes(1);
      expect(mockedService.getHealthDeclarationList).toHaveBeenCalledWith();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Health declarations retrieved successfully',
        data: mockDeclarations
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return empty array when no declarations exist', async () => {
      mockedService.getHealthDeclarationList.mockResolvedValue([]);

      await getHealthDeclaration(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockedService.getHealthDeclarationList).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Health declarations retrieved successfully',
        data: []
      });
    });
  });

  describe('createHealthDeclaration', () => {
    beforeEach(() => {
      mockRequest.body = {
        name: 'John Doe',
        temperature: 36.5,
        symptoms: ['Cough', 'Fever'],
        contactWithInfected: false
      };
    });

    it('should create health declaration and return 201 with success response', async () => {
      const mockCreatedDeclaration = {
        _id: 'new-id-123',
        name: 'John Doe',
        temperature: 36.5,
        symptoms: ['Cough', 'Fever'],
        contactWithInfected: false,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any;

      mockedService.createHealthDeclarationItem.mockResolvedValue(mockCreatedDeclaration);

      await createHealthDeclaration(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockedService.createHealthDeclarationItem).toHaveBeenCalledTimes(1);
      expect(mockedService.createHealthDeclarationItem).toHaveBeenCalledWith({
        name: 'John Doe',
        temperature: 36.5,
        symptoms: ['Cough', 'Fever'],
        contactWithInfected: false
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Health declaration created successfully',
        data: mockCreatedDeclaration
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle valid data with different symptom combinations', async () => {
      mockRequest.body = {
        name: 'Alice Johnson',
        temperature: 38.0,
        symptoms: ['Fever', 'Headache', 'Sore throat'],
        contactWithInfected: true
      };

      const mockCreatedDeclaration = {
        _id: 'alice-id',
        ...mockRequest.body,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any;

      mockedService.createHealthDeclarationItem.mockResolvedValue(mockCreatedDeclaration);

      await createHealthDeclaration(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockedService.createHealthDeclarationItem).toHaveBeenCalledWith({
        name: 'Alice Johnson',
        temperature: 38.0,
        symptoms: ['Fever', 'Headache', 'Sore throat'],
        contactWithInfected: true
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Health declaration created successfully',
        data: mockCreatedDeclaration
      });
    });

    it('should handle empty symptoms array', async () => {
      mockRequest.body = {
        name: 'Bob Wilson',
        temperature: 36.2,
        symptoms: [],
        contactWithInfected: false
      };

      const mockCreatedDeclaration = {
        _id: 'bob-id',
        ...mockRequest.body,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any;

      mockedService.createHealthDeclarationItem.mockResolvedValue(mockCreatedDeclaration);

      await createHealthDeclaration(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockedService.createHealthDeclarationItem).toHaveBeenCalledWith({
        name: 'Bob Wilson',
        temperature: 36.2,
        symptoms: [],
        contactWithInfected: false
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });
  });
});
