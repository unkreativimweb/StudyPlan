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
exports.BlockerController = void 0;
const common_1 = require("@nestjs/common");
const blocker_service_1 = require("./blocker.service");
const create_blocker_dto_1 = require("./dto/create-blocker.dto");
let BlockerController = class BlockerController {
    blockerService;
    constructor(blockerService) {
        this.blockerService = blockerService;
    }
    create(createBlockerDto) {
        return this.blockerService.create(createBlockerDto);
    }
    findAll() {
        return this.blockerService.findAll();
    }
    remove(id) {
        return this.blockerService.remove(id);
    }
};
exports.BlockerController = BlockerController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_blocker_dto_1.CreateBlockerDto]),
    __metadata("design:returntype", void 0)
], BlockerController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BlockerController.prototype, "findAll", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BlockerController.prototype, "remove", null);
exports.BlockerController = BlockerController = __decorate([
    (0, common_1.Controller)('blockers'),
    __metadata("design:paramtypes", [blocker_service_1.BlockerService])
], BlockerController);
//# sourceMappingURL=blocker.controller.js.map