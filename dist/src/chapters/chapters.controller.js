"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChaptersController = void 0;
const common_1 = require("@nestjs/common");
const comics_service_1 = require("../comics/comics.service");
let ChaptersController = class ChaptersController {
    constructor(comicsService) {
        this.comicsService = comicsService;
    }
    async list(comicId, page = '1', limit = '20') {
        if (!comicId)
            throw new common_1.NotFoundException('comicId is required');
        const comic = await this.comicsService.findById(comicId);
        const p = parseInt(page, 10) || 1;
        const l = parseInt(limit, 10) || 20;
        const skip = (p - 1) * l;
        const total = comic.chapters.length;
        const items = comic.chapters.slice(skip, skip + l);
        return { items, total, page: p, limit: l };
    }
    async getOne(comicId, index) {
        const comic = await this.comicsService.findById(comicId);
        const idx = parseInt(index, 10);
        if (isNaN(idx) || idx < 0 || idx >= comic.chapters.length) {
            throw new common_1.NotFoundException('Chapter not found');
        }
        return comic.chapters[idx];
    }
    async getById(id) {
        const result = await this.comicsService.findChapterById(id);
        return result;
    }
};
exports.ChaptersController = ChaptersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('comicId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ChaptersController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':comicId/:index'),
    __param(0, (0, common_1.Param)('comicId')),
    __param(1, (0, common_1.Param)('index')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ChaptersController.prototype, "getOne", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChaptersController.prototype, "getById", null);
exports.ChaptersController = ChaptersController = __decorate([
    (0, common_1.Controller)('chapters'),
    __metadata("design:paramtypes", [comics_service_1.ComicsService])
], ChaptersController);
