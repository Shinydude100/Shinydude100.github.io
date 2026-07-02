import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

css_replacement = """        /* PowerShell Terminal Emulator Styling */
        .sys-visualizer.terminal-mode { background: #0c0c0c; border: 1px solid #333333; border-radius: 8px; overflow: hidden; margin-bottom: 3.5rem; font-family: 'Consolas', 'JetBrains Mono', monospace; box-shadow: 0 15px 35px rgba(0,0,0,0.6); position: relative; }
        .terminal-header { background: #000000; color: #ffffff; height: 32px; font-size: 12px; font-weight: normal; font-family: 'Segoe UI', system-ui, sans-serif; display: flex; align-items: center; justify-content: space-between; user-select: none; }
        .terminal-header-title { display: flex; align-items: center; padding-left: 10px; gap: 8px; }
        .terminal-header-title svg { width: 14px; height: 14px; fill: currentColor; }

        .terminal-controls { display: flex; height: 100%; }
        .win-btn { width: 46px; height: 100%; display: flex; justify-content: center; align-items: center; cursor: default; transition: background-color 0.1s; }
        .win-btn:hover { background-color: #333333; }
        .win-btn.close:hover { background-color: #e81123; color: white; }
        .win-btn svg { width: 10px; height: 10px; stroke: currentColor; stroke-width: 1; fill: none; }

        .terminal-body { padding: 0; display: flex; flex-direction: column; max-height: 400px; overflow-y: auto; overflow-x: hidden; }
        .terminal-body::-webkit-scrollbar { width: 12px; background: #0c0c0c; }
        .terminal-body::-webkit-scrollbar-thumb { background: #4d4d4d; border: 3px solid #0c0c0c; border-radius: 6px; }
        .terminal-body::-webkit-scrollbar-thumb:hover { background: #7a7a7a; border-width: 2px; }

        .terminal-log { padding: 4px 8px; color: #cccccc; font-size: 14px; line-height: 1.2; min-height: 120px; }"""

pattern = r"\s*/\*\s*PowerShell Terminal Emulator Styling\s*\*/\s*\.sys-visualizer\.terminal-mode\s*{[^}]+}\s*\.terminal-header\s*{[^}]+}\s*\.terminal-header::before\s*{[^}]+}\s*\.terminal-body\s*{[^}]+}\s*\.terminal-log\s*{[^}]+}"
match = re.search(pattern, content, re.MULTILINE)

if match:
    content = content[:match.start()] + "\n" + css_replacement + content[match.end():]
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Replaced CSS successfully")
else:
    print("Could not find CSS to replace")
