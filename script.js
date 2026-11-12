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
window.sysPrefersReducedMotion = (typeof window !== 'undefined' && window.matchMedia) 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

// =================================================================
// Fluid GPU-bound Interpolated Vector Pointer Engine
// =================================================================
function initCompositeCursor() {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    document.documentElement.classList.add('sys-cursor-active');

    const dot = document.querySelector("[data-cursor-pointer]");
    const aura = document.querySelector("[data-cursor-aura]");

    let tX = 0, tY = 0, dX = 0, dY = 0, aX = 0, aY = 0;
    let isRunning = false;

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
        const distDot = Math.abs(tX - dX) + Math.abs(tY - dY);
        const distAura = Math.abs(tX - aX) + Math.abs(tY - aY);

        if (distDot < 0.1 && distAura < 0.1) {
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
        el.addEventListener('mouseenter', () => { if (aura) aura.classList.add('interacting'); startCycle(); });
        el.addEventListener('mouseleave', () => { if (aura) aura.classList.remove('interacting'); startCycle(); });
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
            if (dynamicTargetNode) {
                dynamicTargetNode.textContent = logStreams[streamIdx].substring(0, characterIdx + 1);
            }
            characterIdx++;

            if (characterIdx >= logStreams[streamIdx].length) {
                streamIdx++;
                characterIdx = 0;
                setTimeout(printLogLine, 350);
            } else {
                setTimeout(printLogLine, window.sysPrefersReducedMotion ? 0 : 12);
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
    if (window.sysPrefersReducedMotion) {
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
                const textArray = new Array(txtLength);
                for (let i = 0; i < txtLength; i++) textArray[i] = finalTxt[i] === " " ? " " : "";

                const routine = setInterval(() => {
                    for (let i = count; i < txtLength; i++) {
                        if (finalTxt[i] !== " ") {
                            textArray[i] = chars[Math.floor(getSecureRandom() * charsLength)];
                        }
                    }
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
    if (window.sysPrefersReducedMotion) return;
    document.querySelectorAll('.interactive-card').forEach(card => {
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

    if (!grid || !statusTxt || !logArea || !wmdtScreen || window.sysPrefersReducedMotion) return;

    const totalNodes = 104;
    const nodes = [];
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

            overallPct.textContent = Math.floor(wmdtProgress / 2).toString().padStart(2, '0');

            if(wmdtProgress >= 100) {
                clearInterval(memTestInterval);
                setTimeout(() => {
                    wmdtScreen.classList.remove('active');
                    setTimeout(runSimulation, 1000);
                }, 2000);
            }
        }, 100);
    }

    setTimeout(runSimulation, 1000);
}

// =================================================================
// Dynamic Link Security Enforcement
// =================================================================
function initLinkSecurity() {
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
        const response = await fetch('https://api.github.com/repos/Shinydude100/Shinydude100.github.io/releases', { signal: controller.signal, referrerPolicy: 'no-referrer' });

        if (!response.ok) throw new Error();
        const payloads = await response.json();

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
// Real Edge Telemetry — Cloudflare Worker + Client-Side Hybrid
// =================================================================
function updateLatencyElements(latency) {
    document.querySelectorAll('.telemetry-latency, [data-telemetry-latency], [data-telemetry="latency"]').forEach(el => {
        if (el.firstChild && el.firstChild.nodeType === 3 && el.children.length > 0) {
            el.firstChild.nodeValue = String(latency);
        } else {
            el.textContent = `${latency}ms`;
        }
    });
}

function initDynamicTelemetry() {
    const pingStart = performance.now();
    const telemetryController = new AbortController();
    const telemetryTimeoutId = setTimeout(() => telemetryController.abort(), 5000);

    fetch('/api/telemetry', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: telemetryController.signal
    })
        .then(res => {
            if (!res.ok) throw new Error(`Telemetry HTTP ${res.status}`);
            return res.json();
        })
        .then(data => {
            if (!data || typeof data !== 'object') return;
            const latency = Math.max(1, Math.round(performance.now() - pingStart));

            updateLatencyElements(latency);

            document.querySelectorAll('[data-telemetry="colo"]').forEach(el => {
                el.textContent = data.colo || 'DFW';
            });

            document.querySelectorAll('[data-telemetry="region"]').forEach(el => {
                el.textContent = data.city && data.country ? `${data.city}, ${data.country}` : 'DFW Metroplex';
            });

            document.querySelectorAll('[data-telemetry="tls"]').forEach(el => {
                el.textContent = data.tlsVersion && data.tlsVersion !== 'unknown' ? data.tlsVersion : 'TLSv1.3';
            });

            document.querySelectorAll('[data-telemetry="protocol"]').forEach(el => {
                el.textContent = data.httpProtocol && data.httpProtocol !== 'unknown' ? data.httpProtocol : 'HTTP/3';
            });

            document.querySelectorAll('[data-telemetry="asn"]').forEach(el => {
                if (data.asOrganization && data.asOrganization !== 'unknown') {
                    el.textContent = `AS${data.asn} (${data.asOrganization})`;
                }
            });

            document.querySelectorAll('[data-telemetry="ray"]').forEach(el => {
                if (data.ray && data.ray !== 'unknown') {
                    el.textContent = data.ray;
                }
            });
        })
        .catch(() => {
            const latency = Math.max(1, Math.round(performance.now() - pingStart));
            updateLatencyElements(latency);
        })
        .finally(() => {
            clearTimeout(telemetryTimeoutId);
        });

    const nodeCards = document.querySelectorAll('.interactive-card, .node-card');
    nodeCards.forEach((card, index) => {
        const loadEl = card.querySelector('.node-load, [data-node-load]');
        const uptimeEl = card.querySelector('.node-uptime, [data-node-uptime]');
        const memEl = card.querySelector('.node-mem, [data-node-mem]');

        if (loadEl) {
            const dynamicLoad = (0.28 + (index * 0.12) + (getSecureRandom() * 0.06)).toFixed(2);
            loadEl.textContent = dynamicLoad;
        }

        if (uptimeEl && index > 0) {
            const dynamicUptime = (99.981 + (getSecureRandom() * 0.017)).toFixed(3);
            if (uptimeEl.firstChild && uptimeEl.firstChild.nodeType === 3 && uptimeEl.children.length > 0) {
                uptimeEl.firstChild.nodeValue = dynamicUptime;
            } else {
                uptimeEl.textContent = `${dynamicUptime}%`;
            }
        }

        if (memEl) {
            const dynamicMem = (38 + (index * 7) + (getSecureRandom() * 4)).toFixed(1);
            if (memEl.firstChild && memEl.firstChild.nodeType === 3 && memEl.children.length > 0) {
                memEl.firstChild.nodeValue = dynamicMem;
            } else {
                memEl.textContent = `${dynamicMem}%`;
            }
        }
    });
}

// =================================================================
// WebMCP Integration for Agentic Browsing (document.modelContext)
// =================================================================
function initWebMCP() {
    const mc = (typeof document !== 'undefined' && document.modelContext) ||
        (typeof navigator !== 'undefined' && navigator.modelContext);
    if (!mc || typeof mc.registerTool !== 'function') return;

    const webMcpController = new AbortController();
    const registerWebMCPTools = () => {
        try {
            mc.registerTool({
                name: 'get_portfolio_info',
                description: 'Returns systems architecture, security engineering, and edge MCP metadata for Hugo Luna at daca.me. Use when an agent needs site identity or discovery endpoints.',
                inputSchema: { type: 'object', properties: {} },
                execute() {
                    return {
                        title: typeof document !== 'undefined' ? document.title : '',
                        url: typeof window !== 'undefined' ? window.location.href : '',
                        architect: 'Hugo Luna',
                        location: 'Irving / Dallas-Fort Worth, TX',
                        endpoints: {
                            mcp_manifest: '/.well-known/mcp.json',
                            llms_txt: '/llms.txt',
                            schema_jsonld: '/schema.jsonld',
                            support_booking: '/support/',
                            daedalus_lab: '/DaedalusX64/'
                        }
                    };
                },
                annotations: { readOnlyHint: true }
            }, { signal: webMcpController.signal });

            mc.registerTool({
                name: 'get_services_and_pricing',
                description: 'Lists consulting and local DFW technical support offerings and pricing from Hugo Luna. Use when the user asks about services, rates, or booking.',
                inputSchema: { type: 'object', properties: {} },
                execute() {
                    return {
                        enterprise_consulting: [
                            { name: 'Agentic Web Transformations', price: '$5,000–$10,000' },
                            { name: 'Cloudflare Worker MCP Deployments', price: 'Custom' },
                            { name: 'PageSpeed & Critical Rendering Path Optimization', price: 'Custom' }
                        ],
                        dfw_local_support: [
                            { name: 'Computer Repair & Crash Recovery', price: '$69–$99' },
                            { name: 'SSD / RAM Speed Upgrade', price: 'From $99 + parts' },
                            { name: 'Wi-Fi & Mesh Network Setup', price: '$129 flat' },
                            { name: 'Workstations & Custom Builds', price: '$149 consultation/build' }
                        ],
                        booking_url: 'https://daca.me/support/#book'
                    };
                },
                annotations: { readOnlyHint: true }
            }, { signal: webMcpController.signal });
        } catch (e) {
            console.error('Failed to register WebMCP tools:', e);
        }
    };

    if (typeof window !== 'undefined' && typeof window.requestIdleCallback !== 'undefined') {
        window.requestIdleCallback(registerWebMCPTools);
    } else {
        setTimeout(registerWebMCPTools, 0);
    }
}

// =================================================================
// Hero Command Deck Tabs & Live Edge Telemetry Ping
// =================================================================
function initHeroCommandDeck() {
    const tablist = document.querySelector('.hud-tablist[role="tablist"]');
    if (tablist) {
        const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
        const panels = tabs
            .map(tab => document.getElementById(tab.getAttribute('data-hud-tab') || ''))
            .filter(Boolean);

        const activateTab = (targetTab, shouldFocus = false) => {
            const targetPanelId = targetTab.getAttribute('data-hud-tab');
            tabs.forEach(tab => {
                const isSelected = tab === targetTab;
                tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
                tab.setAttribute('tabindex', isSelected ? '0' : '-1');
            });
            panels.forEach(panel => {
                if (panel.id === targetPanelId) {
                    panel.removeAttribute('hidden');
                } else {
                    panel.setAttribute('hidden', 'until-found');
                }
            });
            if (shouldFocus) targetTab.focus();
        };

        tabs.forEach((tab, idx) => {
            tab.setAttribute('tabindex', tab.getAttribute('aria-selected') === 'true' ? '0' : '-1');
            tab.addEventListener('click', () => activateTab(tab, false));
            tab.addEventListener('keydown', (e) => {
                let nextIdx = null;
                if (e.key === 'ArrowRight') nextIdx = (idx + 1) % tabs.length;
                else if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + tabs.length) % tabs.length;
                else if (e.key === 'Home') nextIdx = 0;
                else if (e.key === 'End') nextIdx = tabs.length - 1;

                if (nextIdx !== null) {
                    e.preventDefault();
                    activateTab(tabs[nextIdx], true);
                }
            });
        });

        panels.forEach(panel => {
            panel.addEventListener('beforematch', () => {
                const matchingTab = tabs.find(t => t.getAttribute('data-hud-tab') === panel.id);
                if (matchingTab) activateTab(matchingTab, false);
            });
        });
    }

    const pingBtn = document.getElementById('hud-ping-btn');
    const pingReadout = document.getElementById('hud-ping-readout');
    if (pingBtn && pingReadout) {
        pingBtn.addEventListener('click', async () => {
            pingBtn.disabled = true;
            pingReadout.textContent = 'PROBING_EDGE_POP...';

            const topoNodes = document.querySelectorAll('.topo-node');
            topoNodes.forEach((node, i) => {
                node.classList.remove('pulsing');
                if (!window.sysPrefersReducedMotion) {
                    setTimeout(() => node.classList.add('pulsing'), i * 110);
                    setTimeout(() => node.classList.remove('pulsing'), i * 110 + 700);
                }
            });

            const pingStart = performance.now();
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);

            try {
                const res = await fetch('/api/telemetry', {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
                    signal: controller.signal
                });
                const latency = Math.max(1, Math.round(performance.now() - pingStart));
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                const colo = (data && data.colo) ? data.colo : 'DFW';
                updateLatencyElements(latency);
                pingReadout.textContent = `PING_OK // ${latency}ms // POP: ${colo}`;
            } catch {
                const latency = Math.max(1, Math.round(performance.now() - pingStart));
                updateLatencyElements(latency);
                pingReadout.textContent = `PING_LOCAL // ${latency}ms // CACHE_READY`;
            } finally {
                clearTimeout(timeoutId);
                pingBtn.disabled = false;
            }
        });
    }
}

// =================================================================
// Invoker Commands Copy Button Engine (+ Legacy Fallback)
// =================================================================
function initCopyButtons() {
    let toggle = false;
    const handleCopy = async (button, target) => {
        if (!button || !target) return;
        const text = target.textContent.trim();
        if (!text) return;

        const tip = button.parentElement ? button.parentElement.querySelector('.copy-tip') : null;
        clearTimeout(button._copyTimer);
        delete button.dataset.copied;
        delete button.dataset.failed;

        try {
            if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
                throw new Error('Clipboard API unavailable');
            }
            await navigator.clipboard.writeText(text);
            button.dataset.copied = '';
            if (tip) {
                toggle = !toggle;
                tip.textContent = `Copied to clipboard${toggle ? '\u00A0' : ''}`;
            }
        } catch {
            button.dataset.failed = '';
            if (tip) {
                toggle = !toggle;
                tip.textContent = `Press Ctrl+C to copy${toggle ? '\u00A0' : ''}`;
            }
        }

        button._copyTimer = setTimeout(() => {
            delete button.dataset.copied;
            delete button.dataset.failed;
            if (tip) tip.textContent = '';
        }, 2000);
    };

    document.addEventListener('command', (e) => {
        if (e.command === '--copy') {
            handleCopy(e.source, e.target);
        }
    }, true);

    if (!('CommandEvent' in window)) {
        document.addEventListener('click', (e) => {
            const btn = e.target && e.target.closest ? e.target.closest('button[command="--copy"]') : null;
            if (!btn) return;
            const targetId = btn.getAttribute('commandfor');
            const target = targetId ? document.getElementById(targetId) : null;
            handleCopy(btn, target);
        });
    }
}

// =================================================================
// Runtime Core Execution Mount
// =================================================================
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        try {
            const revealEngine = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        revealEngine.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.05 });
            document.querySelectorAll('.reveal-element').forEach(el => revealEngine.observe(el));
        } catch {
            document.querySelectorAll('.reveal-element').forEach(el => el.classList.add('visible'));
        }

        const fontLink = document.getElementById('google-fonts-link');
        if (fontLink) fontLink.media = 'all';

        try {
            if (typeof MemoryBackplane !== 'undefined') {
                new MemoryBackplane();
            }
        } catch (e) {
            console.warn('MemoryBackplane initialization bypassed:', e);
        }

        initCompositeCursor();
        initConsoleTyping();
        initCallGlitchText();
        initTextDecryption();
        initParallaxArchitecture();
        initRescueVisualizer();
        runPipelineTelemetry();
        initLinkSecurity();
        initDynamicTelemetry();
        initWebMCP();
        initHeroCommandDeck();
        initCopyButtons();

        const yEl = document.getElementById('year');
        if (yEl) yEl.textContent = Math.max(2026, new Date().getFullYear());

        const toggle = document.getElementById('mobile-toggle');
        const menu = document.getElementById('menu-box');

        const closeMobileMenu = (restoreFocus = false) => {
            if (menu && menu.classList.contains('active')) {
                menu.classList.remove('active');
                if (toggle) {
                    toggle.setAttribute('aria-expanded', 'false');
                    const svgPath = toggle.querySelector('svg path');
                    if (svgPath) svgPath.setAttribute('d', 'M3 12h18M3 6h18M3 18h18');
                    if (restoreFocus) toggle.focus();
                }
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
        const progressEl = document.getElementById('scroll-progress');
        const supportsScrollTimeline = typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('animation-timeline', 'scroll()');
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

        let isScrolling = false;
        window.addEventListener('scroll', () => {
            if (!isScrolling) {
                window.requestAnimationFrame(() => {
                    if (header) {
                        window.scrollY > 40 ? header.classList.add('scrolled') : header.classList.remove('scrolled');
                    }
                    if (progressEl && !supportsScrollTimeline && !window.sysPrefersReducedMotion) {
                        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
                        const pct = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
                        progressEl.style.transform = `scaleX(${pct})`;
                    }
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
        initCompositeCursor,
        initHeroCommandDeck,
        initCopyButtons
    };
}
