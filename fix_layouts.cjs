const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'src/app/layout');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove Inicio links
  content = content.replace(/<Link to="\/"[^>]*>\s*In[ií]cio\s*<\/Link>\s*/g, '');
  
  // Update Compras to point to /
  content = content.replace(/to="\/shopping"/g, 'to="/"');
  
  fs.writeFileSync(filePath, content, 'utf8');
}
console.log("Updated layouts");
