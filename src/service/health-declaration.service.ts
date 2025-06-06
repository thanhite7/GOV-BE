import { HealthDeclarationInput } from '../interface/health-declaration.interface';
import {Declaration} from '../models/healthDeclaration';

const getHealthDeclarationList = async () => {
    try {
        const healthDeclarationList = await Declaration.find();
        return healthDeclarationList;
    }
    catch (error) {
        console.error("Error in getHealthDeclarationList:", error);
        throw new Error("Internal Server Error");
    }
}

const createHealthDeclarationItem = async (data: HealthDeclarationInput) => {
    try {
        const newHealthDeclaration = new Declaration({
            name: data.name,
            temperature: data.temperature,
            symptoms: data.symptoms,
            contactWithInfected: data.contactWithInfected
        });
        await newHealthDeclaration.save();
        return newHealthDeclaration;
    } catch (error) {
        console.error("Error in createHealthDeclarationItem:", error);
        throw new Error("Internal Server Error");
    }
}
export {
    getHealthDeclarationList,
    createHealthDeclarationItem
}