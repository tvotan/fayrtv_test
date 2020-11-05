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
exports.DigitalOcean = void 0;
var config_1 = __importDefault(require("../config"));
var uuid_1 = require("uuid");
var axios_1 = __importDefault(require("axios"));
var base_1 = require("./base");
var utils_1 = require("./utils");
var DO_TOKEN = config_1.default.DO_TOKEN;
var region = 'sfo2';
var gatewayHost = 'gateway4.watchparty.me';
var imageId = 64531018;
var sshKeys = ['cc:3d:a7:d3:99:17:fe:b7:dd:59:c4:78:14:d4:02:d1'];
var DigitalOcean = /** @class */ (function (_super) {
    __extends(DigitalOcean, _super);
    function DigitalOcean() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.size = 's-2vcpu-2gb'; // s-1vcpu-1gb, s-1vcpu-2gb, s-2vcpu-2gb, s-4vcpu-8gb, c-2
        _this.largeSize = 's-2vcpu-2gb';
        _this.redisQueueKey = 'availableListDO';
        _this.redisStagingKey = 'stagingListDO';
        _this.startVM = function (name) { return __awaiter(_this, void 0, void 0, function () {
            var response, id;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, axios_1.default({
                            method: 'POST',
                            url: "https://api.digitalocean.com/v2/droplets",
                            headers: {
                                Authorization: 'Bearer ' + DO_TOKEN,
                                'Content-Type': 'application/json',
                            },
                            data: {
                                name: name,
                                region: region,
                                size: this.isLarge ? this.largeSize : this.size,
                                image: imageId,
                                ssh_keys: sshKeys,
                                private_networking: true,
                                user_data: utils_1.cloudInit(utils_1.imageName, this.isLarge ? '1920x1080@30' : undefined),
                                tags: [this.tag],
                            },
                        })];
                    case 1:
                        response = _a.sent();
                        id = response.data.droplet.id;
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
                            url: "https://api.digitalocean.com/v2/droplets/" + id,
                            headers: {
                                Authorization: 'Bearer ' + DO_TOKEN,
                                'Content-Type': 'application/json',
                            },
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        _this.rebootVM = function (id) { return __awaiter(_this, void 0, void 0, function () {
            var password, response, actionId, response3, response2;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        password = uuid_1.v4();
                        return [4 /*yield*/, axios_1.default({
                                method: 'POST',
                                url: "https://api.digitalocean.com/v2/droplets/" + id + "/actions",
                                headers: {
                                    Authorization: 'Bearer ' + DO_TOKEN,
                                    'Content-Type': 'application/json',
                                },
                                data: {
                                    type: 'rename',
                                    name: password,
                                },
                            })];
                    case 1:
                        response = _c.sent();
                        actionId = response.data.action.id;
                        _c.label = 2;
                    case 2:
                        if (!true) return [3 /*break*/, 7];
                        return [4 /*yield*/, axios_1.default({
                                method: 'GET',
                                url: "https://api.digitalocean.com/v2/actions/" + actionId,
                                headers: {
                                    Authorization: 'Bearer ' + DO_TOKEN,
                                    'Content-Type': 'application/json',
                                },
                            })];
                    case 3:
                        response3 = _c.sent();
                        if (!(((_b = (_a = response3 === null || response3 === void 0 ? void 0 : response3.data) === null || _a === void 0 ? void 0 : _a.action) === null || _b === void 0 ? void 0 : _b.status) === 'completed')) return [3 /*break*/, 4];
                        return [3 /*break*/, 7];
                    case 4: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 3000); })];
                    case 5:
                        _c.sent();
                        _c.label = 6;
                    case 6: return [3 /*break*/, 2];
                    case 7: return [4 /*yield*/, axios_1.default({
                            method: 'POST',
                            url: "https://api.digitalocean.com/v2/droplets/" + id + "/actions",
                            headers: {
                                Authorization: 'Bearer ' + DO_TOKEN,
                                'Content-Type': 'application/json',
                            },
                            data: {
                                type: 'rebuild',
                                image: imageId,
                            },
                        })];
                    case 8:
                        response2 = _c.sent();
                        // Reboot the VM
                        // const response2 = await axios({
                        //   method: 'POST',
                        //   url: `https://api.digitalocean.com/v2/droplets/${id}/actions`,
                        //   headers: {
                        //     Authorization: 'Bearer ' + DO_TOKEN,
                        //     'Content-Type': 'application/json',
                        //   },
                        //   data: {
                        //     type: 'reboot',
                        //   },
                        // });
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
                            url: "https://api.digitalocean.com/v2/droplets/" + id,
                            headers: {
                                Authorization: 'Bearer ' + DO_TOKEN,
                                'Content-Type': 'application/json',
                            },
                        })];
                    case 1:
                        response = _a.sent();
                        server = this.mapServerObject(response.data.droplet);
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
                            url: "https://api.digitalocean.com/v2/droplets",
                            headers: {
                                Authorization: 'Bearer ' + DO_TOKEN,
                                'Content-Type': 'application/json',
                            },
                            params: {
                                // TODO need to update if over 100 results
                                per_page: 100,
                                tag_name: filter,
                            },
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data.droplets
                                .map(this.mapServerObject)
                                .filter(function (server) { return server.tags.includes(_this.tag) && server.private_ip; })];
                }
            });
        }); };
        _this.powerOn = function (id) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); }); };
        _this.mapServerObject = function (server) {
            var _a, _b;
            var ip = (_a = server.networks.v4.find(function (network) { return network.type === 'private'; })) === null || _a === void 0 ? void 0 : _a.ip_address;
            return {
                id: (_b = server.id) === null || _b === void 0 ? void 0 : _b.toString(),
                pass: server.name,
                // The gateway handles SSL termination and proxies to the private IP
                host: gatewayHost + "/?ip=" + ip,
                private_ip: ip,
                state: server.status,
                tags: server.tags,
                creation_date: server.created_at,
                provider: _this.getRedisQueueKey(),
                large: _this.isLarge,
            };
        };
        return _this;
    }
    return DigitalOcean;
}(base_1.VMManager));
exports.DigitalOcean = DigitalOcean;
