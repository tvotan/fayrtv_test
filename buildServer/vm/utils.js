"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageName = exports.cloudInitWithTls = exports.cloudInit = void 0;
exports.cloudInit = function (imageName, resolution, vp9, hetznerCloudInit) {
    if (resolution === void 0) { resolution = '1280x720@30'; }
    if (vp9 === void 0) { vp9 = false; }
    if (hetznerCloudInit === void 0) { hetznerCloudInit = false; }
    return "#!/bin/bash\niptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 5000\nsed -i 's/scripts-user$/[scripts-user, always]/' /etc/cloud/cloud.cfg\n" + (hetznerCloudInit
        ? "sed -i 's/scripts-user$/[scripts-user, always]/' /etc/cloud/cloud.cfg.d/90-hetznercloud.cfg"
        : '') + "\nPASSWORD=$(hostname)\n# docker pull " + imageName + "\ndocker run -d --rm --name=vbrowser -v /usr/share/fonts:/usr/share/fonts --log-opt max-size=1g --net=host --shm-size=1g --cap-add=\"SYS_ADMIN\" -e DISPLAY=\":99.0\" -e NEKO_SCREEN=\"" + resolution + "\" -e NEKO_PASSWORD=$PASSWORD -e NEKO_PASSWORD_ADMIN=$PASSWORD -e NEKO_BIND=\":5000\" -e NEKO_EPR=\":59000-59100\" -e NEKO_VP9=\"" + (vp9 ? 1 : 0) + "\" " + imageName + "\n";
};
exports.cloudInitWithTls = function (host, imageName, resolution, vp9) {
    if (resolution === void 0) { resolution = '1280x720@30'; }
    if (vp9 === void 0) { vp9 = false; }
    return "#!/bin/bash\nuntil nslookup " + host + "\ndo\nsleep 5\necho \"Trying DNS lookup again...\"\ndone\n    \n# Generate cert with letsencrypt\ncertbot certonly --standalone -n --agree-tos --email howardzchung@gmail.com --domains " + host + "\nchmod -R 755 /etc/letsencrypt/archive\n\n# start browser\niptables -t nat -A PREROUTING -p tcp --dport 443 -j REDIRECT --to-port 5000\nsed -i 's/scripts-user$/[scripts-user, always]/' /etc/cloud/cloud.cfg\n# docker pull " + imageName + "\ndocker run -d --rm --name=vbrowser -v /etc/letsencrypt:/etc/letsencrypt -v /usr/share/fonts:/usr/share/fonts --log-opt max-size=1g --net=host --shm-size=1g --cap-add=\"SYS_ADMIN\" -e DISPLAY=\":99.0\" -e NEKO_SCREEN=\"" + resolution + "\" -e NEKO_PASSWORD=$(hostname) -e NEKO_PASSWORD_ADMIN=$(hostname) -e NEKO_BIND=\":5000\" -e NEKO_EPR=\":59000-59100\" -e NEKO_KEY=\"/etc/letsencrypt/live/" + host + "/privkey.pem\" -e NEKO_CERT=\"/etc/letsencrypt/live/" + host + "/fullchain.pem\" -e NEKO_VP9=\"" + (vp9 ? 1 : 0) + "\" " + imageName + "\n";
};
exports.imageName = 'howardc93/vbrowser:latest';
