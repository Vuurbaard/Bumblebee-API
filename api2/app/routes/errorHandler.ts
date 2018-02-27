import { Request, Response, NextFunction } from "express";

export function ErrorHandler(err: any, req: Request, res: Response, message: string) {
    if (err.name == "CastError") { 
        res.sendStatus(400); 
    }
    else if (err) { 
        res.sendStatus(500); 
    }
}