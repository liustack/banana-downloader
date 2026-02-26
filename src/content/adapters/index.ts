import type { SiteAdapter } from './types';
import { createGeminiAdapter } from './gemini';
import { createNotebookLmAdapter } from './notebooklm';

const ADAPTERS_BY_HOST: Record<string, SiteAdapter> = {
    'gemini.google.com': createGeminiAdapter(),
    'notebooklm.google.com': createNotebookLmAdapter(),
};

export function getAdapterForLocation(location: Location): SiteAdapter | null {
    return ADAPTERS_BY_HOST[location.hostname] ?? null;
}
