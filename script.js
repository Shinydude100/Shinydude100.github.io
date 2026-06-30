        // Global Motion & State Controls
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // =================================================================
        // Dynamic Memory Visualizer Matrix (High-DPI & Interactivity Waves)
        // =================================================================
        class MemoryBackplane {
            constructor() {
                this.canvas = document.getElementById('matrix-backplane');
                this.ctx = this.canvas.getContext('2d');
                this.hexTokens = ['00', '1F', 'A4', 'C2', 'FF', '0E', '8B', '3A', 'D1', '7E', 'E5', '9C', 'A0', 'B3'];
                this.streams = [];
                this.fontSize = 11;
                this.interaction = { x: -1000, y: -1000, pingRadius: 0, targetRadius: 0, active: false };

                this.init();
                this.bindInteractions();
                window.addEventListener('resize', () => this.init());

                // Track Tab Focus state changes cleanly to eliminate CPU waste
                document.addEventListener('visibilitychange', () => {
                    this.isRenderActive = document.visibilityState === 'visible';
                });
                this.isRenderActive = true;

                if (!prefersReducedMotion) {
                    this.animate();
                } else {
                    this.renderStaticFrame();
                }
            }

            init() {
                const dpr = window.devicePixelRatio || 1;
                this.canvas.width = window.innerWidth * dpr;
                this.canvas.height = window.innerHeight * dpr;
                this.canvas.style.width = `${window.innerWidth}px`;
                this.canvas.style.height = `${window.innerHeight}px`;

                // Hardened fix: Restoring absolute vector transformations to break relative scale loop leaks
                this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

                this.columns = Math.floor(window.innerWidth / 45);
                this.streams = [];

                for (let i = 0; i < this.columns; i++) {
                    this.streams.push({
                        x: i * 45,
                        y: Math.random() * -window.innerHeight,
                        speed: Math.random() * 1.5 + 1,
                        chars: Array.from({length: Math.floor(Math.random() * 20) + 12}, () => this.randomToken())
                    });
                }
            }

            bindInteractions() {
                const triggerPing = (e) => {
                    this.interaction.x = e.clientX || (e.touches && e.touches[0].clientX);
                    this.interaction.y = e.clientY || (e.touches && e.touches[0].clientY);
                    this.interaction.pingRadius = 0;
                    this.interaction.targetRadius = Math.max(window.innerWidth, window.innerHeight) * 0.35;
                    this.interaction.active = true;
                };
                window.addEventListener('click', triggerPing);
                window.addEventListener('touchstart', triggerPing, {passive: true});
            }

            randomToken() {
                return this.hexTokens[Math.floor(Math.random() * this.hexTokens.length)];
            }

            renderStaticFrame() {
                this.ctx.fillStyle = '#020617';
                this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
                this.ctx.font = `600 ${this.fontSize}px 'Fira Code', monospace`;

                for (let i = 0; i < this.streams.length; i++) {
                    let stream = this.streams[i];
                    stream.y = Math.random() * window.innerHeight;
                    for (let j = 0; j < stream.chars.length; j++) {
                        let yPos = stream.y + (j * (this.fontSize + 6));
                        if (yPos < window.innerHeight) {
                            this.ctx.fillStyle = `rgba(253, 224, 71, 0.08)`;
                            this.ctx.fillText(stream.chars[j], stream.x, yPos);
                        }
                    }
                }
            }

            animate() {
                // Throttle compilation loops if tab visibility matrix states drop
                if (!this.isRenderActive) {
                    requestAnimationFrame(() => this.animate());
                    return;
                }

                this.ctx.fillStyle = 'rgba(2, 6, 23, 0.15)';
                this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
                this.ctx.font = `600 ${this.fontSize}px 'Fira Code', monospace`;

                if (this.interaction.active && this.interaction.pingRadius < this.interaction.targetRadius) {
                    this.interaction.pingRadius += 12;
                } else {
                    this.interaction.active = false;
                }

                for (let i = 0; i < this.streams.length; i++) {
                    let stream = this.streams[i];

                    for (let j = 0; j < stream.chars.length; j++) {
                        let yPos = stream.y + (j * (this.fontSize + 6));

                        if (yPos > 0 && yPos < window.innerHeight) {
                            let alpha = 1 - (j / stream.chars.length);
                            let finalFill = `rgba(253, 224, 71, ${alpha * 0.16})`;
                            let displayToken = stream.chars[j];
                            let isGlitchedNode = false;

                            if (this.interaction.active) {
                                let dx = stream.x - this.interaction.x;
                                let dy = yPos - this.interaction.y;
                                let currentDist = Math.hypot(dx, dy);

                                if (Math.abs(currentDist - this.interaction.pingRadius) < 40) {
                                    isGlitchedNode = true;
                                }
                            }

                            if (isGlitchedNode) {
                                finalFill = `rgba(255, 60, 100, ${alpha * 0.9})`;
                                displayToken = 'XX';
                            } else if (j === 0) {
                                finalFill = `rgba(255, 255, 255, ${alpha * 0.8})`;
                            }

                            this.ctx.fillStyle = finalFill;
                            this.ctx.fillText(displayToken, stream.x, yPos);
                        }
                    }

                    stream.y += stream.speed;

                    if (stream.y > window.innerHeight) {
                        stream.y = Math.random() * -200;
                        stream.speed = Math.random() * 1.5 + 1;
                    }

                    if (Math.random() < 0.02) {
                        stream.chars[Math.floor(Math.random() * stream.chars.length)] = this.randomToken();
                    }
                }
                requestAnimationFrame(() => this.animate());
            }
        }

        // =================================================================
        // Fluid GPU-bound Interpolated Vector Pointer Engine
        // =================================================================
        function initCompositeCursor() {
            if (!window.matchMedia("(pointer: fine)").matches) return;
            document.documentElement.classList.add('sys-cursor-active');

            const dot = document.querySelector("[data-cursor-pointer]");
            const aura = document.querySelector("[data-cursor-aura]");

            let tX = 0, tY = 0, dX = 0, dY = 0, aX = 0, aY = 0;

            window.addEventListener('mousemove', e => { tX = e.clientX; tY = e.clientY; });

            function cycle() {
                dX += (tX - dX) * 0.35; dY += (tY - dY) * 0.35;
                aX += (tX - aX) * 0.16; aY += (tY - aY) * 0.16;

                if (dot) dot.style.transform = `translate3d(${dX}px, ${dY}px, 0)`;
                if (aura) aura.style.transform = `translate3d(${aX}px, ${aY}px, 0)`;

                requestAnimationFrame(cycle);
            }
            requestAnimationFrame(cycle);

            document.querySelectorAll("a, button, #mobile-toggle").forEach(el => {
                el.addEventListener('mouseenter', () => aura.classList.add('interacting'));
                el.addEventListener('mouseleave', () => aura.classList.remove('interacting'));
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

            descEl.innerHTML = '';
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

                        const routine = setInterval(() => {
                            target.textContent = finalTxt.split('').map((c, i) => {
                                if (i < count) return finalTxt[i];
                                if (c === " ") return " ";
                                return chars[Math.floor(Math.random() * chars.length)];
                            }).join('');

                            if (count >= finalTxt.length) {
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
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    const normX = (x / rect.width) * 2 - 1;
                    const normY = (y / rect.height) * 2 - 1;

                    card.style.setProperty('--m-x', `${x}px`);
                    card.style.setProperty('--m-y', `${y}px`);
                    card.style.transform = `rotateX(${normY * -4}deg) rotateY(${normX * 4}deg) translateZ(5px)`;
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

            for (let i = 0; i < totalNodes; i++) {
                const node = document.createElement('div');
                node.className = 'memory-node safe';
                grid.appendChild(node);
                nodes.push(node);
            }

            function appendLog(text, className = '') {
                const p = document.createElement('p');
                p.textContent = text;
                if (className) p.className = className;
                logArea.appendChild(p);
                if (logArea.children.length > 5) logArea.removeChild(logArea.firstElementChild);
            }

            function runSimulation() {
                logArea.innerHTML = '<p>Launching System Rescue Utility...</p><br>';
                progressBar.classList.add('active');

                statusTxt.textContent = "Stage 1 of 6: Extracting BSOD Crash Logs";
                appendLog("Scanning Event Viewer for recent system crashes...");

                const corruptIndices = [];
                for(let i=0; i < 7; i++) {
                    corruptIndices.push(Math.floor(Math.random() * totalNodes));
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
        // Secure GitHub API Payload Telemetry
        // =================================================================
        async function runPipelineTelemetry() {
            const countEl = document.getElementById('download-counter');
            if (!countEl) return;

            try {
                const response = await fetch('https://api.github.com/repos/Shinydude100/Shinydude100.github.io/releases');
                if (!response.ok) throw new Error();
                const payloads = await response.json();

                let downloads = 0;
                payloads.forEach(release => {
                    const asset = release.assets.find(a => a.name === 'Maintenence.zip');
                    if (asset) downloads += asset.download_count;
                });

                countEl.textContent = downloads.toLocaleString() + " PACKAGES DEPLOYED";
            } catch {
                countEl.textContent = "LOCAL_SECURE_MIRROR";
            }
        }

        // =================================================================
        // Runtime Core Execution Mount
        // =================================================================
        document.addEventListener('DOMContentLoaded', () => {
            new MemoryBackplane();
            initCompositeCursor();
            initConsoleTyping();
            initCallGlitchText();
            initTextDecryption();
            initParallaxArchitecture();
            initRescueVisualizer();
            runPipelineTelemetry();

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

            const closeMobileMenu = () => {
                if (menu && menu.classList.contains('active')) {
                    menu.classList.remove('active');
                    toggle.setAttribute('aria-expanded', 'false');
                }
            };

            if (toggle && menu) {
                toggle.addEventListener('click', () => {
                    const isActive = menu.classList.toggle('active');
                    toggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
                });
                menu.querySelectorAll('a').forEach(l => l.addEventListener('click', closeMobileMenu));
            }

            window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') closeMobileMenu();
            });

            const header = document.getElementById('site-header');
            const sections = document.querySelectorAll('section[id]');
            const navLinks = document.querySelectorAll('.nav-item');

            const scrollSpyObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const activeId = entry.target.getAttribute('id');
                        navLinks.forEach(item => {
                            const link = item.querySelector('a');
                            if (link && link.getAttribute('href') === `#${activeId}`) {
                                item.classList.add('active');
                            } else {
                                item.classList.remove('active');
                            }
                        });
                    }
                });
            }, { rootMargin: "-20% 0px -60% 0px", threshold: 0.1 });

            sections.forEach(section => scrollSpyObserver.observe(section));

            window.addEventListener('scroll', () => {
                window.scrollY > 40 ? header.classList.add('scrolled') : header.classList.remove('scrolled');
            }, { passive: true });
        });
