import { Request, Response, NextFunction } from 'express';
import { validationResult, FieldValidationError } from 'express-validator';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Invalid input data',
      details: errors.array().map(error => {
        const fieldError = error as FieldValidationError;
        return {
          field: fieldError.path,
          message: fieldError.msg,
          value: fieldError.value,
        };
      }),
    });
    return;
  }

  next();
};
