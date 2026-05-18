import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError } from 'zod';

const zodValidationRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedBody = await schema.parseAsync(req.body);
      req.body = parsedBody;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const formatted = err.flatten();
        console.log(formatted);
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: formatted.fieldErrors,
          formErrors: formatted.formErrors,
        });
      }

      return next(err);
    }
  };
};

export default zodValidationRequest;
