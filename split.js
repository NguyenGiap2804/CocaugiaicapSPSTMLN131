const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'index.html');
const lines = fs.readFileSync(filepath, 'utf8').split('\n');

const css_lines = [];
const js_lines = [];
const html_lines = [];

let in_css = false;
let in_js = false;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes('<style>') && i < 20) {
        in_css = true;
        html_lines.push('  <link rel="stylesheet" href="css/style.css">');
        continue;
    }
    
    if (in_css && line.includes('</style>') && i > 900) {
        in_css = false;
        continue;
    }
    
    if (in_css) {
        css_lines.push(line);
        continue;
    }

    if (line.includes('<script>') && i > 1200 && i < 1250) {
        in_js = true;
        html_lines.push('  <!-- GSAP for animations -->');
        html_lines.push('  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>');
        html_lines.push('  <!-- Custom logic -->');
        html_lines.push('  <script src="js/main.js"></script>');
        continue;
    }
        
    if (in_js && line.includes('</script>') && i > 2000) {
        in_js = false;
        continue;
    }

    if (in_js) {
        js_lines.push(line);
        continue;
    }

    html_lines.push(line);
}

fs.mkdirSync(path.join(__dirname, 'css'), { recursive: true });
fs.mkdirSync(path.join(__dirname, 'js'), { recursive: true });

fs.writeFileSync(path.join(__dirname, 'css', 'style.css'), css_lines.join('\n'), 'utf8');
fs.writeFileSync(path.join(__dirname, 'js', 'main.js'), js_lines.join('\n'), 'utf8');
fs.writeFileSync(filepath, html_lines.join('\n'), 'utf8');

console.log("Split completed successfully.");
