import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Request, 
  Res, 
  Query,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Response } from 'express';
import { UrlsService } from './urls.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('URLs')
@UseGuards(ThrottlerGuard)
@Controller('urls')
export class UrlsController {
  constructor(private readonly urlsService: UrlsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a shortened URL' })
  @ApiResponse({ status: 201, description: 'URL shortened successfully' })
  @ApiResponse({ status: 409, description: 'Custom code already exists' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createUrlDto: CreateUrlDto, @Request() req) {
    return this.urlsService.create(createUrlDto, req.user.id);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user URLs' })
  @ApiResponse({ status: 200, description: 'URLs retrieved successfully' })
  async findMyUrls(
    @Request() req,
    @Query('limit') limit: string = '50',
    @Query('offset') offset: string = '0',
  ) {
    return this.urlsService.findByUserId(
      req.user.id,
      parseInt(limit),
      parseInt(offset),
    );
  }

  @Get(':shortCode/analytics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get URL analytics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'URL not found' })
  async getAnalytics(@Param('shortCode') shortCode: string, @Request() req) {
    const url = await this.urlsService.findByShortCode(shortCode);
    if (!url) {
      return { error: 'URL not found' };
    }
    return this.urlsService.getAnalytics(url.id, req.user.id);
  }

  @Get(':shortCode')
  @ApiOperation({ summary: 'Redirect to original URL' })
  @ApiResponse({ status: 302, description: 'Redirected successfully' })
  @ApiResponse({ status: 404, description: 'URL not found' })
  async redirect(@Param('shortCode') shortCode: string, @Res() res: Response) {
    try {
      const originalUrl = await this.urlsService.redirect(shortCode);
      return res.redirect(HttpStatus.FOUND, originalUrl);
    } catch (error) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'URL not found',
        error: 'Not Found',
        statusCode: 404,
      });
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update URL' })
  @ApiResponse({ status: 200, description: 'URL updated successfully' })
  @ApiResponse({ status: 404, description: 'URL not found' })
  async update(
    @Param('id') id: string,
    @Body() updateUrlDto: UpdateUrlDto,
    @Request() req,
  ) {
    return this.urlsService.update(id, updateUrlDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete URL' })
  @ApiResponse({ status: 200, description: 'URL deleted successfully' })
  @ApiResponse({ status: 404, description: 'URL not found' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.urlsService.delete(id, req.user.id);
    return { message: 'URL deleted successfully' };
  }
} 