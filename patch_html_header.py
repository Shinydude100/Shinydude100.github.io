import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

new_header = """<div class="terminal-header">
                                <div class="terminal-header-title">
                                    <svg viewBox="0 0 16 16"><path d="M0 2h16v12H0zM1 3v10h14V3zM2 4h12v8H2zM4 6l3 2-3 2v-1l2-1-2-1z M8 9h3v1H8z"/></svg>
                                    <span>Administrator: System Rescue Launcher</span>
                                </div>
                                <div class="terminal-controls">
                                    <div class="win-btn minimize"><svg viewBox="0 0 10 10"><path d="M1 5h8"/></svg></div>
                                    <div class="win-btn maximize"><svg viewBox="0 0 10 10"><rect x="1.5" y="1.5" width="7" height="7"/></svg></div>
                                    <div class="win-btn close"><svg viewBox="0 0 10 10"><path d="M1 1l8 8m0-8L1 9"/></svg></div>
                                </div>
                            </div>"""

pattern = r'<div class="terminal-header">\s*<span>Administrator: System Rescue Launcher</span>\s*</div>'
match = re.search(pattern, content, re.MULTILINE)

if match:
    content = content[:match.start()] + new_header + content[match.end():]
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Replaced HTML successfully")
else:
    print("Could not find HTML to replace")
