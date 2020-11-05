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
exports.Scaleway = void 0;
var config_1 = __importDefault(require("../config"));
var uuid_1 = require("uuid");
var axios_1 = __importDefault(require("axios"));
var base_1 = require("./base");
var utils_1 = require("./utils");
var SCW_SECRET_KEY = config_1.default.SCW_SECRET_KEY;
var SCW_ORGANIZATION_ID = config_1.default.SCW_ORGANIZATION_ID;
var region = 'nl-ams-1';
var gatewayHost = 'gateway2.watchparty.me';
var imageId = '1e72e882-f000-4c6e-b538-974af74c2a6a';
// const region = 'fr-par-1';
// const gatewayHost = 'gateway.watchparty.me';
// const imageId = '8e96c468-2769-4314-bb39-f3c941f63d48';
var Scaleway = /** @class */ (function (_super) {
    __extends(Scaleway, _super);
    function Scaleway() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.size = 'DEV1-M'; // DEV1-S, DEV1-M, DEV1-L, GP1-XS
        _this.largeSize = 'GP1-XS';
        _this.redisQueueKey = 'availableListScaleway';
        _this.redisStagingKey = 'stagingListScaleway';
        _this.startVM = function (name) { return __awaiter(_this, void 0, void 0, function () {
            var response, id, response2, response3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, axios_1.default({
                            method: 'POST',
                            url: "https://api.scaleway.com/instance/v1/zones/" + region + "/servers",
                            headers: {
                                'X-Auth-Token': SCW_SECRET_KEY,
                                'Content-Type': 'application/json',
                            },
                            data: {
                                name: name,
                                dynamic_ip_required: true,
                                commercial_type: this.isLarge ? this.largeSize : this.size,
                                image: imageId,
                                volumes: {},
                                organization: SCW_ORGANIZATION_ID,
                                tags: [this.tag],
                            },
                        })];
                    case 1:
                        response = _a.sent();
                        id = response.data.server.id;
                        return [4 /*yield*/, axios_1.default({
                                method: 'PATCH',
                                url: "https://api.scaleway.com/instance/v1/zones/" + region + "/servers/" + id + "/user_data/cloud-init",
                                headers: {
                                    'X-Auth-Token': SCW_SECRET_KEY,
                                    'Content-Type': 'text/plain',
                                },
                                // set userdata for boot action
                                data: utils_1.cloudInit(utils_1.imageName, this.isLarge ? '1920x1080@30' : undefined),
                            })];
                    case 2:
                        response2 = _a.sent();
                        return [4 /*yield*/, axios_1.default({
                                method: 'POST',
                                url: "https://api.scaleway.com/instance/v1/zones/" + region + "/servers/" + id + "/action",
                                headers: {
                                    'X-Auth-Token': SCW_SECRET_KEY,
                                    'Content-Type': 'application/json',
                                },
                                data: {
                                    action: 'poweron',
                                },
                            })];
                    case 3:
                        response3 = _a.sent();
                        // console.log(response3.data);
                        return [2 /*return*/, id];
                }
            });
        }); };
        _this.terminateVM = function (id) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, axios_1.default({
                            method: 'POST',
                            url: "https://api.scaleway.com/instance/v1/zones/" + region + "/servers/" + id + "/action",
                            headers: {
                                'X-Auth-Token': SCW_SECRET_KEY,
                                'Content-Type': 'application/json',
                            },
                            data: {
                                action: 'terminate',
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
                                method: 'PATCH',
                                url: "https://api.scaleway.com/instance/v1/zones/" + region + "/servers/" + id,
                                headers: {
                                    'X-Auth-Token': SCW_SECRET_KEY,
                                    'Content-Type': 'application/json',
                                },
                                data: {
                                    name: password,
                                    tags: [this.tag],
                                },
                            })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, axios_1.default({
                                method: 'POST',
                                url: "https://api.scaleway.com/instance/v1/zones/" + region + "/servers/" + id + "/action",
                                headers: {
                                    'X-Auth-Token': SCW_SECRET_KEY,
                                    'Content-Type': 'application/json',
                                },
                                data: {
                                    action: 'reboot',
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
                            url: "https://api.scaleway.com/instance/v1/zones/" + region + "/servers/" + id,
                            headers: {
                                'X-Auth-Token': SCW_SECRET_KEY,
                                'Content-Type': 'application/json',
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
            var mapping, tags, response;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mapping = {
                            available: 'available',
                            inUse: 'inUse',
                        };
                        tags = mapping[filter];
                        return [4 /*yield*/, axios_1.default({
                                method: 'GET',
                                url: "https://api.scaleway.com/instance/v1/zones/" + region + "/servers",
                                headers: {
                                    'X-Auth-Token': SCW_SECRET_KEY,
                                    'Content-Type': 'application/json',
                                },
                                params: {
                                    // TODO need to update if over 100 results
                                    per_page: 100,
                                    tags: tags,
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
        _this.powerOn = function (id) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); }); };
        _this.mapServerObject = function (server) { return ({
            id: server.id,
            pass: server.name,
            // The gateway handles SSL termination and proxies to the private IP
            host: gatewayHost + "/?ip=" + server.private_ip,
            private_ip: server.private_ip,
            state: server.state,
            tags: server.tags,
            creation_date: server.creation_date,
            provider: _this.getRedisQueueKey(),
            large: _this.isLarge,
        }); };
        return _this;
    }
    return Scaleway;
}(base_1.VMManager));
exports.Scaleway = Scaleway;
