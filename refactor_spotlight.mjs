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
      
      if (content.includes('btn-primary')) {
          // Replace opening button tags that have btn-primary
          // This regex finds <button [anything] btn-primary [anything] >
          let hasModifications = false;
          
          const regex = /<button([^>]*?)btn-primary([^>]*?)>([\s\S]*?)<\/button>/g;
          content = content.replace(regex, (match, p1, p2, p3) => {
              hasModifications = true;
              // Remove btn-primary since it's applied inside SpotlightButton? 
              // Wait, no, we can keep btn-primary class on the SpotlightButton or remove it.
              // SpotlightButton inherently has the styling, but passing class="btn-primary" just adds it to the root button. It's fine.
              // Actually, wait, SpotlightButton.vue has `class="spotlight-btn"` and doesn't inherit external classes automatically unless we pass them, but Vue does pass `$attrs.class` to the root element.
              // Let's strip `btn-primary` and `btn-primary-glow` from the usage to avoid duplicate padding/background.
              let newP1 = p1.replace(/btn-primary-glow/g, '').replace(/btn-primary/g, '');
              let newP2 = p2.replace(/btn-primary-glow/g, '').replace(/btn-primary/g, '');
              return `<SpotlightButton${newP1}${newP2}>${p3}</SpotlightButton>`;
          });

          // If we modified, we need to import SpotlightButton in the <script setup>
          if (hasModifications) {
              if (content.includes('<script setup>')) {
                  if (!content.includes('SpotlightButton')) {
                      content = content.replace('<script setup>', `<script setup>\nimport SpotlightButton from '@/components/SpotlightButton.vue';`);
                  }
              }
          }
      }

      if (content !== originalContent) {
          // Fix import path to be relative or alias. vite config might not have @ alias by default.
          // Let's use relative path. It's in src/components.
          const depth = fullPath.split('/').length - srcDir.split('/').length;
          let importPath = '';
          if (depth === 1) importPath = './components/SpotlightButton.vue';
          else if (depth === 2) importPath = '../components/SpotlightButton.vue';
          else importPath = '../../components/SpotlightButton.vue';
          
          content = content.replace(/@\/components\/SpotlightButton\.vue/g, importPath);

          await fs.writeFile(fullPath, content, 'utf8');
          console.log(`Updated ${fullPath}`);
      }
    }
  }
}

const srcDir = path.join(process.cwd(), 'src');
processDirectory(srcDir).catch(console.error);
