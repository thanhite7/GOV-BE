import { getHealthDeclarationList, createHealthDeclarationItem } from '../../../src/service/health-declaration.service';
import { Declaration } from '../../../src/models/healthDeclaration';
import { HealthDeclarationInput } from '../../../src/interface/health-declaration.interface';

jest.mock('../../../src/models/healthDeclaration', () => ({
  Declaration: {
    find: jest.fn(),
    save: jest.fn(),
  }
}));

const mockDeclaration = Declaration as jest.Mocked<typeof Declaration>;

describe('Health Declaration Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getHealthDeclarationList', () => {
    it('should return list of health declarations', async () => {
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

      mockDeclaration.find.mockResolvedValue(mockHealthDeclarations);
      const result = await getHealthDeclarationList();

      expect(mockDeclaration.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockHealthDeclarations);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('John Doe');
      expect(result[1].name).toBe('Jane Smith');
    });

    it('should return empty array when no declarations exist', async () => {
      mockDeclaration.find.mockResolvedValue([]);
      const result = await getHealthDeclarationList();

      expect(mockDeclaration.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should throw error when database operation fails', async () => {
      const errorMessage = 'Database connection failed';
      mockDeclaration.find.mockRejectedValue(new Error(errorMessage));

      await expect(getHealthDeclarationList()).rejects.toThrow(errorMessage);
      expect(mockDeclaration.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('createHealthDeclarationItem', () => {
    it('should create and save a new health declaration', async () => {
      const inputData: HealthDeclarationInput = {
        name: 'Test User',
        temperature: 36.8,
        symptoms: ['cough', 'sore throat'],
        contactWithInfected: false
      };

      const mockSavedDeclaration = {
        _id: '507f1f77bcf86cd799439013',
        ...inputData,
        createdAt: new Date('2023-01-03'),
        updatedAt: new Date('2023-01-03'),
        save: jest.fn().mockResolvedValue(true)
      };

      const mockConstructor = jest.fn().mockImplementation(() => mockSavedDeclaration);
      (Declaration as any) = mockConstructor;

      const result = await createHealthDeclarationItem(inputData);

      expect(mockConstructor).toHaveBeenCalledWith({
        name: inputData.name,
        temperature: inputData.temperature,
        symptoms: inputData.symptoms,
        contactWithInfected: inputData.contactWithInfected
      });
      expect(mockSavedDeclaration.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSavedDeclaration);
    });

    it('should throw error when save operation fails', async () => {
      const inputData: HealthDeclarationInput = {
        name: 'Test User',
        temperature: 36.8,
        symptoms: ['cough'],
        contactWithInfected: false
      };

      const errorMessage = 'Save operation failed';
      const mockDeclarationWithError = {
        save: jest.fn().mockRejectedValue(new Error(errorMessage))
      };

      const mockConstructor = jest.fn().mockImplementation(() => mockDeclarationWithError);
      (Declaration as any) = mockConstructor;

      await expect(createHealthDeclarationItem(inputData)).rejects.toThrow(errorMessage);
      expect(mockConstructor).toHaveBeenCalledTimes(1);
      expect(mockDeclarationWithError.save).toHaveBeenCalledTimes(1);
    });

    it('should handle different symptom combinations', async () => {
      const testCases = [
        {
          name: 'User 1',
          temperature: 37.5,
          symptoms: ['fever'],
          contactWithInfected: true
        },
        {
          name: 'User 2',
          temperature: 36.2,
          symptoms: ['cough', 'headache', 'fatigue'],
          contactWithInfected: false
        },
        {
          name: 'User 3',
          temperature: 38.1,
          symptoms: ['sore throat', 'runny nose'],
          contactWithInfected: true
        }
      ];

      for (const testCase of testCases) {
        const mockSavedDeclaration = {
          _id: `507f1f77bcf86cd79943901${testCases.indexOf(testCase)}`,
          ...testCase,
          save: jest.fn().mockResolvedValue(true)
        };

        const mockConstructor = jest.fn().mockImplementation(() => mockSavedDeclaration);
        (Declaration as any) = mockConstructor;

        const result = await createHealthDeclarationItem(testCase);

        expect(result.name).toBe(testCase.name);
        expect(result.temperature).toBe(testCase.temperature);
        expect(result.symptoms).toEqual(testCase.symptoms);
        expect(result.contactWithInfected).toBe(testCase.contactWithInfected);
      }
    });
  });
});
