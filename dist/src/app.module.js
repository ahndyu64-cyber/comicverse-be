"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const comics_1 = require("./comics");
const auth_module_1 = require("./auth/auth.module");
const categories_module_1 = require("./categories/categories.module");
const comments_module_1 = require("./comments/comments.module");
const users_module_1 = require("./users/users.module");
const upload_module_1 = require("./upload/upload.module");
const chapters_module_1 = require("./chapters/chapters.module");
const ping_module_1 = require("./ping/ping.module");
const admin_module_1 = require("./admin/admin.module");
const banners_module_1 = require("./banners/banners.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const uri = configService.get('MONGO_URI') || 'mongodb://localhost:27017/comicverse';
                    console.log('Connecting to MongoDB...');
                    console.log('MONGO_URI exists:', !!uri);
                    return {
                        uri,
                        useNewUrlParser: true,
                        useUnifiedTopology: true,
                        serverSelectionTimeoutMS: 10000,
                        connectTimeoutMS: 10000,
                        socketTimeoutMS: 45000,
                        family: 4,
                        retryWrites: true,
                        w: 'majority',
                    };
                },
            }),
            comics_1.ComicsModule,
            auth_module_1.AuthModule,
            categories_module_1.CategoriesModule,
            comments_module_1.CommentsModule,
            users_module_1.UsersModule,
            upload_module_1.UploadModule,
            chapters_module_1.ChaptersModule,
            ping_module_1.PingModule,
            admin_module_1.AdminModule,
            banners_module_1.BannersModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
