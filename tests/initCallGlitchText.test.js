const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('initCallGlitchText', () => {
    let dom;
    let window;
    let document;

    beforeEach(() => {
        Object.defineProperty(global, 'matchMedia', {
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

        const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');
        dom = new JSDOM(html, {
            runScripts: "dangerously",
            virtualConsole: new (require('jsdom').VirtualConsole)(),
            beforeParse(window) {
                window.matchMedia = global.matchMedia;
                window.IntersectionObserver = jest.fn().mockImplementation(() => ({
                    observe: jest.fn(),
                    unobserve: jest.fn(),
                    disconnect: jest.fn(),
                }));
            }
        });

        window = dom.window;
        document = window.document;

        const scriptJs = fs.readFileSync(path.resolve(__dirname, '../script.js'), 'utf-8');
        const scriptMatch = scriptJs.match(/function initCallGlitchText\(\) \{[\s\S]*?\}\s*\/\/ =================/);
        const codeBlock = scriptMatch[0].replace(/\/\/ =================/, '');

        // Define it globally on the jsdom window!
        window.eval(codeBlock + "\nwindow.initCallGlitchText = initCallGlitchText;");
    });

    test('should not throw error if element does not exist', () => {
        // Remove the element to simulate absence
        const targetedCta = document.querySelector('[data-glitch-btn]');
        if (targetedCta) {
            targetedCta.remove();
        }

        // Try executing the function
        expect(() => {
            window.initCallGlitchText();
        }).not.toThrow();
    });

    test('should add event listeners if element exists', () => {
        const targetedCta = document.querySelector('[data-glitch-btn]');
        expect(targetedCta).not.toBeNull();

        // Let's spy on addEventListener
        const addEventListenerSpy = jest.spyOn(targetedCta, 'addEventListener');

        window.initCallGlitchText();

        expect(addEventListenerSpy).toHaveBeenCalledWith('mouseenter', expect.any(Function));
        expect(addEventListenerSpy).toHaveBeenCalledWith('mouseleave', expect.any(Function));
    });
});
