import { Response } from 'express';
import { Request } from 'express';
import { Prisma } from '../../generated/prisma/client';
function errorHandler(
    err: any,
    req: Request,
    res: Response,

) {
    let statusCode = 500;
    let errorMassage = "Internal Server Error"
    let errorDetails = err

    if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = 400;
        errorMassage = "You provide incorrect field type or missing fields!"
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
            statusCode = 400
            errorMassage = "An operation failed because it depends on one or more records that were requred but not found ."
        } else if (err.code === 'P2002') {
            statusCode = 400
            errorMassage = 'Duplicate key error'
        } else if (err.code === 'P2003') {
            statusCode = 400;
            errorMassage = "Foreign key constincy failed"
        }

    }

    res.status(statusCode)
    res.json({
        message: errorMassage,
        error: errorDetails
    })
}

export default errorHandler;
