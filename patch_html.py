import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# I need to find all <div class="interactive-card">...</div> blocks and replace their internals
# The HTML contains exactly 5 interactive cards

def generate_new_card(index, heading_span, heading_text, text, footer_badge):
    # Depending on the card, we might adjust the metric values, but let's keep it uniform for now as per v0

    # We will vary the status nodes based on index to make them look distinct
    node_str = f"NODE-0{int(index.split('//')[0].strip()) if index else 'X'}"
    if not index:
        node_str = "NODE-RX" # bare-metal cards have no index
        index = "0X // COMPUTE CORE"

    return f"""<div class="interactive-card">
                                <!-- Decorative technical overlays (non-interactive) -->
                                <div class="card-grid" aria-hidden="true"></div>
                                <div class="card-scanline" aria-hidden="true"></div>
                                <div class="corner-brackets" aria-hidden="true">
                                    <span class="cb cb-tl"></span><span class="cb cb-tr"></span>
                                    <span class="cb cb-bl"></span><span class="cb cb-br"></span>
                                </div>

                                <!-- Widget status bar -->
                                <div class="widget-topbar" aria-hidden="true">
                                    <div class="topbar-id">
                                        <span class="status-led"></span>
                                        <span class="topbar-node">{node_str}</span>
                                    </div>
                                    <div class="topbar-status">ONLINE</div>
                                </div>

                                <div class="card-body">
                                    <span class="card-index">{index}</span>
                                    <h3 class="card-heading">{f"<span>{heading_span}</span>" if heading_span else ""}{heading_text}</h3>
                                    <p class="card-text">{text}</p>

                                    <!-- Live metric readouts -->
                                    <div class="metric-grid" aria-hidden="true">
                                        <div class="metric">
                                            <span class="metric-label">UPTIME</span>
                                            <span class="metric-value">99.992<small>%</small></span>
                                            <span class="metric-bar"><i style="width:99%"></i></span>
                                        </div>
                                        <div class="metric">
                                            <span class="metric-label">LATENCY</span>
                                            <span class="metric-value">12<small>ms</small></span>
                                            <span class="metric-bar"><i style="width:22%"></i></span>
                                        </div>
                                        <div class="metric">
                                            <span class="metric-label">LOAD</span>
                                            <span class="metric-value metric-warn">0.74</span>
                                            <span class="metric-bar"><i class="warn" style="width:74%"></i></span>
                                        </div>
                                    </div>

                                    <!-- Fake activity graph / sparkline -->
                                    <div class="activity-graph" aria-hidden="true">
                                        <div class="graph-header">
                                            <span>THROUGHPUT · 60s</span><span class="graph-live">● LIVE</span>
                                        </div>
                                        <div class="graph-bars">
                                            <i style="height:35%"></i><i style="height:55%"></i><i style="height:40%"></i>
                                            <i style="height:70%"></i><i style="height:50%"></i><i style="height:85%"></i>
                                            <i style="height:60%"></i><i style="height:95%"></i><i style="height:72%"></i>
                                            <i style="height:45%"></i><i style="height:65%"></i><i style="height:88%"></i>
                                            <i style="height:52%"></i><i style="height:78%"></i><i style="height:42%"></i>
                                            <i style="height:68%"></i><i style="height:90%"></i><i style="height:58%"></i>
                                            <i style="height:48%"></i><i style="height:82%"></i>
                                        </div>
                                    </div>
                                </div>
                                <div class="card-footer">
                                    <div class="footer-nodes" aria-hidden="true">
                                        <span class="node-dot on"></span><span class="node-dot on"></span>
                                        <span class="node-dot on"></span><span class="node-dot warn"></span>
                                        <span class="node-dot on"></span><span class="node-dot on"></span>
                                        <span class="node-cluster">6/6 NODES</span>
                                    </div>
                                    <span class="sys-badge"><span class="badge-dot"></span>{footer_badge}</span>
                                </div>
                            </div>"""

# Replace Card 1
card1_old = r"""<div class="interactive-card">
                                <div class="card-body">
                                    <span class="card-index">01 // TELEMETRY & UPTIME</span>
                                    <h3 class="card-heading"><span>High-Availability</span>Systems Infrastructure</h3>
                                    <p class="card-text">Directing the complete operational lifecycle of multi-node distributed physical networks. Hardening systems to guarantee continuous service delivery, maximum runtime benchmarks, and minimal recovery constraints.</p>
                                </div>
                                <div class="card-footer">
                                    <span class="sys-badge">High Availability</span>
                                </div>
                            </div>"""
