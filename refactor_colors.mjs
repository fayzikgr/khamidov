import fs from 'fs/promises';
import path from 'path';

async function processDirectory(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    
    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile() && (fullPath.endsWith('.vue') || fullPath.endsWith('.js') || fullPath.endsWith('.svg'))) {
      const content = await fs.readFile(fullPath, 'utf8');
      
      // We want to replace instances of #008d80 in tailwind classes.
      // bg-[#008d80] -> bg-primary
      // text-[#008d80] -> text-primary
      // border-[#008d80] -> border-primary
      // ring-[#008d80] -> ring-primary
      // accent-[#008d80] -> accent-primary
      // focus:border-[#008d80] -> focus:border-primary
      // from-[#008d80] -> from-primary
      // fill="#008D80" -> fill="var(--color-primary, #008d80)"
      // stroke="#008D80" -> stroke="var(--color-primary, #008d80)"
      
      let newContent = content
        .replace(/bg-\[\#008d80\]/gi, 'bg-primary')
        .replace(/text-\[\#008d80\]/gi, 'text-primary')
        .replace(/border-\[\#008d80\]/gi, 'border-primary')
        .replace(/ring-\[\#008d80\]/gi, 'ring-primary')
        .replace(/accent-\[\#008d80\]/gi, 'accent-primary')
        .replace(/from-\[\#008d80\]/gi, 'from-primary')
        .replace(/fill="\#008D80"/gi, 'fill="var(--color-primary, #008d80)"')
        .replace(/stroke="\#008D80"/gi, 'stroke="var(--color-primary, #008d80)"')
        // ChatWidget.vue has some style blocks with raw hex
        .replace(/background: \#008d80;/gi, 'background: var(--color-primary);')
        .replace(/color: \#008d80;/gi, 'color: var(--color-primary);');

      // specific fixes for arbitrary colors with opacity like bg-[#008d80]/20 -> bg-primary/20
      // the above regexes might already handle this, let's check
      // bg-[#008d80]/20 would be matched by bg-\[\#008d80\] and replaced with bg-primary/20.
      
      // Wait, there are hover colors too: hover:bg-[#0aa093]
      // Let's replace the hover variant as well to use opacity or just leave it for now.
      // Or we can map #0aa093 to another variable or just use primary/90.
      newContent = newContent.replace(/bg-\[\#0aa093\]/gi, 'primary/90')
                             .replace(/bg-\[\#09695f\]/gi, 'primary/80');

      if (content !== newContent) {
        await fs.writeFile(fullPath, newContent, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

const srcDir = path.join(process.cwd(), 'src');
processDirectory(srcDir).catch(console.error);
