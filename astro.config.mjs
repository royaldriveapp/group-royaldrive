import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import netlify from '@astrojs/netlify';

export default defineConfig({
  output: 'server',
  adapter: netlify({
    devFeatures: false
  }),
  integrations: [react(), keystatic()],
});
