const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(process.cwd()).filter(f => f.startsWith('Heap.') && f.endsWith('.heapprofile'));
if (files.length === 0) {
  console.error('No heapprofile files found in cwd');
  process.exit(1);
}

// pick the latest by mtime
files.sort((a, b) => fs.statSync(path.join(process.cwd(), a)).mtimeMs - fs.statSync(path.join(process.cwd(), b)).mtimeMs);
const latest = files[files.length - 1];
const content = fs.readFileSync(latest, 'utf8');
let json;
try {
  json = JSON.parse(content);
} catch (e) {
  console.error('Failed to parse heapprofile JSON:', e.message);
  process.exit(1);
}

const nodes = new Map();
if (json.head && json.head.children) {
  // flatten samples to find nodes
  const samples = json.samples || [];
  const nodeMap = new Map();
  (json.head.children || []).forEach(function walk(n) {
    if (n.id) nodeMap.set(n.id, n);
    if (n.children) n.children.forEach(walk);
  });

  const byNode = new Map();
  (json.samples || []).forEach(s => {
    const size = s.size || 0;
    const nid = s.nodeId;
    const prev = byNode.get(nid) || 0;
    byNode.set(nid, prev + size);
  });

  const sorted = Array.from(byNode.entries()).sort((a,b) => b[1]-a[1]).slice(0,20);
  console.log('Heap profile:', latest);
  sorted.forEach(([nid, total], i) => {
    const node = nodeMap.get(nid);
    const fn = node && node.callFrame && (node.callFrame.functionName || node.callFrame.url) || '??';
    console.log(`${i+1}. ${fn} (node ${nid}) - ${Math.round(total/1024)} KB`);
  });
} else {
  console.error('Unexpected heapprofile structure');
}
