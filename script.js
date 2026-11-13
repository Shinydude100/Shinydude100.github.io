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
// Clickable Infrastructure Node Inspector (<dialog> + Invoker Commands)
// =================================================================
const NODE_ORDER = ['node-01', 'node-02', 'node-03', 'node-rx1', 'node-rx2'];

const NODE_TELEMETRY_CATALOG = {
    'node-01': {
        code: 'NODE-01 // CLUSTER_HA',
        status: 'BGP_ACTIVE',
        title: 'High-Availability Systems Infrastructure',
        summary: 'Multi-node distributed physical core across 174 fleet hosts with dual-stacked BGP peering, redundant L3 core switches, and automated multi-WAN health failover across DFW campus sites.',
        kpis: [
            { label: 'SLA UPTIME', value: '99.992%' },
            { label: 'FLEET HOSTS', value: '174 / 174' },
            { label: 'TRUNK FABRIC', value: '10GbE LACP' },
            { label: 'FAILOVER', value: '< 1.2s' }
        ],
        specs: [
            { term: 'Control Plane', value: 'FRRouting BGPv4/v6 + VRRP Keepalived HA pair' },
            { term: 'Switching Fabric', value: 'Dual 10GbE SFP+ LACP trunking (IEEE 802.3ad)' },
            { term: 'Segmentation', value: 'Strict 802.1Q trunk isolation (Mgmt / AV / Fleet)' },
            { term: 'Observability', value: 'Prometheus + Grafana + syslog TLS alerting' }
        ],
        tableCaption: '802.1Q VLAN Segmentation & HA Failover Matrix',
        vlans: [
            ['VLAN 10 // MGMT_OOB', '10.10.0.0/24 (bond0.10)', 'ENFORCED // SSH+mTLS'],
            ['VLAN 20 // AV_MEDIA_TX', '10.20.0.0/22 (bond0.20)', 'QoS DSCP EF (Realtime)'],
            ['VLAN 30 // CORP_FLEET', '10.30.0.0/22 (bond0.30)', 'MULTI-WAN ACTIVE/BACKUP']
        ],
        cli: 'vtysh -c "show bgp summary" && ip -br link show && systemctl is-active keepalived',
        ctaLabel: 'Inspect Remediation Scripts →',
        ctaHref: '#tools'
    },
    'node-02': {
        code: 'NODE-02 // MIPS_VFPU',
        status: '60.0_FPS',
        title: 'Hardware Synthesis & Low-Level Optimization',
        summary: 'Bare-metal MIPS Allegrex R4000 dynarec JIT and Sony PSP Graphical Unit (GU) microcode translation layer developed for DaedalusX64. Maps 2-cycle N64 RDP combiners into fixed-function PSP passes inside a strict 2MB EDRAM budget.',
        kpis: [
            { label: 'FRAME TARGET', value: '16.6ms (60Hz)' },
            { label: 'VFPU SIMD', value: '98.4% util' },
            { label: 'GU EDRAM', value: '2.0 MB' },
            { label: 'CPU ARCH', value: 'MIPS32r2 @ 333MHz' }
        ],
        specs: [
            { term: 'Dynarec Engine', value: 'MIPS-to-MIPS R4000 JIT with register caching' },
            { term: 'Shader Mapping', value: '64-bit RDP Mux Key -> sceGuTexFunc + ColourAdjuster' },
            { term: 'Memory Bus', value: 'Aligned 16-byte DMA bursts & texture palette swizzle' },
            { term: 'Toolchain', value: 'MinPSPw GCC + BlendModes.cpp microcode exhibits' }
        ],
        tableCaption: 'PSP GU Memory & HLE Combiner Translation Table',
        vlans: [
            ['VRAM_EDRAM // FB0/ZBUF', '0x04000000-0x04200000 (2MB)', '16-bit Swizzle + Scissor'],
            ['TEX_ENV // GU_TFX_BLEND', 'sceGuTexEnvColor (Prim/Env)', 'Single-Pass Fixed Function'],
            ['ALPHA_TCC // SET_A_OPAQUE', 'GU_TCC_RGBA vs GU_TCC_RGB', 'Cf.a * Texel0.a Masked']
        ],
        cli: 'psp-objdump -d DaedalusPSP.elf | grep -E "sceGuTexFunc|ColourAdjuster" | head -n 20',
        ctaLabel: 'Open N64 Combiner Lab →',
        ctaHref: '/DaedalusX64/#combiner-lab'
    },
    'node-03': {
        code: 'NODE-03 // ZERO_TRUST',
        status: 'ENFORCED',
        title: 'Defensive Systems, Endpoint Governance & IR',
        summary: "Zero-trust logical access boundary enforcing strict Content Security Policies (script-src 'self'), HSTS preloading, CIS Level 2 workstation baselines, and continuous drift remediation across Windows and Debian endpoints.",
        kpis: [
            { label: 'CFG DRIFT', value: '0.00%' },
            { label: 'IR MTTR', value: '4.2 min' },
            { label: 'THREAT BLOCK', value: '100%' },
            { label: 'CSP SCRIPT', value: "script-src 'self'" }
        ],
        specs: [
            { term: 'Browser Sandbox', value: 'Strict CSP Level 3, no eval/inline scripts, object-src none' },
            { term: 'Identity & Keys', value: 'FIDO2 hardware tokens + least-privilege RBAC policies' },
            { term: 'Endpoint Baseline', value: 'BitLocker TPM 2.0 + WDAC signed-binary enforcement' },
            { term: 'SIEM / Telemetry', value: 'Real-time Sysmon + Cloudflare Edge header attestation' }
        ],
        tableCaption: 'Zero-Trust Policy Enforcement & Isolation Zones',
        vlans: [
            ['ZONE 01 // UNTRUSTED_WAN', 'CF-Edge WAF + TLSv1.3', 'Strict HSTS + CSP Locked'],
            ['ZONE 02 // WORKSTATION_EDR', 'VLAN 35 (Host Isolated)', 'CIS L2 + AppLocker Active'],
            ['ZONE 03 // SEC_VAULT_IAM', 'Air-Gapped MFA Quorum', 'Zero Lateral Peer Routing']
        ],
        cli: 'curl -sI https://daca.me | grep -iE "content-security-policy|strict-transport-security"',
        ctaLabel: 'Book Security Consultation →',
        ctaHref: '/support/#book'
    },
    'node-rx1': {
        code: 'NODE-RX1 // STUDIO_PRO',
        status: 'PCIe_5.0_X16',
        title: 'Sustained Render Pipelines & Custom CAD Workstations',
        summary: 'Custom-engineered DFW workstation builds validated under 24-hour thermal soak tests for 8K DaVinci Resolve grading, Unreal Engine bake farms, and sustained dual-NVMe Gen5 scratch throughput without clock throttling.',
        kpis: [
            { label: 'SEQ READ', value: '14.2 GB/s' },
            { label: 'LOAD TEMP', value: '54 °C' },
            { label: 'GPU COMPUTE', value: '24GB+ CUDA' },
            { label: 'UPLINK', value: '10GbE SFP+' }
        ],
        specs: [
            { term: 'Storage Subsystem', value: 'Dual PCIe 5.0 NVMe RAID-0 Scratch + ZFS Mirror Archive' },
            { term: 'Thermal Envelope', value: 'Positive-pressure high-static airflow curve (<= 54°C delta)' },
            { term: 'Power Delivery', value: '80+ Titanium ATX 3.1 native 12V-2x6 Sense transient buffer' },
            { term: 'Validation Protocol', value: 'OCCT Power + FurMark + Prime95 AVX2 24h burn-in' }
        ],
        tableCaption: 'Workstation I/O Bus & Network Fabric Allocation',
        vlans: [
            ['BUS 01 // PCIe_5.0_x16', 'GPU Render Engine (OptiX)', 'Dedicated CPU Direct Lanes'],
            ['BUS 02 // M2_GEN5_SCRATCH', '14.2 GB/s DirectStorage', 'HW Thermal Shield Active'],
            ['NIC 01 // VLAN_40_NAS', '10.40.0.0/24 (10GbE Jumbo)', 'MTU 9000 // SMB Multichannel']
        ],
        cli: 'nvidia-smi --query-gpu=name,temperature.gpu,power.draw,pcie.link.gen.current --format=csv',
        ctaLabel: 'Commission Workstation Build →',
        ctaHref: '/support/#book'
    },
    'node-rx2': {
        code: 'NODE-RX2 // EDGE_KVM',
        status: 'IOMMU_ISOLATED',
        title: 'Isolated Runtime Fabrics & Hardened Edge Compute',
        summary: 'Whisper-quiet DDR5 ECC hypervisor nodes tuned for local quantized LLM inference, VFIO GPU passthrough under Proxmox VE / KVM, and TPM 2.0 LUKS encrypted root volumes with out-of-band BMC management.',
        kpis: [
            { label: 'RAND IOPS', value: '1.42 M' },
            { label: 'ACOUSTIC', value: '21 dBA' },
            { label: 'ECC MEMORY', value: 'DDR5 REG' },
            { label: 'PACKET DROP', value: '0.00%' }
        ],
        specs: [
            { term: 'Hypervisor Layer', value: 'Proxmox VE / QEMU-KVM with VFIO-PCI ACS IOMMU groups' },
            { term: 'Storage Crypto', value: 'TPM 2.0 Auto-Unlock LUKS2 AES-XTS-512 ZFS Pools' },
            { term: 'Memory Reliability', value: 'Side-band + On-die DDR5 ECC single-bit scrub active' },
            { term: 'Inference Runtime', value: 'Isolated vLLM / llama.cpp CUDA container sandbox' }
        ],
        tableCaption: 'KVM Bridge Topology & IOMMU VFIO Group Mapping',
        vlans: [
            ['vmbr0.10 // BMC_IPMI', '10.10.2.0/24 (Dedicated)', 'Out-of-Band mTLS KVM'],
            ['vmbr1.50 // AI_SANDBOX', '10.50.0.0/24 (EgressDeny)', 'VFIO GPU Passthrough Grp 14'],
            ['vmbr1.60 // DMZ_EDGE_SVC', '10.60.0.0/24 (CF Tunnel)', 'Zero Inbound Port Forward']
        ],
        cli: 'qm list && find /sys/kernel/iommu_groups/ -type l | sort -V | head -n 15',
        ctaLabel: 'Configure Edge Node →',
        ctaHref: '/support/#book'
    }
};

