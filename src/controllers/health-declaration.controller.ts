import { NextFunction, Request, Response } from "express";
import { getHealthDeclarationList, createHealthDeclarationItem } from "../service/health-declaration.service";
import catchAsync from "../utils/catchAsync";

const getHealthDeclaration = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const healthDeclarationList = await getHealthDeclarationList();
    res.status(200).json({
        success: true,
        message: 'Health declarations retrieved successfully',
        data: healthDeclarationList
    });
});

const createHealthDeclaration = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { name, temperature, symptoms, contactWithInfected } = req.body;
    const newHealthDeclaration = await createHealthDeclarationItem({
        name,
        temperature,
        symptoms,
        contactWithInfected
    });
    
    res.status(201).json({
        success: true,
        message: 'Health declaration created successfully',
        data: newHealthDeclaration
    });
});


export {
    getHealthDeclaration,
    createHealthDeclaration
}
