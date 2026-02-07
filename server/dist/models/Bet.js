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
exports.Bet = exports.BetStatus = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Game_1 = require("./Game");
var BetStatus;
(function (BetStatus) {
    BetStatus["ACTIVE"] = "active";
    BetStatus["CASHED_OUT"] = "cashed_out";
    BetStatus["LOST"] = "lost";
})(BetStatus || (exports.BetStatus = BetStatus = {}));
let Bet = class Bet {
};
exports.Bet = Bet;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Bet.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], Bet.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], Bet.prototype, "gameId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Bet.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Bet.prototype, "cashedOutAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Bet.prototype, "payout", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: BetStatus,
        default: BetStatus.ACTIVE
    }),
    __metadata("design:type", String)
], Bet.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Bet.prototype, "cashedOutAtTime", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Bet.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.bets),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", User_1.User)
], Bet.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Game_1.Game, (game) => game.bets),
    (0, typeorm_1.JoinColumn)({ name: 'gameId' }),
    __metadata("design:type", Game_1.Game)
], Bet.prototype, "game", void 0);
exports.Bet = Bet = __decorate([
    (0, typeorm_1.Entity)('bets')
], Bet);
//# sourceMappingURL=Bet.js.map