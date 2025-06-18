import { Request, Response, NextFunction } from 'express';
import { validateHealthDeclaration } from '../../../src/middleware/validation.middleware';

describe('Validation Middleware', () => {
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

  describe('validateHealthDeclaration', () => {
    it('should pass validation with valid data', () => {
      mockRequest = {
        body: {
          name: 'John Doe',
          temperature: 36.5,
          symptoms: ['cough', 'fever'],
          contactWithInfected: false
        }
      };

      validateHealthDeclaration(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should pass validation with maximum valid temperature', () => {
      mockRequest = {
        body: {
          name: 'Jane Doe',
          temperature: 45, // Maximum valid temperature
          symptoms: ['fever'],
          contactWithInfected: true
        }
      };

      validateHealthDeclaration(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should pass validation with minimum valid temperature', () => {
      mockRequest = {
        body: {
          name: 'Bob Smith',
          temperature: 30, // Minimum valid temperature
          symptoms: ['headache'],
          contactWithInfected: false
        }
      };

      validateHealthDeclaration(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });

    describe('Name validation', () => {
      it('should fail when name is missing', () => {
        mockRequest = {
          body: {
            temperature: 36.5,
            symptoms: ['cough'],
            contactWithInfected: false
          }
        };

        validateHealthDeclaration(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Validation failed',
          errors: ['Name is required and must be at least 2 characters']
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should fail when name is empty string', () => {
        mockRequest = {
          body: {
            name: '',
            temperature: 36.5,
            symptoms: ['cough'],
            contactWithInfected: false
          }
        };

        validateHealthDeclaration(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            errors: expect.arrayContaining(['Name is required and must be at least 2 characters'])
          })
        );
      });

      it('should fail when name is too short', () => {
        mockRequest = {
          body: {
            name: 'A', // Only 1 character
            temperature: 36.5,
            symptoms: ['cough'],
            contactWithInfected: false
          }
        };

        validateHealthDeclaration(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            errors: expect.arrayContaining(['Name is required and must be at least 2 characters'])
          })
        );
      });

      it('should fail when name is not a string', () => {
        mockRequest = {
          body: {
            name: 123,
            temperature: 36.5,
            symptoms: ['cough'],
            contactWithInfected: false
          }
        };

        validateHealthDeclaration(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            errors: expect.arrayContaining(['Name is required and must be at least 2 characters'])
          })
        );
      });

      it('should fail when name is only whitespace', () => {
        mockRequest = {
          body: {
            name: '   ', // Only spaces
            temperature: 36.5,
            symptoms: ['cough'],
            contactWithInfected: false
          }
        };

        validateHealthDeclaration(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
      });
    });

    describe('Temperature validation', () => {
      it('should fail when temperature is missing', () => {
        mockRequest = {
          body: {
            name: 'John Doe',
            symptoms: ['cough'],
            contactWithInfected: false
          }
        };

        validateHealthDeclaration(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            errors: expect.arrayContaining(['Temperature is required and must be between 30-45 degrees'])
          })
        );
      });

      it('should fail when temperature is too low', () => {
        mockRequest = {
          body: {
            name: 'John Doe',
            temperature: 29.9, // Below minimum
            symptoms: ['cough'],
            contactWithInfected: false
          }
        };

        validateHealthDeclaration(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
      });

      it('should fail when temperature is too high', () => {
        mockRequest = {
          body: {
            name: 'John Doe',
            temperature: 45.1, // Above maximum
            symptoms: ['cough'],
            contactWithInfected: false
          }
        };

        validateHealthDeclaration(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
      });

      it('should fail when temperature is not a number', () => {
        mockRequest = {
          body: {
            name: 'John Doe',
            temperature: '36.5', // String instead of number
            symptoms: ['cough'],
            contactWithInfected: false
          }
        };

        validateHealthDeclaration(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
      });
    });

    describe('Symptoms validation', () => {
      it('should fail when symptoms is missing', () => {
        mockRequest = {
          body: {
            name: 'John Doe',
            temperature: 36.5,
            contactWithInfected: false
          }
        };

        validateHealthDeclaration(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            errors: expect.arrayContaining(['At least one symptom is required'])
          })
        );
      });

      it('should fail when symptoms is empty array', () => {
        mockRequest = {
          body: {
            name: 'John Doe',
            temperature: 36.5,
            symptoms: [], // Empty array
            contactWithInfected: false
          }
        };

        validateHealthDeclaration(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
      });

      it('should fail when symptoms is not an array', () => {
        mockRequest = {
          body: {
            name: 'John Doe',
            temperature: 36.5,
            symptoms: 'cough', // String instead of array
            contactWithInfected: false
          }
        };

        validateHealthDeclaration(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
      });

      it('should pass when symptoms has multiple items', () => {
        mockRequest = {
          body: {
            name: 'John Doe',
            temperature: 36.5,
            symptoms: ['cough', 'fever', 'headache', 'sore throat'],
            contactWithInfected: false
          }
        };

        validateHealthDeclaration(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalledTimes(1);
      });
    });

    describe('Contact with infected validation', () => {
      it('should fail when contactWithInfected is missing', () => {
        mockRequest = {
          body: {
            name: 'John Doe',
            temperature: 36.5,
            symptoms: ['cough']
          }
        };

        validateHealthDeclaration(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            errors: expect.arrayContaining(['Contact with infected must be true or false'])
          })
        );
      });

      it('should fail when contactWithInfected is not boolean', () => {
        mockRequest = {
          body: {
            name: 'John Doe',
            temperature: 36.5,
            symptoms: ['cough'],
            contactWithInfected: 'yes' // String instead of boolean
          }
        };

        validateHealthDeclaration(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
      });

      it('should pass when contactWithInfected is true', () => {
        mockRequest = {
          body: {
            name: 'John Doe',
            temperature: 36.5,
            symptoms: ['cough'],
            contactWithInfected: true
          }
        };

        validateHealthDeclaration(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalledTimes(1);
      });

      it('should pass when contactWithInfected is false', () => {
        mockRequest = {
          body: {
            name: 'John Doe',
            temperature: 36.5,
            symptoms: ['cough'],
            contactWithInfected: false
          }
        };

        validateHealthDeclaration(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalledTimes(1);
      });
    });

    describe('Multiple validation errors', () => {
      it('should return all validation errors when multiple fields are invalid', () => {
        mockRequest = {
          body: {
            name: '', // Invalid: empty
            temperature: 50, // Invalid: too high
            symptoms: [], // Invalid: empty array
            contactWithInfected: 'maybe' // Invalid: not boolean
          }
        };

        validateHealthDeclaration(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Validation failed',
          errors: [
            'Name is required and must be at least 2 characters',
            'Temperature is required and must be between 30-45 degrees',
            'At least one symptom is required',
            'Contact with infected must be true or false'
          ]
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should return specific errors for specific invalid fields', () => {
        mockRequest = {
          body: {
            name: 'Valid Name',
            temperature: 25, // Invalid: too low
            symptoms: ['cough'], // Valid
            contactWithInfected: null // Invalid: not boolean
          }
        };

        validateHealthDeclaration(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Validation failed',
          errors: [
            'Temperature is required and must be between 30-45 degrees',
            'Contact with infected must be true or false'
          ]
        });
      });
    });
  });
});
