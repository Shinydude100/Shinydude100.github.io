import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the new CSS block
new_css = """
        /* ================= CORE PHYSICS (unchanged) ================= */
        .interactive-card {
          background: var(--bg-card);
          border: 1px solid var(--border-glow);
          border-radius: var(--radius-md);
          padding: 2rem 2rem 1.75rem;
          min-height: 400px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transform-style: preserve-3d;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s, background-color 0.3s, box-shadow 0.3s;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          font-family: var(--font-body);
        }
        .interactive-card:hover {
          border-color: var(--accent);
          background: rgba(17, 24, 39, 0.8);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(253, 224, 71, 0.08);
        }
        .interactive-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(400px circle at var(--m-x, 0px) var(--m-y, 0px), rgba(253, 224, 71, 0.08), transparent 60%);
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
          z-index: 3;
        }
        .interactive-card:hover::before { opacity: 1; }

        /* ================= TECHNICAL OVERLAYS ================= */
        .card-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(var(--border-glow) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-glow) 1px, transparent 1px);
          background-size: 28px 28px;
          opacity: 0.15;
          pointer-events: none;
          mask-image: radial-gradient(ellipse at 70% 0%, #000 0%, transparent 75%);
          -webkit-mask-image: radial-gradient(ellipse at 70% 0%, #000 0%, transparent 75%);
        }
        .card-scanline {
          position: absolute; inset: 0;
          background: repeating-linear-gradient(0deg, transparent 0 3px, rgba(226, 232, 240, 0.02) 3px 4px);
          pointer-events: none;
        }
        .corner-brackets { position: absolute; inset: 0; pointer-events: none; }
        .cb { position: absolute; width: 12px; height: 12px; border: 1px solid var(--accent); opacity: 0.4; transition: opacity 0.3s; }
        .interactive-card:hover .cb { opacity: 0.9; }
        .cb-tl { top: 10px; left: 10px; border-right: 0; border-bottom: 0; }
        .cb-tr { top: 10px; right: 10px; border-left: 0; border-bottom: 0; }
        .cb-bl { bottom: 10px; left: 10px; border-right: 0; border-top: 0; }
        .cb-br { bottom: 10px; right: 10px; border-left: 0; border-top: 0; }

        /* ================= TOP STATUS BAR ================= */
        .widget-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.85rem;
          margin-bottom: 1.25rem;
          border-bottom: 1px solid var(--border-glow);
          transform: translateZ(30px);
          font-family: var(--font-mono);
        }
        .topbar-id { display: flex; align-items: center; gap: 0.55rem; }
        .status-led {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 8px var(--accent), 0 0 2px var(--accent);
          animation: pulse-led 1.8s ease-in-out infinite;
        }
        @keyframes pulse-led { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
        .topbar-node { font-size: 0.62rem; letter-spacing: 0.12em; color: var(--text-main); }
        .topbar-status {
          font-size: 0.58rem; letter-spacing: 0.16em;
          color: var(--accent);
          background: rgba(253, 224, 71, 0.08);
          border: 1px solid rgba(253, 224, 71, 0.25);
          padding: 0.2rem 0.5rem; border-radius: var(--radius-sm);
        }

        /* ================= BODY (physics layer) ================= */
        .card-body { transform: translateZ(25px); }
        .card-index {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          color: var(--accent);
          margin-bottom: 1.5rem;
          display: block;
          letter-spacing: 0.08em;
        }
        .card-heading {
          font-family: var(--font-sans);
          font-size: 1.45rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 1rem;
          letter-spacing: -0.01em;
          line-height: 1.2;
        }
        .card-heading span {
          font-family: var(--font-mono);
          font-size: 0.82rem;
          color: var(--accent);
          display: block;
          margin-bottom: 0.35rem;
          font-weight: 400;
          letter-spacing: 0.02em;
        }
        .card-text {
          color: var(--text-muted);
          font-size: 0.9rem;
          line-height: 1.65;
          margin-bottom: 1.5rem;
        }

        /* ================= METRIC READOUTS ================= */
        .metric-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
          margin-bottom: 1.35rem;
          transform: translateZ(35px);
        }
        .metric {
          background: var(--bg-pure);
          border: 1px solid var(--border-glow);
          border-radius: var(--radius-sm);
          padding: 0.6rem 0.65rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .metric-label {
          font-family: var(--font-mono);
          font-size: 0.55rem;
          letter-spacing: 0.12em;
          color: var(--text-muted);
        }
        .metric-value {
          font-family: var(--font-mono);
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-main);
          line-height: 1;
        }
        .metric-value small { font-size: 0.6rem; color: var(--text-muted); font-weight: 400; margin-left: 1px; }
        .metric-warn { color: var(--warning); }
        .metric-bar {
          height: 3px;
          background: rgba(226, 232, 240, 0.08);
          border-radius: 2px;
          overflow: hidden;
        }
        .metric-bar i { display: block; height: 100%; background: var(--accent); border-radius: 2px; }
        .metric-bar i.warn { background: var(--warning); }

        /* ================= ACTIVITY GRAPH ================= */
        .activity-graph {
          background: var(--bg-pure);
          border: 1px solid var(--border-glow);
          border-radius: var(--radius-sm);
          padding: 0.7rem 0.75rem 0.6rem;
          transform: translateZ(30px);
        }
        .graph-header {
          display: flex;
          justify-content: space-between;
          font-family: var(--font-mono);
          font-size: 0.55rem;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          margin-bottom: 0.55rem;
        }
        .graph-live { color: var(--accent); }
        .graph-bars {
          display: flex;
          align-items: flex-end;
          gap: 3px;
          height: 44px;
        }
        .graph-bars i {
          flex: 1;
          background: linear-gradient(to top, rgba(253, 224, 71, 0.25), var(--accent));
          border-radius: 1px;
          opacity: 0.7;
          transition: opacity 0.3s;
        }
        .interactive-card:hover .graph-bars i { opacity: 1; }
        .graph-bars i:last-child { background: var(--warning); }

        /* ================= FOOTER (physics layer) ================= */
        .card-footer {
          margin-top: 1.35rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-glow);
          transform: translateZ(15px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .footer-nodes { display: flex; align-items: center; gap: 5px; }
        .node-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: rgba(226, 232, 240, 0.15);
        }
        .node-dot.on { background: var(--accent); box-shadow: 0 0 6px rgba(253, 224, 71, 0.6); }
        .node-dot.warn { background: var(--warning); box-shadow: 0 0 6px rgba(249, 115, 22, 0.6); }
        .node-cluster {
          font-family: var(--font-mono);
          font-size: 0.55rem;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          margin-left: 0.5rem;
        }
        .sys-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-family: var(--font-mono);
          font-size: 0.6rem;
          text-transform: uppercase;
          background: rgba(253, 224, 71, 0.06);
          border: 1px solid rgba(253, 224, 71, 0.25);
          padding: 0.4rem 0.7rem;
          border-radius: var(--radius-sm);
          color: var(--accent);
          letter-spacing: 0.08em;
          white-space: nowrap;
        }
        .badge-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 6px var(--accent);
        }"""

# Need to replace from:
#        /* Interactive 3D Structural Cards with Fluid Recovery Physic Loops */
#        .interactive-card { background: var(--bg-card); border: 1px solid var(--border-glow); border-radius: var(--radius-md); padding: 3rem; min-height: 400px; display: flex; flex-direction: column; justify-content: space-between; transform-style: preserve-3d; transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s, background-color 0.3s, box-shadow 0.3s; position: relative; overflow: hidden; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
# ... down to
#        .sys-badge { font-family: var(--font-mono); font-size: 0.62rem; text-transform: uppercase; background: rgba(17, 24, 39, 0.5); border: 1px solid var(--border-glow); padding: 0.4rem 0.75rem; border-radius: var(--radius-sm); color: var(--text-main); letter-spacing: 0.05em; }

old_css_regex = r"/\* Interactive 3D Structural Cards with Fluid Recovery Physic Loops \*/[\s\S]*?\.sys-badge \{[^}]+\}"
match = re.search(old_css_regex, content)
if match:
    new_content = content[:match.start()] + new_css + content[match.end():]
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Replaced CSS successfully")
else:
    print("Could not find old CSS block")
