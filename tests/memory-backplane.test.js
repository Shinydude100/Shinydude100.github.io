/**
 * @jest-environment jsdom
 */

// Mock matchMedia before requiring the module
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

const { MemoryBackplane } = require('../memory-backplane.js');

describe('MemoryBackplane', () => {
    let mockCanvas, mockCtx;

    beforeEach(() => {
        // Set up the mock DOM
        document.body.innerHTML = '<canvas id="matrix-backplane"></canvas>';
        mockCanvas = document.getElementById('matrix-backplane');
        mockCtx = {
            getContext: jest.fn(),
            setTransform: jest.fn(),
            fillRect: jest.fn(),
            fillText: jest.fn()
        };
        mockCanvas.getContext = jest.fn(() => mockCtx);

        // Mock window dimensions
        window.innerWidth = 1000;
        window.innerHeight = 800;
        window.devicePixelRatio = 2;
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    it('should correctly initialize in constructor', () => {
        const backplane = new MemoryBackplane();
        expect(backplane.canvas).toBe(mockCanvas);
        expect(backplane.ctx).toBe(mockCtx);
        expect(backplane.isRenderActive).toBe(true);
        expect(backplane.hexTokens.length).toBeGreaterThan(0);
    });

    describe('init', () => {
        it('should correctly initialize canvas dimensions and streams', () => {
            const backplane = new MemoryBackplane();

            // Call init explicitly just to be sure, even though constructor does it
            backplane.init();

            expect(backplane.canvas.width).toBe(2000); // 1000 * 2
            expect(backplane.canvas.height).toBe(1600); // 800 * 2
            expect(backplane.canvas.style.width).toBe('1000px');
            expect(backplane.canvas.style.height).toBe('800px');

            expect(mockCtx.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);

            // columns = floor(innerWidth / 45) = floor(1000 / 45) = 22
            expect(backplane.columns).toBe(22);
            expect(backplane.streams.length).toBe(22);
            expect(backplane.streams[0].chars.length).toBeGreaterThanOrEqual(12);
        });
    });

    describe('randomToken', () => {
        it('should return a valid token from hexTokens', () => {
            const backplane = new MemoryBackplane();
            const token = backplane.randomToken();
            expect(backplane.hexTokens).toContain(token);
        });
    });
});
