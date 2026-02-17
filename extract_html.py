
import re

with open('src/index.js', 'r') as f:
    content = f.read()

start_index = content.find('`')
end_index = content.rfind('`')

if start_index != -1 and end_index != -1 and start_index < end_index:
    html_content = content[start_index+1:end_index]
    html_content = html_content.replace('\\`', '`')
    html_content = html_content.replace('\\${', '${')

    with open('src/temp_index.html', 'w') as f:
        f.write(html_content)
    print("HTML extracted to src/temp_index.html")
else:
    print("Could not find html content")
