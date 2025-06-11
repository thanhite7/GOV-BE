import { HealthDeclarationInput } from '../interface/health-declaration.interface';
import {Declaration} from '../models/healthDeclaration';

const getHealthDeclarationList = async () => {
    const healthDeclarationList = await Declaration.find();
    return healthDeclarationList;
}

const createHealthDeclarationItem = async (data: HealthDeclarationInput) => {
    const newHealthDeclaration = new Declaration({
        name: data.name,
        temperature: data.temperature,
        symptoms: data.symptoms,
        contactWithInfected: data.contactWithInfected
    });
    await newHealthDeclaration.save();
    return newHealthDeclaration;
}
export {
    getHealthDeclarationList,
    createHealthDeclarationItem
}