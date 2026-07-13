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
            fillText: jest.fn(),
            globalAlpha: 1,
            fillStyles: [],
            set fillStyle(val) {
                this.fillStyles.push(val);
            }
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
        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should render a static frame with fillRect and fillText', () => {
            const backplane = new MemoryBackplane();
            backplane.fontSize = 10;

            // Re-run init to set font after we override fontSize
            backplane.init();

            // Replace the streams created by init with our predictable stream
            backplane.streams = [{
                x: 100,
                y: 0,
                speed: 1,
                chars: ['A', 'B']
            }];

            // Mock getSecureRandom so stream.y calculation is deterministic
            // getSecureRandom() * window.innerHeight (800)
            jest.spyOn(MemoryBackplane.prototype, 'getSecureRandom').mockReturnValue(0.25); // y = 200

            // Clear mock history from init
            mockCtx.fillRect.mockClear();
            mockCtx.fillText.mockClear();

            backplane.renderStaticFrame();

            // Check clear background
            expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 1000, 800);

            // We can assert the mocked context properties
            expect(mockCtx.font).toBe("600 10px 'Fira Code', monospace");

            // Check chars render
            // stream.y gets recalculated to getSecureRandom() * window.innerHeight = 0.25 * 800 = 200
            // j=0: yPos = 200 + (0 * (10 + 6)) = 200
            // j=1: yPos = 200 + (1 * (10 + 6)) = 216

            expect(mockCtx.fillText).toHaveBeenCalledTimes(2);
            expect(mockCtx.fillText).toHaveBeenNthCalledWith(1, 'A', 100, 200);
            expect(mockCtx.fillText).toHaveBeenNthCalledWith(2, 'B', 100, 216);

            // Check fillStyle assignments
            expect(mockCtx.fillStyles).toContain('#020617'); // Background
            expect(mockCtx.fillStyles).toContain('#fde047'); // Text
            expect(mockCtx.globalAlpha).toBe(0.08); // Check applied alpha
        });

        it('should not render characters out of bounds', () => {
            const backplane = new MemoryBackplane();

            backplane.streams = [{
                x: 100,
                y: 0,
                speed: 1,
                chars: ['A']
            }];
            backplane.fontSize = 10;

            // Mock getSecureRandom to return 1.0 so yPos >= window.innerHeight
            jest.spyOn(MemoryBackplane.prototype, 'getSecureRandom').mockReturnValue(1.0);

            mockCtx.fillRect.mockClear();
            mockCtx.fillText.mockClear();

            backplane.renderStaticFrame();

            // Explicitly verify fillRect was called with window dimensions for background
            expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 1000, 800);

            // Check that fillText was never called for out-of-bounds chars
            expect(mockCtx.fillText).toHaveBeenCalledTimes(0);
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

    describe('event listeners', () => {
        let backplane;
        beforeEach(() => {
            jest.useFakeTimers();
            backplane = new MemoryBackplane();
            jest.spyOn(backplane, 'init');
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should call init on window resize after 150ms timeout', () => {
            window.dispatchEvent(new Event('resize'));
            jest.advanceTimersByTime(100);
            expect(backplane.init).not.toHaveBeenCalled();
            jest.advanceTimersByTime(50);
            expect(backplane.init).toHaveBeenCalled();
        });

        it('should update isRenderActive on visibilitychange', () => {
            Object.defineProperty(document, 'visibilityState', {
                value: 'hidden',
                configurable: true
            });
            document.dispatchEvent(new Event('visibilitychange'));
            expect(backplane.isRenderActive).toBe(false);

            Object.defineProperty(document, 'visibilityState', {
                value: 'visible',
                configurable: true
            });
            document.dispatchEvent(new Event('visibilitychange'));
            expect(backplane.isRenderActive).toBe(true);
        });
    });

    describe('animate', () => {
        let backplane;

        beforeEach(() => {
            jest.spyOn(window, 'requestAnimationFrame').mockImplementation(() => {});
            backplane = new MemoryBackplane();
            backplane.streams = [{
                x: 100,
                y: 10,
                speed: 1,
                chars: ['A', 'B']
            }];
            backplane.fontSize = 10;
        });

        afterEach(() => {
            window.requestAnimationFrame.mockRestore();
        });

        it('should early return and request another frame if isRenderActive is false', () => {
            backplane.isRenderActive = false;
            mockCtx.fillRect.mockClear();

            backplane.animate();

            expect(mockCtx.fillRect).not.toHaveBeenCalled();
            expect(window.requestAnimationFrame).toHaveBeenCalled();
        });

        it('should render frame and animate streams', () => {
            jest.spyOn(MemoryBackplane.prototype, 'getSecureRandom').mockReturnValue(0.5); // To avoid random chars changes
            mockCtx.fillRect.mockClear();
            mockCtx.fillText.mockClear();

            backplane.animate();

            expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 1000, 800);

            // Check chars render
            // stream.y = 10
            // j=0: yPos = 10
            // j=1: yPos = 10 + 16 = 26
            expect(mockCtx.fillText).toHaveBeenCalledTimes(2);
            expect(mockCtx.fillText).toHaveBeenNthCalledWith(1, 'A', 100, 10);
            expect(mockCtx.fillText).toHaveBeenNthCalledWith(2, 'B', 100, 26);

            // Speed = 1
            expect(backplane.streams[0].y).toBe(11);
        });


        it('should handle interaction.active false setting in animate', () => {
            backplane.interaction.active = true;
            backplane.interaction.pingRadius = 100;
            backplane.interaction.targetRadius = 100; // >= targetRadius

            backplane.animate();

            expect(backplane.interaction.active).toBe(false);
        });


        it('should handle un-glitched nodes during active interaction', () => {
            backplane.interaction.active = true;
            backplane.interaction.pingRadius = 20;
            backplane.interaction.targetRadius = 100;
            backplane.interaction.x = 100;
            backplane.interaction.y = 10;

            // Mock sqrt to NOT hit the glitch node condition
            jest.spyOn(Math, 'sqrt').mockReturnValue(100);

            mockCtx.fillText.mockClear();

            backplane.animate();

            // First char should NOT be glitched, should just be white since it's j=0
            expect(mockCtx.fillText).toHaveBeenNthCalledWith(1, 'A', 100, 10);
            expect(mockCtx.fillStyles.join('')).toContain('#ffffff');
        });

        it('should handle glitched nodes during active interaction', () => {
            backplane.interaction.active = true;
            backplane.interaction.pingRadius = 20;
            backplane.interaction.targetRadius = 100;
            backplane.interaction.x = 100;
            backplane.interaction.y = 10;

            // Mock sqrt to easily hit the glitch node condition
            jest.spyOn(Math, 'sqrt').mockReturnValue(20);

            mockCtx.fillText.mockClear();

            backplane.animate();

            // First char should be glitched
            expect(mockCtx.fillText).toHaveBeenNthCalledWith(1, 'XX', 100, 10);
            expect(backplane.interaction.pingRadius).toBe(32); // 20 + 12
        });

        it('should reset stream y and speed if out of bounds', () => {
            backplane.streams[0].y = 900; // > window.innerHeight (800)

            jest.spyOn(MemoryBackplane.prototype, 'getSecureRandom').mockReturnValue(0.5); // Predictable random values

            backplane.animate();

            expect(backplane.streams[0].y).toBe(-100); // 0.5 * -200
            expect(backplane.streams[0].speed).toBe(1.75); // 0.5 * 1.5 + 1
        });

        it('should randomly change characters', () => {
            jest.spyOn(MemoryBackplane.prototype, 'getSecureRandom').mockReturnValue(0.01); // Trigger random token update
            jest.spyOn(backplane, 'randomToken').mockReturnValue('Z');

            backplane.animate();

            expect(backplane.streams[0].chars).toContain('Z');
        });
    });

    describe('prefersReducedMotion', () => {
        let backplane;
        beforeEach(() => {
            jest.spyOn(window, 'requestAnimationFrame').mockImplementation(() => {});
        });
        afterEach(() => {
            window.requestAnimationFrame.mockRestore();
            jest.restoreAllMocks();
        });

        it('should call renderStaticFrame if prefersReducedMotion is true', () => {
            // Re-mock matchMedia for this test
            window.matchMedia.mockImplementation(query => ({
                matches: true,
                media: query,
                onchange: null,
                addListener: jest.fn(),
                removeListener: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
            }));

            // Force the re-evaluation of the module level variable prefersReducedMotion
            // Since it's evaluated at module load, we need to reset modules
            jest.resetModules();

            const originalMatchMedia = window.matchMedia;
            window.matchMedia = jest.fn().mockImplementation(query => ({
                matches: true,
                media: query,
                onchange: null,
                addListener: jest.fn(),
                removeListener: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
            }));

            const { MemoryBackplane } = require('../memory-backplane.js');

            const renderStaticSpy = jest.spyOn(MemoryBackplane.prototype, 'renderStaticFrame').mockImplementation(() => {});
            const animateSpy = jest.spyOn(MemoryBackplane.prototype, 'animate').mockImplementation(() => {});

            backplane = new MemoryBackplane();

            expect(renderStaticSpy).toHaveBeenCalled();
            expect(animateSpy).not.toHaveBeenCalled();

            window.matchMedia = originalMatchMedia;
        });

        it('should call animate if prefersReducedMotion is false', () => {
            jest.resetModules();
            const originalMatchMedia = window.matchMedia;
            window.matchMedia = jest.fn().mockImplementation(query => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: jest.fn(),
                removeListener: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
            }));

            const { MemoryBackplane } = require('../memory-backplane.js');

            const renderStaticSpy = jest.spyOn(MemoryBackplane.prototype, 'renderStaticFrame').mockImplementation(() => {});
            const animateSpy = jest.spyOn(MemoryBackplane.prototype, 'animate').mockImplementation(() => {});

            backplane = new MemoryBackplane();

            expect(renderStaticSpy).not.toHaveBeenCalled();
            expect(animateSpy).toHaveBeenCalled();

            window.matchMedia = originalMatchMedia;
        });
    });
});
