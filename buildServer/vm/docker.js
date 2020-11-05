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
exports.Docker = void 0;
// This assumes an installation of Docker exists at the Docker VM host
// and that host is configured to accept our SSH key
var config_1 = __importDefault(require("../config"));
var base_1 = require("./base");
var utils_1 = require("./utils");
//@ts-ignore
var ssh_exec_1 = __importDefault(require("ssh-exec"));
var gatewayHost = config_1.default.DOCKER_VM_HOST || 'localhost';
var sshConfig = {
    user: config_1.default.DOCKER_VM_HOST_SSH_USER || 'root',
    host: gatewayHost,
    // Defaults to ~/.ssh/id_rsa
    key: config_1.default.DOCKER_VM_HOST_SSH_KEY_BASE64
        ? Buffer.from(config_1.default.DOCKER_VM_HOST_SSH_KEY_BASE64, 'base64')
        : undefined,
};
var Docker = /** @class */ (function (_super) {
    __extends(Docker, _super);
    function Docker() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.size = '';
        _this.largeSize = '';
        _this.redisQueueKey = 'availableListDocker';
        _this.redisStagingKey = 'stagingListDocker';
        _this.startVM = function (name) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            ssh_exec_1.default("\n        #!/bin/bash\n        set -e\n        PORT=$(comm -23 <(seq 5000 5063 | sort) <(ss -Htan | awk '{print $4}' | cut -d':' -f2 | sort -u) | shuf | head -n 1)\n        INDEX=$(($PORT - 5000))\n        UDP_START=$((59000+$INDEX*100))\n        UDP_END=$((59099+$INDEX*100))\n        #docker pull " + utils_1.imageName + " > /dev/null\n        docker run -d --rm --name=" + name + " --net=host -v /etc/letsencrypt:/etc/letsencrypt -l vbrowser -l index=$INDEX --log-opt max-size=1g --shm-size=1g --cap-add=\"SYS_ADMIN\" -e NEKO_KEY=\"/etc/letsencrypt/live/" + gatewayHost + "/privkey.pem\" -e NEKO_CERT=\"/etc/letsencrypt/live/" + gatewayHost + "/fullchain.pem\" -e DISPLAY=\":$INDEX.0\" -e NEKO_SCREEN=\"1280x720@30\" -e NEKO_PASSWORD=" + name + " -e NEKO_PASSWORD_ADMIN=" + name + " -e NEKO_BIND=\":$PORT\" -e NEKO_EPR=\":$UDP_START-$UDP_END\" " + utils_1.imageName + "\n        #docker run -d --rm --name=" + name + " -p $PORT:8080 -p $UDP_START-$UDP_END:$UDP_START-$UDP_END/udp -v /etc/letsencrypt:/etc/letsencrypt -l vbrowser -l index=$INDEX --log-opt max-size=1g --shm-size=1g --cap-add=\"SYS_ADMIN\" -e NEKO_KEY=\"/etc/letsencrypt/live/" + gatewayHost + "/privkey.pem\" -e NEKO_CERT=\"/etc/letsencrypt/live/" + gatewayHost + "/fullchain.pem\" -e DISPLAY=\":99.0\" -e NEKO_SCREEN=\"1280x720@30\" -e NEKO_PASSWORD=" + name + " -e NEKO_PASSWORD_ADMIN=" + name + " -e NEKO_EPR=\":$UDP_START-$UDP_END\" " + utils_1.imageName + "\n        #docker run -d --rm --name=" + name + " -p $PORT:$PORT -p $UDP_START-$UDP_END:$UDP_START-$UDP_END/udp -v /etc/letsencrypt:/etc/letsencrypt -l vbrowser -l index=$INDEX --log-opt max-size=1g --shm-size=1g --cap-add=\"SYS_ADMIN\" -e NEKO_KEY=\"/etc/letsencrypt/live/" + gatewayHost + "/privkey.pem\" -e NEKO_CERT=\"/etc/letsencrypt/live/" + gatewayHost + "/fullchain.pem\" -e DISPLAY=\":$INDEX.0\" -e NEKO_SCREEN=\"1280x720@30\" -e NEKO_PASSWORD=" + name + " -e NEKO_PASSWORD_ADMIN=" + name + " -e NEKO_BIND=\":$PORT\" -e NEKO_EPR=\":$UDP_START-$UDP_END\" " + utils_1.imageName + "\n        ", sshConfig, function (err, stdout) {
                                if (err) {
                                    return reject(err);
                                }
                                console.log(stdout);
                                resolve(stdout.trim());
                            });
                            return [2 /*return*/];
                        });
                    }); })];
            });
        }); };
        _this.terminateVM = function (id) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        ssh_exec_1.default("docker rm -f " + id, sshConfig, function (err, stdout) {
                            if (err) {
                                return reject(err);
                            }
                            resolve();
                        });
                    })];
            });
        }); };
        _this.rebootVM = function (id) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.terminateVM(id)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); };
        // Override the base method, since we don't need to reuse docker containers
        _this.resetVM = function (id) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.terminateVM(id)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); };
        _this.getVM = function (id) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        ssh_exec_1.default("docker inspect " + id, sshConfig, function (err, stdout) {
                            if (err) {
                                return reject(err);
                            }
                            var data = null;
                            try {
                                data = JSON.parse(stdout)[0];
                                if (!data) {
                                    return reject(new Error('no container with this ID found'));
                                }
                            }
                            catch (_a) {
                                console.error(stdout);
                                return reject('failed to parse json');
                            }
                            var server = _this.mapServerObject(data);
                            return resolve(server);
                        });
                    })];
            });
        }); };
        _this.listVMs = function (filter) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        // TODO this errors if there aren't any running containers
                        ssh_exec_1.default("docker inspect $(docker ps --filter label=vbrowser --quiet --no-trunc)", sshConfig, function (err, stdout) {
                            if (err) {
                                // return reject(err);
                                console.log('[NON-CRITICAL]', err);
                                return [];
                            }
                            if (!stdout) {
                                return [];
                            }
                            var data = [];
                            try {
                                data = JSON.parse(stdout);
                            }
                            catch (e) {
                                console.error(stdout);
                                return reject('failed to parse json');
                            }
                            return resolve(data.map(_this.mapServerObject));
                        });
                    })];
            });
        }); };
        _this.powerOn = function (id) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); }); };
        _this.mapServerObject = function (server) {
            var _a, _b, _c, _d, _e, _f;
            return ({
                id: server.Id,
                pass: (_a = server.Name) === null || _a === void 0 ? void 0 : _a.slice(1),
                host: gatewayHost + ":" + (5000 + Number((_c = (_b = server.Config) === null || _b === void 0 ? void 0 : _b.Labels) === null || _c === void 0 ? void 0 : _c.index)),
                private_ip: '',
                state: (_d = server.State) === null || _d === void 0 ? void 0 : _d.Status,
                tags: (_e = server.Config) === null || _e === void 0 ? void 0 : _e.Labels,
                creation_date: (_f = server.State) === null || _f === void 0 ? void 0 : _f.StartedAt,
                provider: _this.getRedisQueueKey(),
                large: _this.isLarge,
            });
        };
        return _this;
    }
    return Docker;
}(base_1.VMManager));
exports.Docker = Docker;
