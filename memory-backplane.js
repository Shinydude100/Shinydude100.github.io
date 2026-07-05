let prefersReducedMotion = false;
if (typeof window !== "undefined" && window.matchMedia) {
    prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

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
                let resizeTimeout;
                window.addEventListener('resize', () => {
                    clearTimeout(resizeTimeout);
                    resizeTimeout = setTimeout(() => this.init(), 150);
                });

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

                // ⚡ Bolt Optimization: Set font once during initialization instead of every frame
                this.ctx.font = `600 ${this.fontSize}px 'Fira Code', monospace`;

                this.columns = Math.floor(window.innerWidth / 45);
                this.streams = [];

                for (let i = 0; i < this.columns; i++) {
                    const charCount = Math.floor(Math.random() * 20) + 12;
                    const fills = [];
                    const glitchFills = [];
                    for (let j = 0; j < charCount; j++) {
                        let alpha = 1 - (j / charCount);
                        fills.push(j === 0 ? `rgba(255, 255, 255, ${alpha * 0.8})` : `rgba(253, 224, 71, ${alpha * 0.16})`);
                        glitchFills.push(`rgba(255, 60, 100, ${alpha * 0.9})`);
                    }
                    this.streams.push({
                        x: i * 45,
                        y: Math.random() * -window.innerHeight,
                        speed: Math.random() * 1.5 + 1,
                        chars: Array.from({length: charCount}, () => this.randomToken()),
                        fills,
                        glitchFills
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
                // ⚡ Bolt Optimization: Cache DOM properties outside the loop to prevent layout thrashing and C++ boundary crossings
                const winWidth = window.innerWidth;
                const winHeight = window.innerHeight;

                this.ctx.fillStyle = '#020617';
                this.ctx.fillRect(0, 0, winWidth, winHeight);

                for (let i = 0; i < this.streams.length; i++) {
                    let stream = this.streams[i];
                    stream.y = Math.random() * winHeight;
                    for (let j = 0; j < stream.chars.length; j++) {
                        let yPos = stream.y + (j * (this.fontSize + 6));
                        if (yPos < winHeight) {
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

                // ⚡ Bolt Optimization: Cache DOM properties outside the loop to prevent layout thrashing and C++ boundary crossings
                const winWidth = window.innerWidth;
                const winHeight = window.innerHeight;

                this.ctx.fillStyle = 'rgba(2, 6, 23, 0.15)';
                this.ctx.fillRect(0, 0, winWidth, winHeight);

                if (this.interaction.active && this.interaction.pingRadius < this.interaction.targetRadius) {
                    this.interaction.pingRadius += 12;
                } else {
                    this.interaction.active = false;
                }

                for (let i = 0; i < this.streams.length; i++) {
                    let stream = this.streams[i];

                    // ⚡ Bolt Optimization: Extract dx calculation out of inner loop
                    let dx = 0;
                    if (this.interaction.active) {
                        dx = stream.x - this.interaction.x;
                    }

                    for (let j = 0; j < stream.chars.length; j++) {
                        let yPos = stream.y + (j * (this.fontSize + 6));

                        if (yPos > 0 && yPos < winHeight) {
                            // ⚡ Bolt Optimization: Precalculate string interpolations to prevent GC thrashing
                            let finalFill = stream.fills ? stream.fills[j] : `rgba(253, 224, 71, ${(1 - (j / stream.chars.length)) * 0.16})`;
                            let displayToken = stream.chars[j];
                            let isGlitchedNode = false;

                            if (this.interaction.active) {
                                let dy = yPos - this.interaction.y;
                                // ⚡ Bolt Optimization: Math.sqrt(dx*dx + dy*dy) is up to ~10x faster than Math.hypot in hot loops
                                let currentDist = Math.sqrt(dx * dx + dy * dy);

                                if (Math.abs(currentDist - this.interaction.pingRadius) < 40) {
                                    isGlitchedNode = true;
                                }
                            }

                            if (isGlitchedNode) {
                                finalFill = stream.glitchFills ? stream.glitchFills[j] : `rgba(255, 60, 100, ${(1 - (j / stream.chars.length)) * 0.9})`;
                                displayToken = 'XX';
                            } else if (j === 0 && (!stream.fills)) {
                                finalFill = `rgba(255, 255, 255, ${(1 - (j / stream.chars.length)) * 0.8})`;
                            }

                            this.ctx.fillStyle = finalFill;
                            this.ctx.fillText(displayToken, stream.x, yPos);
                        }
                    }

                    stream.y += stream.speed;

                    if (stream.y > winHeight) {
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

if (typeof module !== 'undefined' && module.exports) module.exports = { MemoryBackplane };
