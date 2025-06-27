import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { RedisService } from '../common/redis/redis.service';
import { Url } from './entities/url.entity';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { nanoid } from 'nanoid';

@Injectable()
export class UrlsService {
  constructor(private readonly redisService: RedisService) {}

  async create(createUrlDto: CreateUrlDto, userId?: string): Promise<Url> {
    const { originalUrl, customCode, title, description } = createUrlDto;

    // Generate or use custom short code
    let shortCode = customCode;
    if (!shortCode) {
      shortCode = nanoid(7);
    } else {
      // Check if custom code already exists
      const existingUrl = await this.findByShortCode(shortCode);
      if (existingUrl) {
        throw new ConflictException('Custom code already exists');
      }
    }

    // Create URL object
    const urlId = nanoid();
    const url: Url = {
      id: urlId,
      originalUrl,
      shortCode,
      userId,
      title,
      description,
      clicks: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.redisService.hSet(`url:${urlId}`, 'data', JSON.stringify(url));
    await this.redisService.hSet(`url:code:${shortCode}`, 'urlId', urlId);
    
    // Add to user's URLs if authenticated
    if (userId) {
      await this.redisService.hSet(`user:${userId}:urls`, urlId, shortCode);
    }

    return url;
  }

  async findByShortCode(shortCode: string): Promise<Url | null> {
    const urlId = await this.redisService.hGet(`url:code:${shortCode}`, 'urlId');
    if (!urlId) {
      return null;
    }

    const urlData = await this.redisService.hGet(`url:${urlId}`, 'data');
    if (!urlData) {
      return null;
    }

    return JSON.parse(urlData);
  }

  async findById(id: string): Promise<Url | null> {
    const urlData = await this.redisService.hGet(`url:${id}`, 'data');
    if (!urlData) {
      return null;
    }

    return JSON.parse(urlData);
  }

  async findByUserId(userId: string, limit: number = 50, offset: number = 0): Promise<Url[]> {
    const userUrls = await this.redisService.hGetAll(`user:${userId}:urls`);
    const urlIds = Object.keys(userUrls).slice(offset, offset + limit);
    
    const urls: Url[] = [];
    for (const urlId of urlIds) {
      const url = await this.findById(urlId);
      if (url) {
        urls.push(url);
      }
    }

    return urls.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async redirect(shortCode: string): Promise<string> {
    const url = await this.findByShortCode(shortCode);
    if (!url) {
      throw new NotFoundException('URL not found');
    }

    // Increment click count
    await this.incrementClicks(url.id);

    // Track analytics
    await this.trackVisit(url.id);

    return url.originalUrl;
  }

  async update(id: string, updateUrlDto: UpdateUrlDto, userId?: string): Promise<Url> {
    const url = await this.findById(id);
    if (!url) {
      throw new NotFoundException('URL not found');
    }

    // Check ownership if user is authenticated
    if (userId && url.userId !== userId) {
      throw new BadRequestException('Not authorized to update this URL');
    }

    const { customCode, title, description } = updateUrlDto;

    if (customCode && customCode !== url.shortCode) {
      // Check if new custom code already exists
      const existingUrl = await this.findByShortCode(customCode);
      if (existingUrl) {
        throw new ConflictException('Custom code already exists');
      }

      // Update short code mappings
      await this.redisService.del(`url:code:${url.shortCode}`);
      await this.redisService.hSet(`url:code:${customCode}`, 'urlId', id);
      
      // Update user's URLs mapping
      if (url.userId) {
        await this.redisService.hSet(`user:${url.userId}:urls`, id, customCode);
      }
    }

    const updatedUrl: Url = {
      ...url,
      shortCode: customCode || url.shortCode,
      title: title !== undefined ? title : url.title,
      description: description !== undefined ? description : url.description,
      updatedAt: new Date(),
    };

    await this.redisService.hSet(`url:${id}`, 'data', JSON.stringify(updatedUrl));

    return updatedUrl;
  }

  async delete(id: string, userId?: string): Promise<void> {
    const url = await this.findById(id);
    if (!url) {
      throw new NotFoundException('URL not found');
    }

    // Check ownership if user is authenticated
    if (userId && url.userId !== userId) {
      throw new BadRequestException('Not authorized to delete this URL');
    }

    // Remove from Redis
    await this.redisService.del(`url:${id}`);
    await this.redisService.del(`url:code:${url.shortCode}`);
    
    // Remove from user's URLs
    if (url.userId) {
      await this.redisService.del(`user:${url.userId}:urls`);
    }
  }

  private async incrementClicks(urlId: string): Promise<void> {
    const url = await this.findById(urlId);
    if (url) {
      url.clicks += 1;
      url.updatedAt = new Date();
      await this.redisService.hSet(`url:${urlId}`, 'data', JSON.stringify(url));
    }
  }

  private async trackVisit(urlId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const visitKey = `url:${urlId}:visits:${today}`;
    await this.redisService.incr(visitKey);
    await this.redisService.expire(visitKey, 30 * 24 * 60 * 60); // 30 days
  }

  async getAnalytics(urlId: string, userId?: string): Promise<any> {
    const url = await this.findById(urlId);
    if (!url) {
      throw new NotFoundException('URL not found');
    }

    // Check ownership if user is authenticated
    if (userId && url.userId !== userId) {
      throw new BadRequestException('Not authorized to view analytics for this URL');
    }

    // Get visit data for the last 30 days
    const visits = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const visitKey = `url:${urlId}:visits:${dateStr}`;
      const count = await this.redisService.get(visitKey);
      visits.push({
        date: dateStr,
        clicks: parseInt(count || '0'),
      });
    }

    return {
      url,
      visits: visits.reverse(),
      totalClicks: url.clicks,
    };
  }
} 