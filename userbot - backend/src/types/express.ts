import type { NextFunction, Request, Response } from "express";

export interface ExpressContext {
  req: Request;
  res: Response;
  next?: NextFunction;
}

export type ExpressContextPromise = (ctx: ExpressContext) => Promise<unknown>;

export const wrap =
  (fn: ExpressContextPromise) =>
  (req: Request, res: Response, next: NextFunction) => {
    return fn({ req, res, next });
  };
