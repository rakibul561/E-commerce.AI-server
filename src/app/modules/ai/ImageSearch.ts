/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/ai/imageSearch.service.ts

import axios, { AxiosInstance } from "axios";
import config from "../../config";
import { RelatedImage, ImageAnalysisResult } from "./ai.types";

class ImageSearchService {
  private pexelsClient: AxiosInstance;
  private unsplashClient: AxiosInstance;
  private pixabayClient: AxiosInstance;

  constructor() {
    this.pexelsClient = axios.create({
      baseURL: "https://api.pexels.com/v1",
      headers: {
        Authorization: config.aisearch.pexels_api_key
      }
    });

    this.unsplashClient = axios.create({
      baseURL: "https://api.unsplash.com",
      headers: {
        Authorization: `Client-ID ${config.aisearch.uniplash_api_key}`
      }
    });

    this.pixabayClient = axios.create({
      baseURL: "https://pixabay.com/api"
    });
  }

  async searchPexels(query: string, limit = 5): Promise<RelatedImage[]> {
    try {
      const res = await this.pexelsClient.get("/search", {
        params: { query, per_page: limit }
      });

      return res.data.photos.map((p: any) => ({
        id: `pexels-${p.id}`,
        url: p.src.large,
        thumbnail: p.src.medium,
        original: p.src.original,
        width: p.width,
        height: p.height,
        photographer: p.photographer,
        photographerUrl: p.photographer_url,
        source: "Pexels",
        license: "Free to use (Pexels License)",
        licenseUrl: "https://www.pexels.com/license/",
        downloadUrl: p.src.original,
        alt: p.alt || query
      }));
    } catch {
      return [];
    }
  }

  async searchUnsplash(query: string, limit = 5): Promise<RelatedImage[]> {
    try {
      const res = await this.unsplashClient.get("/search/photos", {
        params: { query, per_page: limit }
      });

      return res.data.results.map((p: any) => ({
        id: `unsplash-${p.id}`,
        url: p.urls.regular,
        thumbnail: p.urls.small,
        original: p.urls.full,
        width: p.width,
        height: p.height,
        photographer: p.user.name,
        photographerUrl: p.user.links.html,
        source: "Unsplash",
        license: "Free to use (Unsplash License)",
        licenseUrl: "https://unsplash.com/license",
        downloadUrl: p.links.download,
        alt: p.alt_description || query
      }));
    } catch {
      return [];
    }
  }

  async searchPixabay(query: string, limit = 5): Promise<RelatedImage[]> {
    try {
      const res = await this.pixabayClient.get("/", {
        params: {
          key: config.aisearch.pixabay_api_key,
          q: query,
          per_page: limit
        }
      });

      return res.data.hits.map((p: any) => ({
        id: `pixabay-${p.id}`,
        url: p.largeImageURL,
        thumbnail: p.previewURL,
        original: p.imageURL,
        width: p.imageWidth,
        height: p.imageHeight,
        photographer: p.user,
        photographerUrl: `https://pixabay.com/users/${p.user}-${p.user_id}/`,
        source: "Pixabay",
        license: "Free for commercial use",
        licenseUrl: "https://pixabay.com/service/license/",
        downloadUrl: p.largeImageURL,
        alt: p.tags || query
      }));
    } catch {
      return [];
    }
  }

  async smartSearch(
    analysis: ImageAnalysisResult,
    totalLimit = 10
  ): Promise<RelatedImage[]> {
    const queries = [
      analysis.productType,
      `${analysis.category} ${analysis.productType}`,
      `${analysis.productType} lifestyle`
    ].filter(Boolean);

    const limitPerQuery = Math.ceil(totalLimit / queries.length);

    const results = await Promise.allSettled(
      queries.map(q => this.searchPexels(q, limitPerQuery))
    );

    const images = results
      .filter(r => r.status === "fulfilled")
      .flatMap(r => (r as PromiseFulfilledResult<RelatedImage[]>).value);

    return images.slice(0, totalLimit);
  }
}

export default new ImageSearchService();
