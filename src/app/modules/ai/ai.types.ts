// src/modules/ai/ai.types.ts

export interface ImageAnalysisResult {
  productType: string;
  category: string;
  colors: string[];
  features: string[];
  suggestedKeywords: string[];
}

export interface ProductContent {
  title: string;
  description: string;
  shortDescription?: string;
  category: string;
  tags: string[];
  keywords: string[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
}

export interface RelatedImage {
  id: string;
  url: string;
  thumbnail: string;
  original: string;
  width: number;
  height: number;
  photographer: string;
  photographerUrl: string;
  source: 'Pexels' | 'Unsplash' | 'Pixabay';
  license: string;
  licenseUrl: string;
  downloadUrl: string;
  alt: string;
}

export interface RelatedVideo {
  id: string;
  videoId: string | number;
  platform: 'YouTube' | 'Pexels';
  url: string;
  embedUrl: string | null;
  thumbnail: string;
  thumbnailMedium: string;
  title: string;
  description: string;
  channel: string;
  channelId?: string;
  channelUrl?: string;
  publishedAt?: string;
  duration?: number | string;
  width?: number;
  height?: number;
  canDownload: boolean;
  downloadUrl?: string | null;
  videoFiles?: VideoFile[];
}

export interface VideoFile {
  quality: string;
  width: number;
  height: number;
  link: string;
  fileType: string;
}

export interface AIGenerationOptions {
  userTitle?: string;
  userStyle?: string;
  includeImages?: boolean;
  includeVideos?: boolean;
  imageLimit?: number;
  videoLimit?: number;
}

export interface CompleteProductData {
  content: ProductContent;
  images: RelatedImage[];
  videos: RelatedVideo[];
  analysis: ImageAnalysisResult;
}