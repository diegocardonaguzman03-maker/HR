// Turns dist-share/index.html (single file) into a body-only page for the shareable Artifact link.
import { readFileSync, writeFileSync } from 'node:fs';
const html = readFileSync('dist-share/index.html', 'utf8');
// Only the document tags and the two leading <meta> tags are removed. The bundle itself must stay
// untouched: three.js shaders contain strings such as `#include <metalnessmap_fragment>`.
const start = html.indexOf('<title>');
const end = html.lastIndexOf('</body>');
const headEnd = html.lastIndexOf('</head>');
const bodyStart = html.indexOf('<body>', headEnd);
const page = html.slice(start, headEnd) + html.slice(bodyStart + '<body>'.length, end);
writeFileSync('dist-share/steel-learning-twin.html', page.trim() + '\n');
console.log('dist-share/steel-learning-twin.html');
