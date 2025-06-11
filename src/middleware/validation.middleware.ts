import { Request, Response, NextFunction } from 'express';

const validateHealthDeclaration = (req: Request, res: Response, next: NextFunction) => {
  const { name, temperature, symptoms, contactWithInfected } = req.body;
  const errors: string[] = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters');
  }

  if (!temperature || typeof temperature !== 'number' || temperature < 30 || temperature > 45) {
    errors.push('Temperature is required and must be between 30-45 degrees');
  }

  if (!Array.isArray(symptoms) || symptoms.length === 0) {
    errors.push('At least one symptom is required');
  }

  if (typeof contactWithInfected !== 'boolean') {
    errors.push('Contact with infected must be true or false');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

export { validateHealthDeclaration };
