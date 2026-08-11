import { ZodError } from "zod";
import { errorResponse } from "../utils/response.js";

export const validate = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        return errorResponse(
          res,
          400,
          "Validation failed",
          errors
        );
      }

      req.validatedData = result.data;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        return errorResponse(
          res,
          400,
          "Validation failed",
          errors
        );
      }

      return next(error);
    }
  };
};