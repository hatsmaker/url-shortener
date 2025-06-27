import { IsUrl, IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUrlDto {
  @ApiProperty({ 
    description: 'The original URL to shorten',
    example: 'https://www.example.com/very/long/path' 
  })
  @IsUrl({}, { message: 'Please provide a valid URL' })
  originalUrl: string;

  @ApiProperty({ 
    description: 'Custom short code (optional)',
    example: 'my-custom-code',
    required: false 
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  customCode?: string;

  @ApiProperty({ 
    description: 'Title for the URL (optional)',
    example: 'My Website',
    required: false 
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiProperty({ 
    description: 'Description for the URL (optional)',
    example: 'This is my personal website',
    required: false 
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
} 