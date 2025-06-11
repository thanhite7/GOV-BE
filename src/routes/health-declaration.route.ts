import { Router } from "express";
import { getHealthDeclaration, createHealthDeclaration } from "../controllers/health-declaration.controller";
import { validateHealthDeclaration } from "../middleware/validation.middleware";

const healthDeclarationRouter = Router();

healthDeclarationRouter.get("/", getHealthDeclaration);
healthDeclarationRouter.post("/", validateHealthDeclaration, createHealthDeclaration);

export default healthDeclarationRouter;