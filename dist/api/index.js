"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
let app = null;
async function bootstrap() {
    if (app) {
        return app;
    }
    try {
        app = await core_1.NestFactory.create(app_module_1.AppModule);
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        app.enableCors({
            origin: clientUrl,
            credentials: true,
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            allowedHeaders: 'Content-Type,Authorization',
        });
        await app.init();
        console.log('NestJS app initialized successfully');
    }
    catch (error) {
        console.error('Error initializing app:', error);
        throw error;
    }
    return app;
}
exports.default = async (req, res) => {
    try {
        const nestApp = await bootstrap();
        const server = nestApp.getHttpAdapter().getInstance();
        return server(req, res);
    }
    catch (error) {
        console.error('Serverless handler error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
