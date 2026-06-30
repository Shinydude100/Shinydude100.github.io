const MemoryBackplane = require('./memory-backplane.js');

describe('MemoryBackplane', () => {
    let mockContext;
    let mockCanvas;
    let originalWindow;
    let originalDocument;

    beforeEach(() => {
        // Mock Canvas API
        mockContext = {
            setTransform: jest.fn(),
            fillRect: jest.fn(),
            fillText: jest.fn()
        };

        mockCanvas = {
            getContext: jest.fn().mockReturnValue(mockContext),
            style: {}
        };

        // Save originals
        originalWindow = global.window;
        originalDocument = global.document;

        // Mock window properties
        global.window = {
            innerWidth: 1000,
            innerHeight: 800,
            devicePixelRatio: 1,
            addEventListener: jest.fn(),
            matchMedia: jest.fn().mockReturnValue({ matches: false })
        };

        // Mock global prefersReducedMotion required by class
        global.prefersReducedMotion = false;

        // Mock document properties
        global.document = {
            getElementById: jest.fn().mockReturnValue(mockCanvas),
            addEventListener: jest.fn(),
            visibilityState: 'visible'
        };

        // Mock requestAnimationFrame
        global.requestAnimationFrame = jest.fn();
    });

    afterEach(() => {
        // Restore originals
        global.window = originalWindow;
        global.document = originalDocument;
        delete global.prefersReducedMotion;
        delete global.requestAnimationFrame;
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        const backplane = new MemoryBackplane();
        expect(backplane).toBeDefined();
    });

    describe('init', () => {
        it('should correctly calculate columns based on window innerWidth', () => {
            // Set specific window size
            global.window.innerWidth = 900;
            const backplane = new MemoryBackplane();
            // Expected columns: Math.floor(900 / 45) = 20
            expect(backplane.columns).toBe(20);
        });

        it('should populate the streams array with the correct number of stream objects', () => {
            global.window.innerWidth = 900;
            const backplane = new MemoryBackplane();
            expect(backplane.streams.length).toBe(20);

            // Check properties of a stream object
            const firstStream = backplane.streams[0];
            expect(firstStream).toHaveProperty('x');
            expect(firstStream).toHaveProperty('y');
            expect(firstStream).toHaveProperty('speed');
            expect(firstStream).toHaveProperty('chars');
            expect(Array.isArray(firstStream.chars)).toBe(true);
        });

        it('should set canvas dimensions based on innerWidth/innerHeight and devicePixelRatio', () => {
            global.window.innerWidth = 1000;
            global.window.innerHeight = 800;
            global.window.devicePixelRatio = 2;

            const backplane = new MemoryBackplane();

            // Re-call init since constructor was already called with previous devicePixelRatio
            backplane.init();

            expect(mockCanvas.width).toBe(2000);
            expect(mockCanvas.height).toBe(1600);
            expect(mockCanvas.style.width).toBe('1000px');
            expect(mockCanvas.style.height).toBe('800px');
            expect(mockContext.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
        });
    });

    describe('randomToken', () => {
        it('should return a valid token from the hexTokens list', () => {
            const backplane = new MemoryBackplane();
            const token = backplane.randomToken();
            expect(backplane.hexTokens).toContain(token);
        });

        it('should consistently return valid tokens over multiple calls', () => {
            const backplane = new MemoryBackplane();
            for (let i = 0; i < 50; i++) {
                const token = backplane.randomToken();
                expect(backplane.hexTokens).toContain(token);
            }
        });
    });
});
