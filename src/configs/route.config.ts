import { Router } from 'express';
import path from 'path';
import fs from 'fs';

const routerConfig = Router();
// const BASE_SRC_DIR = path.resolve(process.cwd(), 'src');
// const BASE_ROUTE_DIR = path.resolve(BASE_SRC_DIR, 'routes');
// Use __dirname to always resolve relative to the compiled location (dist/configs or src/configs)
const BASE_ROUTE_DIR = path.resolve(__dirname, '../routes');

const collectFromModule = async (modulePathAbsolute: string): Promise<void> => {
    try {
        if (!modulePathAbsolute.endsWith('.route.ts') && !modulePathAbsolute.endsWith('.route.js')) return;

        console.log(`Attempting to import route: ${modulePathAbsolute}`);
        
        const routeModule = require(modulePathAbsolute);

        if (routeModule?.default) {
            const routeName = path.basename(modulePathAbsolute).replace(/\.route\.(ts|js)$/, '');
            const routePath = routeName === 'index' ? '/' : `/${routeName}`;
            
            routerConfig.use(routePath, routeModule.default);
            console.log(`Route loaded: ${routePath}`);
        } else {
            console.warn(`No default export found in ${modulePathAbsolute}`);
        }
    } catch (error) {
        console.error(`Failed to import ${modulePathAbsolute}`, error);
    }
};


const collectFromDir = async (dirPathAbsolute: string): Promise<void> => {
    try {
        const items = fs.readdirSync(dirPathAbsolute);

        for (const item of items) {
            const itemPathAbsolute = path.join(dirPathAbsolute, item);
            const stats = fs.statSync(itemPathAbsolute);

            if (stats.isDirectory()) {
                await collectFromDir(itemPathAbsolute);
            } else if (stats.isFile() && (item.endsWith('.route.ts') || item.endsWith('.route.js'))) {
                await collectFromModule(itemPathAbsolute);
            }
        }
    } catch (error) {
        console.error(`Error accessing directory ${dirPathAbsolute}:`, error);
    }
};

export const initializeRoutes = async (): Promise<Router> => {
    console.log(`Loading routes from: ${BASE_ROUTE_DIR}`);
    
    if (!fs.existsSync(BASE_ROUTE_DIR)) {
        console.error(`Routes directory not found: ${BASE_ROUTE_DIR}`);
        return routerConfig;
    }
    
    await collectFromDir(BASE_ROUTE_DIR);
    return routerConfig;
};

export default routerConfig;