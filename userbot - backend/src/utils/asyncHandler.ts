import type { Request, Response, NextFunction } from "express";
import type { ExpressContextPromise } from "../types/express.js";

const asyncHandler = (fn: ExpressContextPromise) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn({ req, res, next }).catch(next);
  };
};

export default asyncHandler;
