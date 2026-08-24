// src/content.config.ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

export const collections = {
    docs: defineCollection({
    loader: glob({ pattern: '**/[^_]*.md', base: './src/data/content' }),
    }),
};