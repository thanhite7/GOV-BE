import { NextFunction, Request, Response } from "express";
import { getHealthDeclarationList, createHealthDeclarationItem } from "../service/health-declaration.service";
const getHealthDeclaration = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const healthDeclarationList = await getHealthDeclarationList();
        res.status(200).json(healthDeclarationList);
    }catch (error) {
        console.error("Error in getHealthDeclaration:", error);
        res.status(500).json({ message: "Internal Server Error" });
        return;
    }
};
const createHealthDeclaration = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, temperature, symptoms, contactWithInfected } = req.body;
        console.log({ name, temperature, symptoms, contactWithInfected });
        if (!name || !temperature || !Array.isArray(symptoms) || typeof contactWithInfected !== 'boolean') {
            res.status(500).json({ message: "Bad Request: Missing required fields" });
            return;
        }
        const newHealthDeclaration = await createHealthDeclarationItem({
            name,
            temperature,
            symptoms,
            contactWithInfected
        });
        res.status(200).json(newHealthDeclaration);
    } catch (error) {
        console.error("Error in createHealthDeclaration:", error);
        res.status(500).json({ message: "Internal Server Error" });
        return;
    }
};


export {
    getHealthDeclaration,
    createHealthDeclaration
}
