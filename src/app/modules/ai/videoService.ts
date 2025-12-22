/* eslint-disable @typescript-eslint/no-explicit-any */

import axios, { AxiosInstance } from "axios";
import config from "../../config";
import { RelatedVideo, ImageAnalysisResult } from "./ai.types";

class VideoSearchService {
  private youtubeClient: AxiosInstance;
  private pexelsClient: AxiosInstance;

  constructor() {
    this.youtubeClient = axios.create({
      baseURL: "https://www.googleapis.com/youtube/v3"
    });

    this.pexelsClient = axios.create({
      baseURL: "https://api.pexels.com/videos",
      headers: {
        Authorization: config.aisearch.pexels_api_key
      }
    });
  }

  /* ===============================
     YOUTUBE SEARCH
  =============================== */
  async searchYouTube(query: string, limit = 3): Promise<RelatedVideo[]> {
    try {
      const res = await this.youtubeClient.get("/search", {
        params: {
          part: "snippet",
          q: query,
          type: "video",
          maxResults: limit,
          key: config.aisearch.youtube_api_key
        }
      });

      console.log(
        "✅ YOUTUBE RESPONSE:",
        JSON.stringify(res.data, null, 2)
      );

      if (!res.data?.items?.length) {
        console.warn("⚠️ YouTube returned empty results");
        return [];
      }

      return res.data.items.map((v: any) => ({
        id: `youtube-${v.id.videoId}`,
        videoId: v.id.videoId,
        platform: "YouTube",
        url: `https://www.youtube.com/watch?v=${v.id.videoId}`,
        embedUrl: `https://www.youtube.com/embed/${v.id.videoId}`,
        thumbnail: v.snippet.thumbnails?.high?.url,
        title: v.snippet.title,
        description: v.snippet.description,
        channel: v.snippet.channelTitle,
        publishedAt: v.snippet.publishedAt,
        canDownload: false
      }));
    } catch (error: any) {
      console.error(
        "❌ YOUTUBE API ERROR:",
        error.response?.data || error.message
      );
      return [];
    }
  }

  /* ===============================
     PEXELS VIDEO SEARCH
  =============================== */
  async searchPexels(query: string, limit = 3): Promise<RelatedVideo[]> {
    try {
      const res = await this.pexelsClient.get("/search", {
        params: {
          query,
          per_page: limit
        }
      });

      return res.data.videos.map((v: any) => {
        const best =
          v.video_files.find((f: any) => f.quality === "hd") ||
          v.video_files[0];

        return {
          id: `pexels-${v.id}`,
          videoId: v.id,
          platform: "Pexels",
          url: v.url,
          thumbnail: v.image,
          title: `${query} video`,
          channel: v.user.name,
          duration: v.duration,
          width: v.width,
          height: v.height,
          canDownload: true,
          downloadUrl: best?.link || null
        };
      });
    } catch (error: any) {
      console.error(
        "❌ PEXELS VIDEO ERROR:",
        error.response?.data || error.message
      );
      return [];
    }
  }

  /* ===============================
     SMART SEARCH (YT → PEXELS)
  =============================== */
  async smartSearchByQuery(
    query: string,
    totalLimit = 6
  ): Promise<RelatedVideo[]> {
    const ytVideos = await this.searchYouTube(query, totalLimit);

    if (ytVideos.length > 0) {
      return ytVideos;
    }

    console.warn("⚠️ Falling back to Pexels videos");
    return this.searchPexels(query, totalLimit);
  }

  /* ===============================
     AI BASED SMART SEARCH
  =============================== */
  async smartSearch(
    analysis: ImageAnalysisResult,
    totalLimit = 6
  ): Promise<RelatedVideo[]> {
    const queries = [
      `${analysis.productType} review`,
      `${analysis.productType} unboxing`
    ];

    const results = await Promise.allSettled(
      queries.map(q => this.searchYouTube(q, Math.ceil(totalLimit / 2)))
    );

    const videos = results
      .filter(r => r.status === "fulfilled")
      .flatMap(r => (r as PromiseFulfilledResult<RelatedVideo[]>).value);

    return videos.slice(0, totalLimit);
  }
}

export default new VideoSearchService();
