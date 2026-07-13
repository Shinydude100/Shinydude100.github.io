import re

with open(".Jules/palette.md", "r") as f:
    content = f.read()

content = re.sub(r'<<<<<<< Updated upstream.*?=======', '', content, flags=re.DOTALL)
content = re.sub(r'>>>>>>> Stashed changes\n?', '', content)

with open(".Jules/palette.md", "w") as f:
    f.write(content)
