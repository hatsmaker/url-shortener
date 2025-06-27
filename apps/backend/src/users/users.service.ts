import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { RedisService } from '../common/redis/redis.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

@Injectable()
export class UsersService {
  constructor(private readonly redisService: RedisService) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const { email, password, name } = createUserDto;

    // Check if user already exists
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const userId = nanoid();
    const user: User = {
      id: userId,
      email,
      name,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.redisService.hSet(`user:${userId}`, 'data', JSON.stringify(user));
    await this.redisService.hSet(`user:email:${email}`, 'userId', userId);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findByEmail(email: string): Promise<User | null> {
    const userId = await this.redisService.hGet(`user:email:${email}`, 'userId');
    if (!userId) {
      return null;
    }

    return this.findById(userId);
  }

  async findById(id: string): Promise<User | null> {
    const userData = await this.redisService.hGet(`user:${id}`, 'data');
    if (!userData) {
      return null;
    }

    return JSON.parse(userData);
  }

  async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(id: string, updateData: Partial<User>): Promise<Omit<User, 'password'>> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = {
      ...user,
      ...updateData,
      updatedAt: new Date(),
    };

    await this.redisService.hSet(`user:${id}`, 'data', JSON.stringify(updatedUser));

    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }
} 