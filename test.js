const crypto = require('crypto');
const window = {
    crypto: {
        getRandomValues: function(buffer) {
            crypto.randomFillSync(buffer);
        }
    }
};

function getSecureRandomOld() {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    return arr[0] / (0xffffffff + 1);
}

const _secureRandomBuffer = new Uint32Array(256);
let _secureRandomIndex = 256;
function getSecureRandomNew() {
    if (_secureRandomIndex >= 256) {
        window.crypto.getRandomValues(_secureRandomBuffer);
        _secureRandomIndex = 0;
    }
    return _secureRandomBuffer[_secureRandomIndex++] / 4294967296;
}

const iters = 100000;
console.time('Old');
for (let i = 0; i < iters; i++) getSecureRandomOld();
console.timeEnd('Old');

console.time('New');
for (let i = 0; i < iters; i++) getSecureRandomNew();
console.timeEnd('New');
