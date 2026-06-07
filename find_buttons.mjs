import fs from 'fs/promises';
import path from 'path';

async function processDirectory(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    
    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile() && fullPath.endsWith('.vue') && !fullPath.includes('SpotlightButton.vue')) {
      let content = await fs.readFile(fullPath, 'utf8');
      let originalContent = content;
      
      // Step 1: Replace <button ... class="... btn-primary ..."> with <SpotlightButton ... class="...">
      // We will only do this for elements containing 'btn-primary'
      if (content.includes('btn-primary')) {
          // It's tricky to parse HTML with regex, but since the syntax is relatively standard in this project:
          // We will find any button tag that contains btn-primary and change it to SpotlightButton.
          // Note: Some are <button>, some might just be <a> wrapping a button. If it's a <button>, change tag to SpotlightButton.
          
          content = content.replace(/<button([^>]*?)btn-primary([^>]*?)>/g, '<SpotlightButton$1$2>');
          content = content.replace(/<\/button>/g, (match, offset, str) => {
              // If the original string had a SpotlightButton opening before this, it should probably be closed.
              // A simple way is to just replace all </button> with </SpotlightButton> IF we replaced an opening tag?
              // Let's be safer. We replaced `<button ... btn-primary`. We need to replace `</button>`.
              // We'll just replace `<button` with `<SpotlightButton` and `</button>` with `</SpotlightButton>` for files containing `btn-primary`.
              return '</SpotlightButton>';
          });
          // Fix up non-btn-primary buttons that might have been caught by the greedy closing tag replacement:
          // Wait, if a file has BOTH btn-primary and other buttons, the other buttons closing tags will be changed to </SpotlightButton>.
          // Actually, let's just use regex to match the whole button block or just be careful.
          // Since this is a simple Vue project, let's just do a specific manual replacement.
      }

      if (content !== originalContent) {
          console.log(`Needs manual update: ${fullPath}`);
      }
    }
  }
}

const srcDir = path.join(process.cwd(), 'src');
processDirectory(srcDir).catch(console.error);
