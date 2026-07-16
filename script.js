        // 🛡️ Security Enhancement: Cryptographically secure random generator utility to replace Math.random
        // ⚡ Bolt Optimization: Batch random values into a larger buffer to drastically reduce Crypto API overhead during animation loops
        const _secureRandomBuffer = new Uint32Array(256);
        let _secureRandomIndex = 256;
        function getSecureRandom() {
            if (_secureRandomIndex >= 256) {
                window.crypto.getRandomValues(_secureRandomBuffer);
                _secureRandomIndex = 0;
            }
            return _secureRandomBuffer[_secureRandomIndex++] / 4294967296; // 4294967296 is 0xffffffff + 1
        }

        // Global Motion & State Controls


        // =================================================================
        // Dynamic Memory Visualizer Matrix (High-DPI & Interactivity Waves)
        // =================================================================


        // =================================================================
        // Fluid GPU-bound Interpolated Vector Pointer Engine
        // =================================================================
        function initCompositeCursor() {
            if (!window.matchMedia("(pointer: fine)").matches) return;
            document.documentElement.classList.add('sys-cursor-active');

            const dot = document.querySelector("[data-cursor-pointer]");
            const aura = document.querySelector("[data-cursor-aura]");

            let tX = 0, tY = 0, dX = 0, dY = 0, aX = 0, aY = 0;
            let isRunning = false; // Bolt Optimization: Pause animation loop when idle

            const startCycle = () => {
                if (!isRunning) {
                    isRunning = true;
                    requestAnimationFrame(cycle);
                }
            };

            window.addEventListener('mousemove', e => {
                tX = e.clientX;
                tY = e.clientY;
                startCycle();
            });

            function cycle() {
                // Bolt Optimization: Calculate distance to target
                const distDot = Math.abs(tX - dX) + Math.abs(tY - dY);
                const distAura = Math.abs(tX - aX) + Math.abs(tY - aY);

                if (distDot < 0.1 && distAura < 0.1) {
                    // Snap to exact position and pause loop
                    dX = tX; dY = tY;
                    aX = tX; aY = tY;
                    if (dot) dot.style.transform = `translate3d(${dX}px, ${dY}px, 0)`;
                    if (aura) aura.style.transform = `translate3d(${aX}px, ${aY}px, 0)`;
                    isRunning = false;
                    return;
                }

                dX += (tX - dX) * 0.35; dY += (tY - dY) * 0.35;
                aX += (tX - aX) * 0.16; aY += (tY - aY) * 0.16;

                if (dot) dot.style.transform = `translate3d(${dX}px, ${dY}px, 0)`;
                if (aura) aura.style.transform = `translate3d(${aX}px, ${aY}px, 0)`;

                if (isRunning) {
                    requestAnimationFrame(cycle);
                }
            }
            startCycle();

            document.querySelectorAll("a, button, #mobile-toggle").forEach(el => {
                el.addEventListener('mouseenter', () => { aura.classList.add('interacting'); startCycle(); });
                el.addEventListener('mouseleave', () => { aura.classList.remove('interacting'); startCycle(); });
            });
        }

        // =================================================================
        // Core Console Logging Typing Framework
        // =================================================================
        function initConsoleTyping() {
            const descEl = document.querySelector('.hero-desc');
            if (!descEl) return;

            const logStreams = [
                "> initializing secure environment telemetry monitoring platforms...",
                "> assessing deployment base metrics for 170+ enterprise network nodes... [OK]",
                "> zero-trust authentication policies enforced and structural auditing active. [OK]"
            ];

            // 🛡️ Security Enhancement: Use textContent instead of innerHTML to prevent DOM-based XSS vectors
            descEl.textContent = '';
            let streamIdx = 0;
            let characterIdx = 0;

            function printLogLine() {
                if (streamIdx < logStreams.length) {
                    if (characterIdx === 0) {
                        const lineNode = document.createElement('div');
                        lineNode.className = 'console-line';
                        descEl.appendChild(lineNode);
                    }
                    const dynamicTargetNode = descEl.lastChild;
                    dynamicTargetNode.textContent = logStreams[streamIdx].substring(0, characterIdx + 1);
                    characterIdx++;

                    if (characterIdx >= logStreams[streamIdx].length) {
                        streamIdx++;
                        characterIdx = 0;
                        setTimeout(printLogLine, 350);
                    } else {
                        setTimeout(printLogLine, prefersReducedMotion ? 0 : 12);
                    }
                }
            }
            printLogLine();
        }

        // =================================================================
        // First Interaction Primary Call Action Text Mutation Glitch
        // =================================================================
        function initCallGlitchText() {
            const targetedCta = document.querySelector('[data-glitch-btn]');
            if (!targetedCta) return;

            targetedCta.addEventListener('mouseenter', () => {
                targetedCta.textContent = 'exec: hugo.luna.sec@gmail.com';
            });
            targetedCta.addEventListener('mouseleave', () => {
                targetedCta.textContent = targetedCta.getAttribute('data-glitch-btn');
            });
        }

        // =================================================================
        // Text Matrix Decryption Engine
        // =================================================================
        function initTextDecryption() {
            if (prefersReducedMotion) {
                document.querySelectorAll('.decrypt-trigger').forEach(el => el.style.visibility = 'visible');
                return;
            }

            const chars = '01X_//&%#?*@!+$';
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const target = entry.target;
                        const finalTxt = target.textContent.trim();
                        let count = 0;
                        target.style.visibility = 'visible';

                        const txtLength = finalTxt.length;
                        const charsLength = chars.length;
                        // ⚡ Bolt Optimization: Replace string concatenation loop with a pre-allocated character array.
                        // Mutating the array and joining it once per frame eliminates O(N) intermediate string allocations
                        // and drastically reduces garbage collection thrashing on mobile processors every 25ms tick.
                        const textArray = new Array(txtLength);
                        for (let i = 0; i < txtLength; i++) textArray[i] = finalTxt[i] === " " ? " " : "";

                        const routine = setInterval(() => {
                            for (let i = count; i < txtLength; i++) {
                                if (finalTxt[i] !== " ") {
                                    textArray[i] = chars[Math.floor(getSecureRandom() * charsLength)];
                                }
                            }
                            // The characters before `count` are permanently set to their final values
                            if (count > 0 && count <= txtLength && finalTxt[count - 1] !== " ") {
                                textArray[count - 1] = finalTxt[count - 1];
                            }

                            target.textContent = textArray.join('');

                            if (count >= txtLength) {
                                clearInterval(routine);
                                target.textContent = finalTxt;
                            }
                            count += 1;
                        }, 25);
                        observer.unobserve(target);
                    }
                });
            }, { threshold: 0.1 });

            document.querySelectorAll('.decrypt-trigger').forEach(el => observer.observe(el));
        }

        // =================================================================
        // Inertial Matrix Card Parallax
        // =================================================================
        function initParallaxArchitecture() {
            if (prefersReducedMotion) return;
            document.querySelectorAll('.interactive-card').forEach(card => {
                // ⚡ Bolt Optimization: Throttle continuous DOM reads (getBoundingClientRect) and style writes in high-frequency mousemove events using requestAnimationFrame to prevent layout thrashing and high CPU usage.
                let isTicking = false;

                card.addEventListener('mousemove', (e) => {
                    if (!isTicking) {
                        isTicking = true;
                        requestAnimationFrame(() => {
                            const rect = card.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const y = e.clientY - rect.top;

                            const normX = (x / rect.width) * 2 - 1;
                            const normY = (y / rect.height) * 2 - 1;

                            card.style.setProperty('--m-x', `${x}px`);
                            card.style.setProperty('--m-y', `${y}px`);
                            card.style.transform = `rotateX(${normY * -4}deg) rotateY(${normX * 4}deg) translateZ(5px)`;
                            isTicking = false;
                        });
                    }
                });

                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px)';
                });
            });
        }

        // =================================================================
        // Terminal Execution & Pre-OS Remediation Visualizer Simulation
        // =================================================================
        function initRescueVisualizer() {
            const grid = document.getElementById('memory-grid');
            const statusTxt = document.getElementById('vis-status-text');
            const progressBar = document.getElementById('vis-progress-bar');
            const logArea = document.getElementById('terminal-log');
            const wmdtScreen = document.getElementById('wmdt-screen');
            const wmdtBar = document.getElementById('wmdt-bar');
            const passPct = document.getElementById('wmdt-pass-pct');
            const overallPct = document.getElementById('wmdt-overall-pct');

            if (!grid || !statusTxt || !logArea || !wmdtScreen || prefersReducedMotion) return;

            const totalNodes = 104;
            const nodes = [];
            // ⚡ Bolt Optimization: Batch DOM insertions using DocumentFragment to prevent layout thrashing
            const fragment = document.createDocumentFragment();

            for (let i = 0; i < totalNodes; i++) {
                const node = document.createElement('div');
                node.className = 'memory-node safe';
                fragment.appendChild(node);
                nodes.push(node);
            }
            grid.appendChild(fragment);

            function appendLog(text, className = '') {
                const p = document.createElement('p');
                p.textContent = text;
                if (className) p.className = className;
                logArea.appendChild(p);
                if (logArea.children.length > 5) logArea.removeChild(logArea.firstElementChild);
            }

            function runSimulation() {
                // 🛡️ Security Enhancement: Avoid innerHTML for DOM construction
                logArea.textContent = '';
                appendLog('Launching System Rescue Utility...');
                logArea.appendChild(document.createElement('br'));
                progressBar.classList.add('active');

                statusTxt.textContent = "Stage 1 of 6: Extracting BSOD Crash Logs";
                appendLog("Scanning Event Viewer for recent system crashes...");

                const corruptIndices = [];
                for(let i=0; i < 7; i++) {
                    corruptIndices.push(Math.floor(getSecureRandom() * totalNodes));
                }

                setTimeout(() => {
                    appendLog("CRITICAL: BugCheck (BSOD) events found. Page Faults Detected.", "log-critical");
                    corruptIndices.forEach(idx => nodes[idx].className = 'memory-node corrupt');
                }, 1500);

                setTimeout(() => {
                    statusTxt.textContent = "Stage 2 of 6: Repairing Windows OS image";
                    appendLog("Deployment Image Servicing and Management tool initialized.");
                    appendLog("[==========================62.6%====                  ]");
                    corruptIndices.forEach(idx => nodes[idx].className = 'memory-node scan');
                }, 3500);

                setTimeout(() => {
                    statusTxt.textContent = "Stage 3 of 6: Scanning and repairing system files";
                    appendLog("Overwriting corrupted clusters with verified WinSxS payloads...");

                    let repaired = 0;
                    const repairInterval = setInterval(() => {
                        if(repaired >= corruptIndices.length) {
                            clearInterval(repairInterval);

                            statusTxt.textContent = "Stage 6 of 6: Maintenance Complete";
                            appendLog("Rescue operations complete! Rebooting into Diagnostics...", "log-success");
                            progressBar.classList.remove('active');

                            // Trigger the Pre-OS Reboot Sequence
                            setTimeout(triggerMemoryDiagnostics, 1500);
                        } else {
                            nodes[corruptIndices[repaired]].className = 'memory-node safe';
                            repaired++;
                        }
                    }, 350);
                }, 6000);
            }

            function triggerMemoryDiagnostics() {
                wmdtScreen.classList.add('active');
                let wmdtProgress = 0;

                const memTestInterval = setInterval(() => {
                    wmdtProgress += 2;
                    wmdtBar.style.width = wmdtProgress + '%';
                    passPct.textContent = wmdtProgress;

                    // Overall is usually half the speed of pass 1
                    overallPct.textContent = Math.floor(wmdtProgress / 2).toString().padStart(2, '0');

                    if(wmdtProgress >= 100) {
                        clearInterval(memTestInterval);
                        setTimeout(() => {
                            wmdtScreen.classList.remove('active');
                            // Reset state and restart simulation
                            setTimeout(runSimulation, 1000);
                        }, 2000); // Hold on 100% for a moment before dropping the overlay
                    }
                }, 100); // Ticks up relatively fast for visual engagement
            }

            setTimeout(runSimulation, 1000);
        }

        // =================================================================
        // Dynamic Link Security Enforcement
        // =================================================================
        function initLinkSecurity() {
            // 🛡️ Security Enhancement: Enforce no-referrer and noopener on all external links dynamically as a fallback
            // Using event delegation to catch any dynamically generated external links when clicked
            document.addEventListener('click', (e) => {
                const link = e.target.closest('a[target="_blank"]');
                if (link) {
                    link.setAttribute('rel', 'noopener noreferrer');
                    link.setAttribute('referrerpolicy', 'no-referrer');
                }
            });
        }

        // =================================================================
        // Secure GitHub API Payload Telemetry
        // =================================================================
        async function runPipelineTelemetry() {
            const countEl = document.getElementById('download-counter');
            if (!countEl) return;

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            try {
                // 🛡️ Security Enhancement: Add timeout to prevent resource exhaustion / hanging connections
                const response = await fetch('https://api.github.com/repos/Shinydude100/Shinydude100.github.io/releases', { signal: controller.signal, referrerPolicy: 'no-referrer' });

                if (!response.ok) throw new Error();
                const payloads = await response.json();

                // 🛡️ Security Enhancement: Validate external API payload structure before processing
                if (!Array.isArray(payloads)) throw new Error('Invalid payload structure');

                let downloads = 0;
                for (const release of payloads) {
                    if (!release || !Array.isArray(release.assets)) continue;
                    const targetAsset = release.assets.find(asset => asset && asset.name === "Maintenence.zip" && typeof asset.download_count === 'number');
                    if (targetAsset) {
                        downloads += targetAsset.download_count;
                    }
                }

                countEl.textContent = downloads.toLocaleString() + " PACKAGES DEPLOYED";
            } catch {
                countEl.textContent = "LOCAL_SECURE_MIRROR";
            } finally {
                clearTimeout(timeoutId);
            }
        }


        // =================================================================
        // WebMCP Integration for Agentic Browsing
        // =================================================================
        function initWebMCP() {
            if (typeof navigator !== 'undefined' && navigator.modelContext) {
                const registerWebMCPTool = () => {
                    try {
                        navigator.modelContext.registerTool({
                            name: 'get_portfolio_info',
                            description: 'Returns basic information about the site',
                            execute: () => {
                                return {
                                    title: typeof document !== 'undefined' ? document.title : '',
                                    url: typeof window !== 'undefined' ? window.location.href : ''
                                };
                            }
                        });
                    } catch (e) {
                        console.error('Failed to register WebMCP tool:', e);
                    }
                };
                if (typeof window !== 'undefined' && typeof window.requestIdleCallback !== 'undefined') {
                    window.requestIdleCallback(registerWebMCPTool);
                } else {
                    setTimeout(registerWebMCPTool, 0);
                }
            }
        }

        // =================================================================
        // Runtime Core Execution Mount
        // =================================================================
        if (typeof document !== 'undefined') {
        document.addEventListener('DOMContentLoaded', () => {
            const fontLink = document.getElementById('google-fonts-link');
            if (fontLink) fontLink.media = 'all';
            new MemoryBackplane();
            initCompositeCursor();
            initConsoleTyping();
            initCallGlitchText();
            initTextDecryption();
            initParallaxArchitecture();
            initRescueVisualizer();
            runPipelineTelemetry();
            initLinkSecurity();
            initWebMCP();

            const yEl = document.getElementById('year');
            if (yEl) yEl.textContent = Math.max(2026, new Date().getFullYear());

            const revealEngine = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        revealEngine.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.05 });
            document.querySelectorAll('.reveal-element').forEach(el => revealEngine.observe(el));

            // Extracted listener blocks for zero-trust runtime execution
            const toggle = document.getElementById('mobile-toggle');
            const menu = document.getElementById('menu-box');

            const closeMobileMenu = (restoreFocus = false) => {
                if (menu && menu.classList.contains('active')) {
                    menu.classList.remove('active');
                    toggle.setAttribute('aria-expanded', 'false');
                    const svgPath = toggle.querySelector('svg path');
                    if (svgPath) svgPath.setAttribute('d', 'M3 12h18M3 6h18M3 18h18');
                    if (restoreFocus && toggle) toggle.focus();
                }
            };

            if (toggle && menu) {
                toggle.addEventListener('click', () => {
                    const isActive = menu.classList.toggle('active');
                    toggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
                    const svgPath = toggle.querySelector('svg path');
                    if (svgPath) {
                        svgPath.setAttribute('d', isActive ? 'M18 6L6 18M6 6l12 12' : 'M3 12h18M3 6h18M3 18h18');
                    }
                });
                menu.querySelectorAll('a').forEach(l => l.addEventListener('click', () => closeMobileMenu(false)));

                document.addEventListener('click', (e) => {
                    if (menu.classList.contains('active') && !menu.contains(e.target) && !toggle.contains(e.target)) {
                        closeMobileMenu(false);
                    }
                });
            }

            window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') closeMobileMenu(true);
            });

            const header = document.getElementById('site-header');
            const sections = document.querySelectorAll('section[id]');
            const navLinks = document.querySelectorAll('.nav-item');

            const navLinksMap = new Map();
            navLinks.forEach(item => {
                const link = item.querySelector('a');
                if (link) {
                    const href = link.getAttribute('href');
                    if (href) navLinksMap.set(href, { item, link });
                }
            });

            let currentActiveNavObj = null;
            const scrollSpyObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const targetHref = `#${entry.target.getAttribute('id')}`;
                        const targetObj = navLinksMap.get(targetHref);

                        if (currentActiveNavObj !== targetObj) {
                            if (currentActiveNavObj) {
                                currentActiveNavObj.item.classList.remove('active');
                                if (currentActiveNavObj.link) currentActiveNavObj.link.removeAttribute('aria-current');
                            } else {
                                navLinksMap.forEach(obj => {
                                    obj.item.classList.remove('active');
                                    if (obj.link) obj.link.removeAttribute('aria-current');
                                });
                            }

                            if (targetObj) {
                                targetObj.item.classList.add('active');
                                if (targetObj.link) targetObj.link.setAttribute('aria-current', 'page');
                            }
                            currentActiveNavObj = targetObj;
                        }
                    }
                });
            }, { rootMargin: "-20% 0px -60% 0px", threshold: 0.1 });

            sections.forEach(section => scrollSpyObserver.observe(section));

            // ⚡ Bolt Optimization: Throttle scroll event listener using requestAnimationFrame to prevent main thread congestion and layout thrashing
            let isScrolling = false;
            window.addEventListener('scroll', () => {
                if (!isScrolling) {
                    window.requestAnimationFrame(() => {
                        window.scrollY > 40 ? header.classList.add('scrolled') : header.classList.remove('scrolled');
                        isScrolling = false;
                    });
                    isScrolling = true;
                }
            }, { passive: true });
        });
}


if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initTextDecryption,
        initParallaxArchitecture,
        initCompositeCursor
    };
}
