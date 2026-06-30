const fs = require('fs');
const path = require('path');

describe('initConsoleTyping', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div class="hero-desc">Old Content</div>';
        jest.useFakeTimers();

        // Define prefersReducedMotion globally
        global.prefersReducedMotion = false;

        // Read index.html and extract initConsoleTyping
        const html = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf8');
        const scriptMatch = html.match(/function initConsoleTyping\(\) \{[\s\S]*?printLogLine\(\);\s*\}/);

        if (!scriptMatch) {
            throw new Error("initConsoleTyping function not found in index.html");
        }

        // Evaluate the function in the current context
        eval(scriptMatch[0]);
        global.initConsoleTyping = initConsoleTyping;
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
        delete global.initConsoleTyping;
        delete global.prefersReducedMotion;
    });

    test('should do nothing if .hero-desc is missing', () => {
        document.body.innerHTML = '';
        initConsoleTyping();
        expect(document.querySelector('.console-line')).toBeNull();
    });

    test('should type out the logs correctly with normal motion', () => {
        initConsoleTyping();

        // After init, it clears the container
        const descEl = document.querySelector('.hero-desc');
        expect(descEl.innerHTML).toBe('<div class="console-line">&gt;</div>'); // The very first char is typed immediately

        // Advance timers completely
        jest.runAllTimers();

        expect(descEl.children.length).toBe(3);
        expect(descEl.children[0].textContent).toBe("> initializing secure environment telemetry monitoring platforms...");
        expect(descEl.children[1].textContent).toBe("> assessing deployment base metrics for 170+ enterprise network nodes... [OK]");
        expect(descEl.children[2].textContent).toBe("> zero-trust authentication policies enforced and structural auditing active. [OK]");
    });

    test('should respect prefersReducedMotion', () => {
        global.prefersReducedMotion = true;
        initConsoleTyping();

        const descEl = document.querySelector('.hero-desc');

        // With prefersReducedMotion = true, typing delay is 0ms
        // It still needs jest to advance timers, but let's just run all timers
        jest.runAllTimers();

        expect(descEl.children.length).toBe(3);
        expect(descEl.children[2].textContent).toBe("> zero-trust authentication policies enforced and structural auditing active. [OK]");
    });
});
