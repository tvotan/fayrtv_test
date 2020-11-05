"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hetzner = void 0;
var config_1 = __importDefault(require("../config"));
var axios_1 = __importDefault(require("axios"));
var uuid_1 = require("uuid");
var base_1 = require("./base");
var utils_1 = require("./utils");
var HETZNER_TOKEN = config_1.default.HETZNER_TOKEN;
// const region = 'nbg1';
var region = 'hel1';
var gatewayHost = 'gateway3.watchparty.me';
var sshKeys = [1570536];
var networks = [91163];
var imageId = 24655969;
var Hetzner = /** @class */ (function (_super) {
    __extends(Hetzner, _super);
    function Hetzner() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.size = 'cpx11'; // cx11, cpx11, cpx21, cpx31, ccx11
        _this.largeSize = 'cpx31';
        _this.redisQueueKey = 'availableListHetzner';
        _this.redisStagingKey = 'stagingListHetzner';
        _this.startVM = function (name) { return __awaiter(_this, void 0, void 0, function () {
            var response, id;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, axios_1.default({
                            method: 'POST',
                            url: "https://api.hetzner.cloud/v1/servers",
                            headers: {
                                Authorization: 'Bearer ' + HETZNER_TOKEN,
                                'Content-Type': 'application/json',
                            },
                            data: {
                                name: name,
                                server_type: this.isLarge ? this.largeSize : this.size,
                                start_after_create: true,
                                image: imageId,
                                ssh_keys: sshKeys,
                                networks: networks,
                                user_data: utils_1.cloudInit(utils_1.imageName, this.isLarge ? '1920x1080@30' : undefined),
                                labels: (_a = {},
                                    _a[this.tag] = '1',
                                    _a.originalName = name,
                                    _a),
                                location: region,
                            },
                        })];
                    case 1:
                        response = _b.sent();
                        id = response.data.server.id;
                        return [2 /*return*/, id];
                }
            });
        }); };
        _this.terminateVM = function (id) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, axios_1.default({
                            method: 'DELETE',
                            url: "https://api.hetzner.cloud/v1/servers/" + id,
                            headers: {
                                Authorization: 'Bearer ' + HETZNER_TOKEN,
                            },
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        _this.rebootVM = function (id) { return __awaiter(_this, void 0, void 0, function () {
            var password, response, response2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        password = uuid_1.v4();
                        return [4 /*yield*/, axios_1.default({
                                method: 'PUT',
                                url: "https://api.hetzner.cloud/v1/servers/" + id,
                                headers: {
                                    Authorization: 'Bearer ' + HETZNER_TOKEN,
                                    'Content-Type': 'application/json',
                                },
                                data: {
                                    name: password,
                                },
                            })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, axios_1.default({
                                method: 'POST',
                                url: "https://api.hetzner.cloud/v1/servers/" + id + "/actions/rebuild",
                                headers: {
                                    Authorization: 'Bearer ' + HETZNER_TOKEN,
                                },
                                data: {
                                    image: imageId,
                                },
                            })];
                    case 2:
                        response2 = _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        _this.getVM = function (id) { return __awaiter(_this, void 0, void 0, function () {
            var response, server;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, axios_1.default({
                            method: 'GET',
                            url: "https://api.hetzner.cloud/v1/servers/" + id,
                            headers: {
                                Authorization: 'Bearer ' + HETZNER_TOKEN,
                            },
                        })];
                    case 1:
                        response = _a.sent();
                        server = this.mapServerObject(response.data.server);
                        if (!server.private_ip) {
                            throw new Error('vm not ready');
                        }
                        return [2 /*return*/, server];
                }
            });
        }); };
        _this.listVMs = function (filter) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, axios_1.default({
                            method: 'GET',
                            url: "https://api.hetzner.cloud/v1/servers",
                            headers: {
                                Authorization: 'Bearer ' + HETZNER_TOKEN,
                            },
                            params: {
                                // TODO paginate if this is too large
                                per_page: 50,
                                label_selector: filter,
                            },
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data.servers
                                .map(this.mapServerObject)
                                .filter(function (server) { return server.tags.includes(_this.tag) && server.private_ip; })];
                }
            });
        }); };
        _this.powerOn = function (id) { return __awaiter(_this, void 0, void 0, function () {
            var response2, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default({
                                method: 'POST',
                                url: "https://api.hetzner.cloud/v1/servers/" + id + "/actions/poweron",
                                headers: {
                                    Authorization: 'Bearer ' + HETZNER_TOKEN,
                                    'Content-Type': 'application/json',
                                },
                            })];
                    case 1:
                        response2 = _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        console.error('failed to poweron');
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        _this.mapServerObject = function (server) {
            var _a, _b, _c, _d, _e;
            return ({
                id: (_a = server.id) === null || _a === void 0 ? void 0 : _a.toString(),
                pass: server.name,
                // The gateway handles SSL termination and proxies to the private IP
                host: gatewayHost + "/?ip=" + ((_c = (_b = server.private_net) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.ip),
                private_ip: (_e = (_d = server.private_net) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.ip,
                state: server.status,
                tags: Object.keys(server.labels),
                creation_date: server.created,
                originalName: server.labels.originalName,
                provider: _this.getRedisQueueKey(),
                large: _this.isLarge,
            });
        };
        return _this;
    }
    return Hetzner;
}(base_1.VMManager));
exports.Hetzner = Hetzner;
