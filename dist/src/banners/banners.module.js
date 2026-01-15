"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BannersModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const banners_service_1 = require("./banners.service");
const banners_controller_1 = require("./banners.controller");
const banner_schema_1 = require("./schemas/banner.schema");
const upload_module_1 = require("../upload/upload.module");
let BannersModule = class BannersModule {
};
exports.BannersModule = BannersModule;
exports.BannersModule = BannersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: banner_schema_1.Banner.name, schema: banner_schema_1.BannerSchema }]),
            upload_module_1.UploadModule,
        ],
        providers: [banners_service_1.BannersService],
        controllers: [banners_controller_1.BannersController],
        exports: [banners_service_1.BannersService],
    })
], BannersModule);
