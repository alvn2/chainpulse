const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('route.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const routes = walk('./app/api');
let modified = 0;

routes.forEach(route => {
  let content = fs.readFileSync(route, 'utf8');
  if (!content.includes("export const dynamic = 'force-dynamic';")) {
    content = "export const dynamic = 'force-dynamic';\n" + content;
    fs.writeFileSync(route, content, 'utf8');
    modified++;
    console.log("Updated: " + route);
  }
});

console.log(`Modified ${modified} route(s) successfully.`);
