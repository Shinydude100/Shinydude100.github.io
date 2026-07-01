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

    describe('renderStaticFrame', () => {
        let originalRandom;

        beforeEach(() => {
            originalRandom = Math.random;
        });

        afterEach(() => {
            Math.random = originalRandom;
        });

        it('should render a static frame with fillRect and fillText', () => {
            const backplane = new MemoryBackplane();

            // Set up a predictable stream to test fillText easily
            backplane.streams = [{
                x: 100,
                y: 0,
                speed: 1,
                chars: ['A', 'B']
            }];
            backplane.fontSize = 10;

            // Mock Math.random so stream.y calculation is deterministic
            // Math.random() * window.innerHeight (800)
            Math.random = jest.fn().mockReturnValue(0.25); // y = 200

            // Clear mock history from init
            mockCtx.fillRect.mockClear();
            mockCtx.fillText.mockClear();

            backplane.renderStaticFrame();

            // Check clear background
            expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 1000, 800);

            // We can assert the mocked context properties
            expect(mockCtx.font).toBe("600 10px 'Fira Code', monospace");

            // Check chars render
            // stream.y gets recalculated to Math.random() * window.innerHeight = 0.25 * 800 = 200
            // j=0: yPos = 200 + (0 * (10 + 6)) = 200
            // j=1: yPos = 200 + (1 * (10 + 6)) = 216

            expect(mockCtx.fillText).toHaveBeenCalledTimes(2);
            expect(mockCtx.fillText).toHaveBeenNthCalledWith(1, 'A', 100, 200);
            expect(mockCtx.fillText).toHaveBeenNthCalledWith(2, 'B', 100, 216);
        });
    });


    describe('bindInteractions', () => {
        let backplane;
                let originalInnerWidth;
        let originalInnerHeight;

        beforeEach(() => {
            originalInnerWidth = window.innerWidth;
            originalInnerHeight = window.innerHeight;
            window.innerWidth = 1000;
            window.innerHeight = 800;


            backplane = new MemoryBackplane();
        });

        afterEach(() => {
            window.innerWidth = originalInnerWidth;
            window.innerHeight = originalInnerHeight;
            // No need to remove event listeners from window as JSDOM handles document teardown in our main afterEach
            // However, a good practice is to avoid bleeding state
        });

        it('should handle click event and update interaction state', () => {
            backplane.bindInteractions();
            const clickEvent = new MouseEvent('click', {
                clientX: 250,
                clientY: 350
            });
            window.dispatchEvent(clickEvent);

            expect(backplane.interaction.x).toBe(250);
            expect(backplane.interaction.y).toBe(350);
            expect(backplane.interaction.pingRadius).toBe(0);
            expect(backplane.interaction.targetRadius).toBe(Math.max(window.innerWidth, window.innerHeight) * 0.35);
            expect(backplane.interaction.active).toBe(true);
        });

        it('should handle touchstart event and update interaction state', () => {
            backplane.bindInteractions();
            const touchStartEvent = new Event('touchstart');
            touchStartEvent.touches = [{
                clientX: 400,
                clientY: 500
            }];
            window.dispatchEvent(touchStartEvent);

            expect(backplane.interaction.x).toBe(400);
            expect(backplane.interaction.y).toBe(500);
            expect(backplane.interaction.pingRadius).toBe(0);
            expect(backplane.interaction.targetRadius).toBe(Math.max(window.innerWidth, window.innerHeight) * 0.35);
            expect(backplane.interaction.active).toBe(true);
        });
    });
});
