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
exports.UpdateTopicDto = void 0;
const class_validator_1 = require("class-validator");
class UpdateTopicDto {
    title;
    size;
    status;
    order;
    isPinned;
    notBefore;
    isSichtung;
}
exports.UpdateTopicDto = UpdateTopicDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTopicDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsEnum)(['S', 'M', 'L', 'XL']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTopicDto.prototype, "size", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsEnum)(['TODO', 'IN_PROGRESS', 'COMPLETED']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTopicDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateTopicDto.prototype, "order", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateTopicDto.prototype, "isPinned", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTopicDto.prototype, "notBefore", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateTopicDto.prototype, "isSichtung", void 0);
//# sourceMappingURL=update-topic.dto.js.map