function initNodeInspector() {
    const dialog = document.getElementById('node-inspector-dialog');
    if (!dialog) return null;

    const codeEl = document.getElementById('node-inspector-code');
    const statusEl = document.getElementById('node-inspector-status');
    const titleEl = document.getElementById('node-inspector-title');
    const summaryEl = document.getElementById('node-inspector-summary');
    const kpisEl = document.getElementById('node-inspector-kpis');
    const specsEl = document.getElementById('node-inspector-specs');
    const tableCaptionEl = document.getElementById('node-inspector-table-caption');
    const vlanBodyEl = document.getElementById('node-inspector-vlan-body');
    const cliEl = document.getElementById('node-inspector-cli');
    const indexEl = document.getElementById('node-inspector-index');
    const prevBtn = document.getElementById('node-inspector-prev');
    const nextBtn = document.getElementById('node-inspector-next');
    const ctaEl = document.getElementById('node-inspector-cta');
    const switchPills = Array.from(dialog.querySelectorAll('.inspector-switch-pill[data-switch-node]'));

    let currentNodeId = NODE_ORDER[0];
    let supportsDisplayTransition;

    const canTransitionDisplay = () => {
        if (supportsDisplayTransition !== undefined) return supportsDisplayTransition;
        if (!window.CSS?.supports?.('transition-behavior', 'allow-discrete') || !document.body) {
            return false;
        }
        const probe = document.createElement('div');
        probe.style.setProperty('transition', 'display 1s allow-discrete', 'important');
        probe.style.display = 'block';
        document.body.appendChild(probe);
        getComputedStyle(probe).display;
        probe.style.display = 'none';
        supportsDisplayTransition = getComputedStyle(probe).display === 'block';
        probe.remove();
        return supportsDisplayTransition;
    };

    const supportsTopLayerExit = () => Boolean(window.CSS?.supports?.('overlay', 'auto') && canTransitionDisplay());

    const closeTopLayer = async (targetDialog) => {
        const isDialogOpen = Boolean(targetDialog && (targetDialog.open || targetDialog.hasAttribute('open')));
        if (!isDialogOpen) return;

        if (!supportsTopLayerExit()) {
            targetDialog.setAttribute('data-closing', '');
            const animations = typeof targetDialog.getAnimations === 'function'
                ? targetDialog.getAnimations({ subtree: true })
                : [];
            if (animations.length > 0) {
                await Promise.race([
                    Promise.allSettled(animations.map((a) => a.finished)),
                    new Promise((r) => setTimeout(r, 400))
                ]);
            }
            if (!targetDialog.hasAttribute('data-closing')) return;
            targetDialog.removeAttribute('data-closing');
        }

        if (typeof targetDialog.close === 'function') {
            targetDialog.close();
        } else {
            targetDialog.removeAttribute('open');
        }
    };

    const resetCardTilts = () => {
        document.querySelectorAll('.interactive-card').forEach((card) => {
            card.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px)';
        });
    };

    const resetCliCopyFeedback = () => {
        const copyBtn = dialog.querySelector('button[commandfor="node-inspector-cli"]');
        if (copyBtn) {
            clearTimeout(copyBtn._copyTimer);
            delete copyBtn.dataset.copied;
            delete copyBtn.dataset.failed;
            const tip = copyBtn.parentElement ? copyBtn.parentElement.querySelector('.copy-tip') : null;
            if (tip) tip.textContent = '';
        }
    };

    const populateNode = (requestedId) => {
        const nodeId = Object.prototype.hasOwnProperty.call(NODE_TELEMETRY_CATALOG, requestedId)
            ? requestedId
            : NODE_ORDER[0];
        const data = NODE_TELEMETRY_CATALOG[nodeId];
        currentNodeId = nodeId;

        const idx = NODE_ORDER.indexOf(nodeId);
        if (codeEl) codeEl.textContent = data.code;
        if (statusEl) statusEl.textContent = data.status;
        if (titleEl) titleEl.textContent = data.title;
        if (summaryEl) summaryEl.textContent = data.summary;
        if (tableCaptionEl) tableCaptionEl.textContent = data.tableCaption;
        if (cliEl) cliEl.textContent = data.cli;
        if (indexEl) indexEl.textContent = `${String(idx + 1).padStart(2, '0')} / ${String(NODE_ORDER.length).padStart(2, '0')}`;
        if (ctaEl) {
            ctaEl.textContent = data.ctaLabel;
            ctaEl.setAttribute('href', data.ctaHref);
        }

        if (kpisEl) {
            const kpiFrag = document.createDocumentFragment();
            data.kpis.forEach((kpi) => {
                const cell = document.createElement('div');
                cell.className = 'inspector-kpi-cell';
                const lbl = document.createElement('span');
                lbl.className = 'inspector-kpi-label';
                lbl.textContent = kpi.label;
                const val = document.createElement('span');
                val.className = 'inspector-kpi-val';
                val.textContent = kpi.value;
                cell.appendChild(lbl);
                cell.appendChild(val);
                kpiFrag.appendChild(cell);
            });
            kpisEl.replaceChildren(kpiFrag);
        }

        if (specsEl) {
            const specsFrag = document.createDocumentFragment();
            data.specs.forEach((spec) => {
                const wrap = document.createElement('div');
                wrap.className = 'inspector-spec-card';
                const dt = document.createElement('dt');
                dt.textContent = spec.term;
                const dd = document.createElement('dd');
                dd.textContent = spec.value;
                wrap.appendChild(dt);
                wrap.appendChild(dd);
                specsFrag.appendChild(wrap);
            });
            specsEl.replaceChildren(specsFrag);
        }

        if (vlanBodyEl) {
            const rowsFrag = document.createDocumentFragment();
            data.vlans.forEach((rowCells) => {
                const tr = document.createElement('tr');
                rowCells.forEach((cellText, colIdx) => {
                    const cell = document.createElement(colIdx === 0 ? 'th' : 'td');
                    if (colIdx === 0) cell.setAttribute('scope', 'row');
                    cell.textContent = cellText;
                    tr.appendChild(cell);
                });
                rowsFrag.appendChild(tr);
            });
            vlanBodyEl.replaceChildren(rowsFrag);
        }

        switchPills.forEach((pill) => {
            if (pill.getAttribute('data-switch-node') === nodeId) {
                pill.setAttribute('aria-current', 'true');
            } else {
                pill.removeAttribute('aria-current');
            }
        });

        resetCliCopyFeedback();
        return nodeId;
    };

    const openNode = (nodeId) => {
        populateNode(nodeId);
        resetCardTilts();
        dialog.removeAttribute('data-closing');
        const isAlreadyOpen = Boolean(dialog.open || dialog.hasAttribute('open'));
        if (!isAlreadyOpen) {
            if (typeof dialog.showModal === 'function') {
                dialog.showModal();
            } else {
                dialog.setAttribute('open', '');
            }
        }
    };

    // Listen directly on <dialog> because native Invoker 'command' events do not bubble
    dialog.addEventListener('command', (event) => {
        if (event.command === 'show-modal') {
            const requestedId = event.source && event.source.getAttribute
                ? event.source.getAttribute('data-inspect-node')
                : currentNodeId;
            populateNode(requestedId);
            resetCardTilts();
            dialog.removeAttribute('data-closing');
        } else if (event.command === 'close' && !supportsTopLayerExit()) {
            event.preventDefault();
            closeTopLayer(dialog);
        }
    });

    // Progressive enhancement fallback when native Invoker Commands are absent
    if (typeof HTMLButtonElement === 'undefined' || !('commandForElement' in HTMLButtonElement.prototype)) {
        document.addEventListener('click', (event) => {
            const showBtn = event.target && event.target.closest
                ? event.target.closest('button[command="show-modal"][commandfor="node-inspector-dialog"]')
                : null;
            if (showBtn) {
                openNode(showBtn.getAttribute('data-inspect-node'));
                return;
            }
            const closeBtn = event.target && event.target.closest
                ? event.target.closest('button[command="close"][commandfor="node-inspector-dialog"]')
                : null;
            if (closeBtn) {
                closeTopLayer(dialog);
            }
        });
    }

    switchPills.forEach((pill) => {
        pill.addEventListener('click', () => {
            populateNode(pill.getAttribute('data-switch-node'));
        });
    });

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            const idx = NODE_ORDER.indexOf(currentNodeId);
            const prevIdx = (idx - 1 + NODE_ORDER.length) % NODE_ORDER.length;
            populateNode(NODE_ORDER[prevIdx]);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const idx = NODE_ORDER.indexOf(currentNodeId);
            const nextIdx = (idx + 1) % NODE_ORDER.length;
            populateNode(NODE_ORDER[nextIdx]);
        });
    }

    document.querySelectorAll('.interactive-card[data-node-id]').forEach((card) => {
        card.addEventListener('click', (event) => {
            if (event.target && event.target.closest && event.target.closest('a, button, input, select, textarea, code, pre')) {
                return;
            }
            const sel = typeof window.getSelection === 'function' ? window.getSelection() : null;
            if (sel && sel.toString().trim().length > 0) {
                return;
            }
            const inspectBtn = card.querySelector('.node-inspect-btn');
            if (inspectBtn) {
                inspectBtn.focus({ preventScroll: true });
                inspectBtn.click();
            } else {
                openNode(card.getAttribute('data-node-id'));
            }
        });
    });

    if (ctaEl) {
        ctaEl.addEventListener('click', (event) => {
            const href = ctaEl.getAttribute('href') || '';
            if (href.startsWith('#')) {
                event.preventDefault();
                closeTopLayer(dialog).then(() => {
                    const target = document.querySelector(href);
                    if (target && typeof target.scrollIntoView === 'function') {
                        target.scrollIntoView({ behavior: window.sysPrefersReducedMotion ? 'auto' : 'smooth' });
                    }
                });
            }
        });
    }

    dialog.addEventListener('cancel', (event) => {
        event.preventDefault();
        closeTopLayer(dialog);
    });

    dialog.addEventListener('close', () => {
        dialog.returnValue = '';
        dialog.removeAttribute('data-closing');
    });

    if (typeof HTMLDialogElement !== 'undefined' && !('closedBy' in HTMLDialogElement.prototype)) {
        const outside = (e) => {
            const r = dialog.getBoundingClientRect();
            return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
        };
        let pressedOutside = false;
        dialog.addEventListener('pointerdown', (e) => { pressedOutside = outside(e); });
        dialog.addEventListener('pointerup', (e) => {
            if (pressedOutside && outside(e)) closeTopLayer(dialog);
        });
    }

    populateNode(NODE_ORDER[0]);
    return { openNode, populateNode, closeTopLayer: () => closeTopLayer(dialog) };
}

