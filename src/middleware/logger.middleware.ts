import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logToFile = (message: string) => {
  const logFile = path.join(logsDir, `app-${new Date().toISOString().split('T')[0]}.log`);
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logFile, `${timestamp} - ${message}\n`);
};

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  const requestLog = `${req.method} ${req.url}`;
  console.log(`[${new Date().toISOString()}] ${requestLog}`);
  logToFile(`REQUEST: ${requestLog}`);
  
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const duration = Date.now() - start;
    const responseLog = `${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`;
    console.log(`[${new Date().toISOString()}] ${responseLog}`);
    logToFile(`RESPONSE: ${responseLog}`);
    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

export default requestLogger;
