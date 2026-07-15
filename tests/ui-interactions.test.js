const {
    initTextDecryption,
    initParallaxArchitecture,
    initCompositeCursor
} = require('../script.js');

describe('UI Interactions', () => {
    let mockIntersectionObserver;
    let mockRequestAnimationFrame;
    let mockMatchMedia;
    let observerCallbacks = [];
    let rafCallbacks = [];

    beforeEach(() => {
        jest.clearAllMocks();
        global.prefersReducedMotion = false;

        observerCallbacks = [];
        mockIntersectionObserver = jest.fn((callback) => {
            observerCallbacks.push(callback);
            return {
                observe: jest.fn(),
                unobserve: jest.fn(),
                disconnect: jest.fn()
            };
        });
        window.IntersectionObserver = mockIntersectionObserver;

        rafCallbacks = [];
        mockRequestAnimationFrame = jest.fn((callback) => {
            rafCallbacks.push(callback);
            return 1; // Return a dummy handle
        });
        window.requestAnimationFrame = mockRequestAnimationFrame;

        mockMatchMedia = jest.fn().mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        }));
        window.matchMedia = mockMatchMedia;

        // Setup initial DOM
        document.body.innerHTML = `
            <div class="decrypt-trigger">Test Text</div>
            <div class="interactive-card">Card Content</div>
            <div data-cursor-pointer></div>
            <div data-cursor-aura></div>
        `;

        // Mock getBoundingClientRect
        Element.prototype.getBoundingClientRect = jest.fn(() => {
            return {
                width: 100,
                height: 100,
                top: 0,
                left: 0,
                bottom: 100,
                right: 100,
            }
        });

        // Mock crypto
        if (!window.crypto) {
             window.crypto = {};
        }
        window.crypto.getRandomValues = jest.fn((buffer) => {
            for (let i = 0; i < buffer.length; i++) {
                 buffer[i] = Math.floor(Math.random() * 4294967296);
            }
            return buffer;
        });

        // Set prefersReducedMotion in global scope for script.js to pick up correctly.
        // Actually, prefersReducedMotion is captured in script.js at the top level.
        // So we might not be able to easily toggle it per test without reloading the module.
        // We will test the default path where it's false (or rather whatever it evaluates to).
    });

    afterEach(() => {
        document.body.innerHTML = '';
        document.documentElement.className = '';
        jest.restoreAllMocks();
        delete global.prefersReducedMotion;
    });

    describe('initTextDecryption', () => {
        beforeEach(() => {
            jest.useFakeTimers();
            jest.spyOn(global.Math, 'random').mockReturnValue(0.5);
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should initialize and run decryption animation on intersection', () => {
            const triggerEl = document.querySelector('.decrypt-trigger');
            initTextDecryption();

            // Verify observer was created and observe was called
            expect(mockIntersectionObserver).toHaveBeenCalled();
            const observerInstance = mockIntersectionObserver.mock.results[0].value;
            expect(observerInstance.observe).toHaveBeenCalledWith(triggerEl);

            // Simulate Intersection
            const callback = observerCallbacks[0];
            callback([{
                isIntersecting: true,
                target: triggerEl
            }]);

            // Visibility should be set to visible
            expect(triggerEl.style.visibility).toBe('visible');

            // Fast forward timers to simulate interval execution
            jest.advanceTimersByTime(25 * 5); // run 5 frames

            // Text should be partially randomized (not the original text entirely)
            expect(triggerEl.textContent).not.toBe('Test Text');

            // Fast forward to complete the animation
            jest.advanceTimersByTime(25 * 20);

            // Should be restored to original text
            expect(triggerEl.textContent).toBe('Test Text');

            // Verify unobserve was called
            expect(observerInstance.unobserve).toHaveBeenCalledWith(triggerEl);
        });
    });

    describe('initParallaxArchitecture', () => {
        it('should update css custom properties and transform on mousemove via requestAnimationFrame', () => {
            initParallaxArchitecture();

            const card = document.querySelector('.interactive-card');

            // Dispatch mousemove
            const mouseMoveEvent = new MouseEvent('mousemove', {
                clientX: 50,
                clientY: 50,
                bubbles: true
            });
            card.dispatchEvent(mouseMoveEvent);

            // requestAnimationFrame should have been called
            expect(mockRequestAnimationFrame).toHaveBeenCalled();

            // Execute the callback passed to rAF
            const rafCallback = rafCallbacks[0];
            rafCallback();

            // Check style properties based on rect (width:100, height:100, left:0, top:0)
            // e.clientX = 50, e.clientY = 50
            // x = 50 - 0 = 50
            // y = 50 - 0 = 50
            // normX = (50 / 100) * 2 - 1 = 0
            // normY = (50 / 100) * 2 - 1 = 0
            // rotateX = normY * -4 = 0
            // rotateY = normX * 4 = 0

            expect(card.style.getPropertyValue('--m-x')).toBe('50px');
            expect(card.style.getPropertyValue('--m-y')).toBe('50px');
            expect(card.style.transform).toBe('rotateX(0deg) rotateY(0deg) translateZ(5px)');

            // Trigger another move to test non-zero values
            const mouseMoveEvent2 = new MouseEvent('mousemove', {
                clientX: 100,
                clientY: 100,
                bubbles: true
            });
            card.dispatchEvent(mouseMoveEvent2);

            const rafCallback2 = rafCallbacks[1];
            rafCallback2();

            // normX = (100 / 100) * 2 - 1 = 1
            // normY = (100 / 100) * 2 - 1 = 1
            // rotateX = 1 * -4 = -4
            // rotateY = 1 * 4 = 4
            expect(card.style.getPropertyValue('--m-x')).toBe('100px');
            expect(card.style.getPropertyValue('--m-y')).toBe('100px');
            expect(card.style.transform).toBe('rotateX(-4deg) rotateY(4deg) translateZ(5px)');
        });

        it('should reset transform on mouseleave', () => {
             initParallaxArchitecture();
             const card = document.querySelector('.interactive-card');

             card.style.transform = 'rotateX(-4deg) rotateY(4deg) translateZ(5px)'; // Set initial state

             const mouseLeaveEvent = new Event('mouseleave');
             card.dispatchEvent(mouseLeaveEvent);

             expect(card.style.transform).toBe('rotateX(0deg) rotateY(0deg) translateZ(0px)');
        });
    });

    describe('initCompositeCursor', () => {
        it('should initialize and animate cursor elements when pointer is fine', () => {
            // override matchMedia to return true for this specific check
            mockMatchMedia.mockImplementation(query => ({
                matches: query === "(pointer: fine)",
            }));

            initCompositeCursor();

            // Check if document element gets class
            expect(document.documentElement.classList.contains('sys-cursor-active')).toBe(true);

            const dot = document.querySelector("[data-cursor-pointer]");
            const aura = document.querySelector("[data-cursor-aura]");

            // Dispatch mousemove
            const mouseMoveEvent = new MouseEvent('mousemove', {
                clientX: 200,
                clientY: 200,
                bubbles: true
            });
            window.dispatchEvent(mouseMoveEvent);

            // rAF should be called
            expect(mockRequestAnimationFrame).toHaveBeenCalled();

            const rafCallback = rafCallbacks[0];
            rafCallback(); // Cycle 1

            // Should update transform. We don't need exact values, just that they are updated.
            expect(dot.style.transform).toMatch(/translate3d/);
            expect(aura.style.transform).toMatch(/translate3d/);

            // Should request next frame
            expect(rafCallbacks.length).toBeGreaterThan(1);
        });

        it('should abort if pointer is not fine', () => {
             mockMatchMedia.mockImplementation(query => ({
                matches: false,
            }));

            initCompositeCursor();
            expect(document.documentElement.classList.contains('sys-cursor-active')).toBe(false);
        });
    });
});
