import re

with open('index.html', 'r') as f:
    content = f.read()

replacement = """<form action="mailto:hugo.luna.sec@gmail.com" method="post" enctype="text/plain" toolname="contactForm" tooldescription="Send a direct message or inquiry to Hugo Luna" toolautosubmit="false" class="interactive-card" style="text-align: left; padding: 2rem;">
                            <div style="margin-bottom: 1.5rem;">
                                <label for="name" style="display: block; font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">Sender Identity</label>
                                <input type="text" id="name" name="name" required toolparamtitle="Name" toolparamdescription="The user's name" style="width: 100%; padding: 0.75rem; background: var(--bg-pure); border: 1px solid var(--border-glow); color: var(--text-main); font-family: var(--font-body); border-radius: var(--radius-sm);" />
                            </div>
                            <div style="margin-bottom: 1.5rem;">
                                <label for="email" style="display: block; font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">Return Endpoint (Email)</label>
                                <input type="email" id="email" name="email" required toolparamtitle="Email" toolparamdescription="The user's email address" style="width: 100%; padding: 0.75rem; background: var(--bg-pure); border: 1px solid var(--border-glow); color: var(--text-main); font-family: var(--font-body); border-radius: var(--radius-sm);" />
                            </div>
                            <div style="margin-bottom: 2rem;">
                                <label for="message" style="display: block; font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">Payload (Message)</label>
                                <textarea id="message" name="message" required rows="4" toolparamtitle="Message" toolparamdescription="The message payload to send" style="width: 100%; padding: 0.75rem; background: var(--bg-pure); border: 1px solid var(--border-glow); color: var(--text-main); font-family: var(--font-body); border-radius: var(--radius-sm); resize: vertical;"></textarea>
                            </div>
                            <div class="btn-stack" style="justify-content: flex-start;">
                                <button type="submit" class="btn-primitive primary" aria-label="Transmit Secure Requisition" title="Transmit Secure Requisition" style="border: none; cursor: pointer;">transmit_payload</button>
                            </div>
                        </form>

                        <div class="btn-stack" style="justify-content: center; margin-top: 2rem;">"""

target = """<div class="btn-stack" style="justify-content: center;">
                            <a href="mailto:hugo.luna.sec@gmail.com" class="btn-primitive primary" aria-label="Email hugo.luna.sec@gmail.com" title="Email hugo.luna.sec@gmail.com">hugo.luna.sec@gmail.com</a>"""

if target in content:
    new_content = content.replace(target, replacement)
    with open('index.html', 'w') as f:
        f.write(new_content)
    print("Success")
else:
    print("Target not found")
