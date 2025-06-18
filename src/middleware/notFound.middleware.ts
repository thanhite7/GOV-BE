import { Request, Response, NextFunction } from 'express';

const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  (error as any).statusCode = 404;
  console.log(`Not Found: ${req.originalUrl}`);
  next(error);
};

export default notFoundHandler;