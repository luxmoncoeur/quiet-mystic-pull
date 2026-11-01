// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
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
  // React only for the small interactive pieces in src/components/bits (React Bits).
  integrations: [react()],
  // Let ngrok tunnels reach the local server (dev and preview).
  server: {
    allowedHosts: ['.ngrok-free.app', '.ngrok-free.dev', '.ngrok.app', '.ngrok.dev'],
  },
  markdown: {
    processor: unified({ rehypePlugins: [rehypeExternalLinks] }),
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
