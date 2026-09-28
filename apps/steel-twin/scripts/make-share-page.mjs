// Turns dist-share/index.html (single file) into a body-only page for the shareable Artifact link.
import { readFileSync, writeFileSync } from 'node:fs';
const html = readFileSync('dist-share/index.html', 'utf8');
const head = html.slice(html.indexOf('<head>') + 6, html.indexOf('</head>'));
const body = html.slice(html.indexOf('<body>') + 6, html.lastIndexOf('</body>'));
const meta = head.replace(/<meta[^>]*>\s*/g, '');
writeFileSync('dist-share/steel-learning-twin.html', meta.trim() + '\n' + body.trim() + '\n');
console.log('dist-share/steel-learning-twin.html');
