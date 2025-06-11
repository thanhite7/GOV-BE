import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { Declaration } from '../../src/models/healthDeclaration';
import { getHealthDeclarationList, createHealthDeclarationItem } from '../../src/service/health-declaration.service';
import { HealthDeclarationInput } from '../../src/interface/health-declaration.interface';

describe('Health Declaration Service', () => {
    let mongoServer: MongoMemoryServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await Declaration.deleteMany({});
    });

    describe('getHealthDeclarationList', () => {
        it('should return an empty array when no declarations exist', async () => {
            const result = await getHealthDeclarationList();
            
            expect(result).toEqual([]);
            expect(Array.isArray(result)).toBe(true);
        });

        it('should return all health declarations from database', async () => {
            const testDeclarations = [
                {
                    name: 'John Doe',
                    temperature: 36.5,
                    symptoms: ['cough'],
                    contactWithInfected: false
                },
                {
                    name: 'Jane Smith',
                    temperature: 37.2,
                    symptoms: ['fever', 'headache'],
                    contactWithInfected: true
                }
            ];

            await Declaration.insertMany(testDeclarations);

            const result = await getHealthDeclarationList();

            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('John Doe');
            expect(result[0].temperature).toBe(36.5);
            expect(result[0].symptoms).toEqual(['cough']);
            expect(result[0].contactWithInfected).toBe(false);
            
            expect(result[1].name).toBe('Jane Smith');
            expect(result[1].temperature).toBe(37.2);
            expect(result[1].symptoms).toEqual(['fever', 'headache']);
            expect(result[1].contactWithInfected).toBe(true);
        });

        it('should handle database errors gracefully', async () => {
            jest.spyOn(Declaration, 'find').mockRejectedValueOnce(new Error('Database connection failed'));

            await expect(getHealthDeclarationList()).rejects.toThrow('Database connection failed');

            jest.restoreAllMocks();
        });
    });

    describe('createHealthDeclarationItem', () => {
        it('should create a new health declaration with valid data', async () => {
            const inputData: HealthDeclarationInput = {
                name: 'John Doe',
                temperature: 36.5,
                symptoms: ['cough', 'sore throat'],
                contactWithInfected: false
            };

            const result = await createHealthDeclarationItem(inputData);

            expect(result).toBeDefined();
            expect(result.name).toBe('John Doe');
            expect(result.temperature).toBe(36.5);
            expect(result.symptoms).toEqual(['cough', 'sore throat']);
            expect(result.contactWithInfected).toBe(false);
            expect(result._id).toBeDefined();

            const savedDeclaration = await Declaration.findById(result._id);
            expect(savedDeclaration).toBeTruthy();
            expect(savedDeclaration?.name).toBe('John Doe');
        });

        it('should create health declaration with high temperature', async () => {
            const inputData: HealthDeclarationInput = {
                name: 'Jane Smith',
                temperature: 38.5,
                symptoms: ['fever', 'headache', 'body aches'],
                contactWithInfected: true
            };

            const result = await createHealthDeclarationItem(inputData);

            expect(result.name).toBe('Jane Smith');
            expect(result.temperature).toBe(38.5);
            expect(result.symptoms).toEqual(['fever', 'headache', 'body aches']);
            expect(result.contactWithInfected).toBe(true);
        });

        it('should create health declaration with empty symptoms array', async () => {
            const inputData: HealthDeclarationInput = {
                name: 'Healthy Person',
                temperature: 36.2,
                symptoms: [],
                contactWithInfected: false
            };

            const result = await createHealthDeclarationItem(inputData);

            expect(result.name).toBe('Healthy Person');
            expect(result.temperature).toBe(36.2);
            expect(result.symptoms).toEqual([]);
            expect(result.contactWithInfected).toBe(false);
        });

        it('should handle database save errors', async () => {
            const inputData: HealthDeclarationInput = {
                name: 'Test User',
                temperature: 37.0,
                symptoms: ['cough'],
                contactWithInfected: false
            };

            const mockSave = jest.fn().mockRejectedValue(new Error('Save failed'));
            jest.spyOn(Declaration.prototype, 'save').mockImplementation(mockSave);

            await expect(createHealthDeclarationItem(inputData)).rejects.toThrow('Save failed');

            jest.restoreAllMocks();
        });

        it('should persist data correctly in database', async () => {
            const inputData: HealthDeclarationInput = {
                name: 'Persistent Test',
                temperature: 36.8,
                symptoms: ['runny nose'],
                contactWithInfected: true
            };

            await createHealthDeclarationItem(inputData);

            const allDeclarations = await getHealthDeclarationList();
            
            expect(allDeclarations).toHaveLength(1);
            expect(allDeclarations[0].name).toBe('Persistent Test');
            expect(allDeclarations[0].temperature).toBe(36.8);
            expect(allDeclarations[0].symptoms).toEqual(['runny nose']);
            expect(allDeclarations[0].contactWithInfected).toBe(true);
        });
    });

    describe('Integration tests', () => {
        it('should create multiple declarations and retrieve them all', async () => {
            const declarations: HealthDeclarationInput[] = [
                {
                    name: 'User 1',
                    temperature: 36.5,
                    symptoms: ['cough'],
                    contactWithInfected: false
                },
                {
                    name: 'User 2',
                    temperature: 37.8,
                    symptoms: ['fever', 'headache'],
                    contactWithInfected: true
                },
                {
                    name: 'User 3',
                    temperature: 36.2,
                    symptoms: [],
                    contactWithInfected: false
                }
            ];

            for (const declaration of declarations) {
                await createHealthDeclarationItem(declaration);
            }

            const result = await getHealthDeclarationList();

            expect(result).toHaveLength(3);
            expect(result.map((d: any) => d.name)).toEqual(['User 1', 'User 2', 'User 3']);
            expect(result.map((d: any) => d.temperature)).toEqual([36.5, 37.8, 36.2]);
        });
    });
});