import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUrlDto {
  @ApiProperty({ 
    description: 'Custom short code',
    example: 'new-custom-code',
    required: false 
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  customCode?: string;

  @ApiProperty({ 
    description: 'Title for the URL',
    example: 'Updated Website Title',
    required: false 
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiProperty({ 
    description: 'Description for the URL',
    example: 'Updated description',
    required: false 
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
} 