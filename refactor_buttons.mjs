import fs from 'fs/promises';
import path from 'path';

async function processDirectory(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    
    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile() && fullPath.endsWith('.vue')) {
      let content = await fs.readFile(fullPath, 'utf8');
      
      // We want to replace "bg-primary" with "btn-primary" ONLY in <button> or <a> tags, or elements that look like buttons (e.g. ones with h-14, px-10).
      // A simple regex might be hard, but let's try replacing `bg-primary` with `btn-primary` if it's inside a button tag.
      // Since it's Vue template, we can just replace bg-primary with btn-primary if the line contains "<button" or "<a"
      // Even better, replace hover:bg-primary/90 with nothing (since btn-primary handles hover).
      
      let lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line.includes('bg-primary') && (line.includes('<button') || line.includes('<a') || lines[i-1]?.includes('<button') || lines[i-1]?.includes('<a') || lines[i-2]?.includes('<button') || lines[i-2]?.includes('<a'))) {
            // It's a button!
            lines[i] = line.replace(/bg-primary/g, 'btn-primary');
            lines[i] = lines[i].replace(/hover:primary\/[0-9]+/g, '');
            lines[i] = lines[i].replace(/hover:bg-primary\/[0-9]+/g, '');
        }
      }
      
      let newContent = lines.join('\n');
      
      if (content !== newContent) {
        await fs.writeFile(fullPath, newContent, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

const srcDir = path.join(process.cwd(), 'src');
processDirectory(srcDir).catch(console.error);