// =================================================================
// Case Studies Native <details> Accordion Controls
// =================================================================
function initCaseStudyAccordion() {
    const list = document.getElementById('case-studies-list');
    const toggleBtn = document.getElementById('case-studies-toggle-all');
    if (!list) return;

    const getItems = () => Array.from(list.querySelectorAll(':scope > details'));

    const syncToggleButtonState = () => {
        if (!toggleBtn) return;
        const items = getItems();
        const allOpen = items.length > 0 && items.every(details => details.open);
        toggleBtn.setAttribute('aria-expanded', String(allOpen));
    };

    const handleToggleAll = () => {
        if (!toggleBtn) return;
        const expand = toggleBtn.getAttribute('aria-expanded') !== 'true';
        getItems().forEach(details => {
            details.open = expand;
        });
        syncToggleButtonState();
    };

    if (typeof HTMLButtonElement !== 'undefined' && Object.hasOwn(HTMLButtonElement.prototype, 'commandForElement')) {
        list.addEventListener('command', (event) => {
            if (event.command !== '--toggle-all') return;
            handleToggleAll();
        });
    } else if (toggleBtn) {
        toggleBtn.addEventListener('click', handleToggleAll);
    }

    list.addEventListener('toggle', (event) => {
        if (!event.target || !event.target.matches('#case-studies-list > details')) return;
        syncToggleButtonState();
    }, { capture: true });

    syncToggleButtonState();
}

// =================================================================
// Runtime Core Execution Mount
// =================================================================
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const supportsViewTimeline = typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('(animation-timeline: view()) and (animation-range: entry)');
        if (!supportsViewTimeline) {
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
        } else {
            document.querySelectorAll('.reveal-element').forEach(el => el.classList.add('visible'));
        }

        initParallaxArchitecture();
        initRescueVisualizer();
        runPipelineTelemetry();
        initLinkSecurity();
        initDynamicTelemetry();
        initWebMCP();
        initHeroCommandDeck();
        initCopyButtons();
        initNodeInspector();
        initCaseStudyAccordion();

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
        initParallaxArchitecture,
        initHeroCommandDeck,
        initCopyButtons,
        initDynamicTelemetry,
        NODE_ORDER,
        NODE_TELEMETRY_CATALOG,
        initNodeInspector,
        initCaseStudyAccordion
    };
}
