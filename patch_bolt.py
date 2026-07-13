import re

with open(".jules/bolt.md", "r") as f:
    content = f.read()

content = re.sub(r'<<<<<<< Updated upstream.*?=======\n', '', content, flags=re.DOTALL)
content = re.sub(r'>>>>>>> Stashed changes\n?', '', content)

with open(".jules/bolt.md", "w") as f:
    f.write(content)
