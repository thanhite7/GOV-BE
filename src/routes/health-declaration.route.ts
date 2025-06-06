import { Router } from "express";
import {getHealthDeclaration,createHealthDeclaration} from "../controllers/health-declaration.controller";
const healthDeclarationRouter = Router();
healthDeclarationRouter.get("/", getHealthDeclaration);
healthDeclarationRouter.post("/", createHealthDeclaration);
export default healthDeclarationRouter;