const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

if (typeof window !== 'undefined' && !window.crypto) {
    window.crypto = {
        getRandomValues: function(buffer) {
            for(let i=0; i<buffer.length; i++) {
                buffer[i] = Math.floor(Math.random() * 4294967296);
            }
            return buffer;
        }
    };
}
