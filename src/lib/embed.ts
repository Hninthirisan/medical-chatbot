// src/lib/embed.ts
import { pipeline, Pipeline } from '@xenova/transformers';

import type { FeatureExtractionPipeline } from '@xenova/transformers';

let p: Promise<FeatureExtractionPipeline>;
export const getEmbedding = async (text: string) => {
  if (!p) {
    p = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      quantized: true,
    });
  }
  const extractor = await p;
  const out = await extractor(text, { pooling: 'mean', normalize: true });
  return Array.from(out.data as Float32Array);
};
