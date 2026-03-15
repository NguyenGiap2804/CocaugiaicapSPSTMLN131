import os

filepath = r"d:\FULearning\Spring Semester 2026 (8)\MLN131\index.html"
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

css_lines = []
js_lines = []
html_lines = []

in_css = False
in_js = False

for i, line in enumerate(lines):
    if "<style>" in line and i < 20: # Line 11 is <style>
        in_css = True
        html_lines.append('  <link rel="stylesheet" href="css/style.css">\n')
        continue
    
    # End of main style block
    if in_css and "</style>" in line and i > 900:
        in_css = False
        continue
    
    if in_css:
        css_lines.append(line)
        continue

    # Main script block starts at 1231
    if "<script>" in line and i > 1200 and i < 1250:
        in_js = True
        html_lines.append('  <!-- GSAP for animations -->\n  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>\n  <!-- Custom logic -->\n  <script src="js/main.js"></script>\n')
        continue
        
    if in_js and "</script>" in line and i > 2000:
        in_js = False
        continue

    if in_js:
        js_lines.append(line)
        continue

    html_lines.append(line)

os.makedirs(r"d:\FULearning\Spring Semester 2026 (8)\MLN131\css", exist_ok=True)
os.makedirs(r"d:\FULearning\Spring Semester 2026 (8)\MLN131\js", exist_ok=True)

with open(r"d:\FULearning\Spring Semester 2026 (8)\MLN131\css\style.css", 'w', encoding='utf-8') as f:
    f.writelines(css_lines)

with open(r"d:\FULearning\Spring Semester 2026 (8)\MLN131\js\main.js", 'w', encoding='utf-8') as f:
    f.writelines(js_lines)

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(html_lines)

print("Split completed successfully.")
