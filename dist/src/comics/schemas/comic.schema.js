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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComicSchema = exports.Comic = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const chapter_schema_1 = require("./chapter.schema");
let Comic = class Comic {
};
exports.Comic = Comic;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Comic.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Comic.prototype, "slug", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Comic.prototype, "cover", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Comic.prototype, "coverPublicId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Comic.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, ref: 'User' }),
    __metadata("design:type", String)
], Comic.prototype, "uploaderId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Comic.prototype, "authors", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Comic.prototype, "genres", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'ongoing' }),
    __metadata("design:type", String)
], Comic.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [chapter_schema_1.ChapterSchema], default: [] }),
    __metadata("design:type", Array)
], Comic.prototype, "chapters", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Comic.prototype, "views", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Comic.prototype, "followersCount", void 0);
exports.Comic = Comic = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, versionKey: false })
], Comic);
exports.ComicSchema = mongoose_1.SchemaFactory.createForClass(Comic);
exports.ComicSchema.pre('save', function (next) {
    if (!this.authors) {
        this.authors = [];
    }
    if (!Array.isArray(this.authors)) {
        this.authors = [];
    }
    next();
});
