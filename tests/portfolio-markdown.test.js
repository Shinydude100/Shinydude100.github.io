const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');

describe('Markdown Content Negotiation (portfolio.md) & Post-PR #102 README Sync', () => {
    let portfolioMd;
    let readmeMd;
    let indexHtml;
    let parsedIndex;
    let llmsTxt;

    beforeAll(() => {
        portfolioMd = fs.readFileSync(path.join(ROOT_DIR, 'portfolio.md'), 'utf8');
        readmeMd = fs.readFileSync(path.join(ROOT_DIR, 'README.md'), 'utf8');
        indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
        parsedIndex = new DOMParser().parseFromString(indexHtml, 'text/html');
        llmsTxt = fs.readFileSync(path.join(ROOT_DIR, 'llms.txt'), 'utf8');
    });

    describe('portfolio.md plain-English positioning & index.html parity (F1)', () => {
        it('replaces the legacy pre-PR #102 headline with plain-English positioning and lead copy', () => {
            expect(portfolioMd).toMatch(/^# Hugo Luna\b/m);
            expect(portfolioMd).toContain('Systems & Security Architect · Irving / Dallas-Fort Worth, TX');
            expect(portfolioMd).toContain('Eliminate Network Downtime & Hardware Bottlenecks.');
            expect(portfolioMd).not.toContain('I Engineer Hardened Networks & High-Performance Workstations.');

            const heroLead = parsedIndex.querySelector('#hero .hero-lead').textContent.replace(/\s+/g, ' ').trim();
            expect(portfolioMd).toContain(heroLead);
        });

        it('includes all 4 Hero KPIs matching index.html verbatim', () => {
            expect(portfolioMd).toContain('170+ Enterprise Nodes');
            expect(portfolioMd).toContain('99.992%');
            expect(portfolioMd).toContain('100.0 PageSpeed');
            expect(portfolioMd).toContain('60 FPS N64 Emulation');
            expect(portfolioMd).toContain('~15m Incident Response');
        });

        it('documents all 3 Problems I Solve outcomes with measured metrics', () => {
            expect(portfolioMd).toContain('## Problems I Solve');
            expect(portfolioMd).toContain('01 // Outages & Unreliable Office Networks');
            expect(portfolioMd).toContain('< 1.8s');
            expect(portfolioMd).toContain('802.1Q');
            expect(portfolioMd).toContain('02 // Slow Renders & Workstation Crashes');
            expect(portfolioMd).toContain('≤ 21 dBA');
            expect(portfolioMd).toContain('24h Prime95 + MemTest86');
            expect(portfolioMd).toContain('03 // Security Gaps & Blue-Screen Loops');
            expect(portfolioMd).toContain('0.00%');
            expect(portfolioMd).toContain('4.2m');
            expect(portfolioMd).toContain("script-src 'self'");
        });

        it('features the signature age-16 DaedalusX64 engineering story, PSP GU pipeline, and lab link', () => {
            expect(portfolioMd).toContain(
                'Built a full-speed Nintendo 64 emulator for the Sony PSP starting at age 16—proof of deep, bare-metal problem solving when off-the-shelf tools fall short.'
            );
            expect(portfolioMd).toContain('sceGuTexFunc');
            expect(portfolioMd).toContain('ColourAdjuster');
            expect(portfolioMd).toContain('VFPU SIMD');
            expect(portfolioMd).toContain('60 FPS');
            expect(portfolioMd).toContain('16.6ms');
            expect(portfolioMd).toContain('2.0MB');
            expect(portfolioMd).toContain('https://daca.me/DaedalusX64/');
        });

        it('aligns Core Expertise, Custom Workstations, Case Studies (CASE_01–CASE_03), and win_maintenance_routine.ps1 with index.html', () => {
            // Core Expertise & Custom Workstations
            expect(portfolioMd).toContain('Multi-Site Enterprise Network Operations');
            expect(portfolioMd).toContain('Endpoint Protection & Incident Response');
            expect(portfolioMd).toContain('Custom Creative & CAD Workstations');
            expect(portfolioMd).toContain('Local AI & Virtualization Servers');
            expect(portfolioMd).toContain('14.2 GB/s');
            expect(portfolioMd).toContain('DDR5 ECC');
            expect(portfolioMd).toContain('Proxmox KVM');
            expect(portfolioMd).toContain('TPM 2.0 LUKS');

            // Case Studies
            expect(portfolioMd).toContain('CASE_01 // ENTERPRISE HA');
            expect(portfolioMd).toContain('CASE_02 // LOW-LEVEL C++');
            expect(portfolioMd).toContain('CASE_03 // AGENTIC EDGE');

            // Automated System Controls plain-English intro + PowerShell invoke command
            const toolDesc = parsedIndex.querySelector('#tools .tool-desc').textContent.replace(/\s+/g, ' ').trim();
            const ps1Cmd = parsedIndex.getElementById('ps1-cmd-code').textContent.trim();
            expect(portfolioMd).toContain(toolDesc);
            expect(portfolioMd).toContain(ps1Cmd);
        });

        it('exposes dual-channel contact endpoints (Consulting/Hiring + Irving/DFW Support)', () => {
            expect(portfolioMd).toContain('Channel 01');
            expect(portfolioMd).toContain('hugo.luna.sec@gmail.com');
            expect(portfolioMd).toContain('https://www.linkedin.com/in/hugoaluna');
            expect(portfolioMd).toContain('Channel 02');
            expect(portfolioMd).toContain('https://daca.me/support/#book');
            expect(portfolioMd).toContain('(972) 445-7413');
        });
    });

    describe('README.md post-PR #102 accuracy sync (F2)', () => {
        it('documents Recent Engineering Milestones through PR #102 (including PRs #99, #100, #101, #102)', () => {
            expect(readmeMd).toContain('## Recent Engineering Milestones (PRs #93–#102)');
            expect(readmeMd).toMatch(/\|\s*\*\*#99\*\*\s*\|/);
            expect(readmeMd).toMatch(/\|\s*\*\*#100\*\*\s*\|/);
            expect(readmeMd).toMatch(/\|\s*\*\*#101\*\*\s*\|/);
            expect(readmeMd).toMatch(/\|\s*\*\*#102\*\*\s*\|/);
        });

        it('documents both script-src self and style-src self CSP enforcement and relocated #command-deck architecture', () => {
            expect(readmeMd).toContain("script-src 'self'");
            expect(readmeMd).toContain("style-src 'self'");
            expect(readmeMd).toContain('Problems I Solve');
            expect(readmeMd).toContain('#command-deck');
            expect(readmeMd).toContain('<details>');
        });

        it('documents all 8 remote /mcp tools exposed by Shinydude100/remote-mcp-server', () => {
            expect(readmeMd).toMatch(/8\s+(remote|custom)\s+tools/i);
            const expectedTools = [
                'get_agentic_status',
                'get_services',
                'get_contact',
                'get_llms_txt',
                'get_portfolio',
                'get_track_record',
                'get_availability',
                'get_case_study',
            ];
            for (const toolName of expectedTools) {
                expect(readmeMd).toContain(`\`${toolName}\``);
            }
        });

        it('lists real cascade-layered assets/*.css and variable .woff2 font files that exist on disk', () => {
            const cssFiles = [
                'assets/core.css',
                'assets/home.css',
                'assets/support.css',
                'assets/daedalus.css',
                'assets/admin.css',
            ];
            for (const cssFile of cssFiles) {
                expect(readmeMd).toContain(cssFile);
                expect(fs.existsSync(path.join(ROOT_DIR, cssFile))).toBe(true);
            }

            const fontFiles = [
                'inter-latin-wght-normal.woff2',
                'jetbrains-mono-latin-wght-normal.woff2',
                'space-grotesk-latin-wght-normal.woff2',
            ];
            for (const fontFile of fontFiles) {
                expect(readmeMd).toContain(fontFile);
                expect(fs.existsSync(path.join(ROOT_DIR, 'fonts', fontFile))).toBe(true);
            }
        });

        it('contains zero references to deleted legacy files or static font filenames', () => {
            const removedArtifacts = [
                'memory-backplane.js',
                'memory-backplane.test.js',
                'console-typing.test.js',
                'initCallGlitchText.test.js',
                'inter-v20-latin-regular.woff2',
                'jetbrains-mono-v24-latin-regular.woff2',
                'space-grotesk-v22-latin-regular.woff2',
            ];
            for (const removed of removedArtifacts) {
                expect(readmeMd).not.toContain(removed);
            }
        });
    });

    describe('llms.txt preservation & pure Markdown hygiene guardrails', () => {
        it('preserves llms.txt untouched (1153 bytes) and keeps its link to https://daca.me/portfolio.md', () => {
            expect(llmsTxt).toContain('[Portfolio](https://daca.me/portfolio.md)');
            expect(Buffer.byteLength(llmsTxt, 'utf8')).toBe(1153);
            expect(llmsTxt.split('\n')).toHaveLength(30);
        });

        it('keeps portfolio.md pure Markdown without embedded HTML script or style blocks', () => {
            expect(portfolioMd).not.toMatch(/<script\b/i);
            expect(portfolioMd).not.toMatch(/<style\b/i);
        });
    });
});
