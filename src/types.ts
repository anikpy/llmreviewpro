export interface TextBlock {
  text: string;
  level?: 2 | 3 | 0; // H2, H3, or Paragraph (0)
}

export interface TableBlock {
  headers: string[];
  rows: string[][];
}

export interface ImageBlock {
  url: string;
  alt: string;
  caption: string;
}

export type BlockType = 'text' | 'table' | 'image';

export interface EditorBlock {
  id: string;
  type: BlockType;
  value: TextBlock | TableBlock | ImageBlock;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: EditorBlock[];
  meta_description: string;
  status: 'draft' | 'published';
  published_at: string;
}

export interface LLMModel {
  id: string;
  name: string;
  developer: string;
  input_cost_1m: number;  // Cost per 1M tokens in USD
  output_cost_1m: number; // Cost per 1M tokens in USD
  mmlu_score: number;     // Percentage (e.g., 88.5)
}

export interface AnalyticsLog {
  id: string;
  post_id: string | null;
  session_hash: string;
  event_type: 'page_view' | 'scroll_depth';
  timestamp: string;
}

export interface AdSenseConfig {
  publisherId: string; // e.g. "pub-1234567890123456"
  enabled: boolean;
}
