import { Injectable } from '@nestjs/common';
import { RedisService } from '../common/redis/redis.service';
import { UrlsService } from '../urls/urls.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly redisService: RedisService,
    private readonly urlsService: UrlsService,
  ) {}

  async getDashboard(userId: string): Promise<any> {
    const urls = await this.urlsService.findByUserId(userId, 1000);
    
    const totalUrls = urls.length;
    const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);
    
    // Top URLs by clicks
    const topUrls = urls
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10)
      .map(url => ({
        id: url.id,
        shortCode: url.shortCode,
        originalUrl: url.originalUrl,
        title: url.title,
        clicks: url.clicks,
        createdAt: url.createdAt,
      }));

    // Recent URLs
    const recentUrls = urls
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(url => ({
        id: url.id,
        shortCode: url.shortCode,
        originalUrl: url.originalUrl,
        title: url.title,
        clicks: url.clicks,
        createdAt: url.createdAt,
      }));

    // Clicks over time
    const clicksOverTime = await this.getClicksOverTime(urls);

    return {
      summary: {
        totalUrls,
        totalClicks,
        averageClicksPerUrl: totalUrls > 0 ? Math.round(totalClicks / totalUrls) : 0,
      },
      topUrls,
      recentUrls,
      clicksOverTime,
    };
  }

  private async getClicksOverTime(urls: any[]): Promise<any[]> {
    const last30Days = [];
    const clicksByDate = new Map<string, number>();

    // Initialize map with last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const dateStr = date.toISOString().split('T')[0];
      clicksByDate.set(dateStr, 0);
    }

    // Get clicks for each URL and date
    for (const url of urls) {
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        const dateStr = date.toISOString().split('T')[0];
        const visitKey = `url:${url.id}:visits:${dateStr}`;
        
        try {
          const count = await this.redisService.get(visitKey);
          const currentClicks = clicksByDate.get(dateStr) || 0;

          clicksByDate.set(dateStr, currentClicks + parseInt(count || '0'));
        } catch (error) {
          // Just continue if key doesnt exist
        }
      }
    }

    // Convert map to array and sort by date
    for (const [date, clicks] of clicksByDate.entries()) {
      last30Days.push({ date, clicks });
    }

    return last30Days.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
} 