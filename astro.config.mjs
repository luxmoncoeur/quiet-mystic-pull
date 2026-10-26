// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import { unified } from '@astrojs/markdown-remark';

// Markdown links to other sites open in a new tab.
function rehypeExternalLinks() {
  /** @param {any} node */
  const visit = (node) => {
    if (node.tagName === 'a' && /^https?:\/\//.test(node.properties?.href ?? '')) {
      node.properties.target = '_blank';
      node.properties.rel = ['noopener', 'noreferrer'];
    }
    node.children?.forEach(visit);
  };
  return visit;
}

// https://astro.build/config
export default defineConfig({
  markdown: {
    processor: unified({ rehypePlugins: [rehypeExternalLinks] }),
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