content = content.replace(card1_old, generate_new_card(
    "01 // TELEMETRY & UPTIME",
    "High-Availability",
    "Systems Infrastructure",
    "Directing the complete operational lifecycle of multi-node distributed physical networks. Hardening systems to guarantee continuous service delivery, maximum runtime benchmarks, and minimal recovery constraints.",
    "High Availability"
))

# Replace Card 2
card2_old = r"""<div class="interactive-card">
                                <div class="card-body">
                                    <span class="card-index">02 // REVERSE ENGINEERING</span>
                                    <h3 class="card-heading"><span>Hardware Synthesis</span>Low-Level Optimization</h3>
                                    <p class="card-text">Deep system exploration, execution tracing, and resource management. Leveraging comprehensive reverse engineering experience to maximize software capability against bare-metal hardware constraints.</p>
                                </div>
                                <div class="card-footer">
                                    <span class="sys-badge">Low-Level Optimization</span>
                                </div>
                            </div>"""
content = content.replace(card2_old, generate_new_card(
    "02 // REVERSE ENGINEERING",
    "Hardware Synthesis",
    "Low-Level Optimization",
    "Deep system exploration, execution tracing, and resource management. Leveraging comprehensive reverse engineering experience to maximize software capability against bare-metal hardware constraints.",
    "Low-Level Optimization"
))

# Replace Card 3
card3_old = r"""<div class="interactive-card">
                                <div class="card-body">
                                    <span class="card-index">03 // PROACTIVE GOVERNANCE</span>
                                    <h3 class="card-heading"><span>Defensive Systems</span>Endpoint Protection & IR</h3>
                                    <p class="card-text">Enforcing logical access parameters, asset controls, and Zero Trust security models. Developing automated configuration monitoring routines to neutralize system configuration drift and vulnerability footprints.</p>
                                </div>
                                <div class="card-footer">
                                    <span class="sys-badge">Zero Trust Architecture</span>
                                </div>
                            </div>"""
content = content.replace(card3_old, generate_new_card(
    "03 // PROACTIVE GOVERNANCE",
    "Defensive Systems",
    "Endpoint Protection &amp; IR",
    "Enforcing logical access parameters, asset controls, and Zero Trust security models. Developing automated configuration monitoring routines to neutralize system configuration drift and vulnerability footprints.",
    "Zero Trust Architecture"
))

# Replace Card 4 (PC Builds section)
card4_old = r"""<div class="interactive-card">
                                <div class="card-body">
                                    <h3 class="card-heading">High-Availability Creative Nodes</h3>
                                    <p class="card-text">Bespoke workstation computing environments tailored to bypass execution limits in multi-threaded rendering, non-linear video compilation pipelines, and heavy visual asset generation.</p>
                                </div>
                                <div class="card-footer">
                                    <span class="sys-badge">Media Workstations</span>
                                </div>
                            </div>"""
content = content.replace(card4_old, generate_new_card(
    "",
    "",
    "High-Availability Creative Nodes",
    "Bespoke workstation computing environments tailored to bypass execution limits in multi-threaded rendering, non-linear video compilation pipelines, and heavy visual asset generation.",
    "Media Workstations"
))

# Replace Card 5 (PC Builds section)
card5_old = r"""<div class="interactive-card">
                                <div class="card-body">
                                    <h3 class="card-heading">Hardened Edge Compute Nodes</h3>
                                    <p class="card-text">High-performance target builds optimized for localized processing tasks, secure edge data collections, isolated runtime tools, and specialized memory-bus configurations.</p>
                                </div>
                                <div class="card-footer">
                                    <span class="sys-badge">Compute Topologies</span>
                                </div>
                            </div>"""
content = content.replace(card5_old, generate_new_card(
    "",
    "",
    "Hardened Edge Compute Nodes",
    "High-performance target builds optimized for localized processing tasks, secure edge data collections, isolated runtime tools, and specialized memory-bus configurations.",
    "Compute Topologies"
))

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced HTML successfully")
