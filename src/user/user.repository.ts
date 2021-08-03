import { CreateUserDto } from './dto/create-user.dto';
import {
  UnauthorizedException,
  Logger,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EntityRepository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';
import { AuthCredentialsDto } from '../auth/dto/auth-credentials.dto';
import { AppRepository } from '../shared/AppRepository';

@EntityRepository(User)
export class UserRepository extends AppRepository<User> {
  logger = new Logger('UserRepository');

  async register(data: CreateUserDto): Promise<User> {
    const { email, password, name } = data;
    const user = this.create();
    user.name = name;
    user.email = email;
    user.password = await this.hashPassword(password);
    try {
      await user.save();
      delete user.password;
      return user;
    } catch (error) {
      this.logger.error(error);
      if (error.code === '23505')
        throw new ConflictException('Email already exists');
      else throw new InternalServerErrorException();
    }
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async validateUserCredentials(body: AuthCredentialsDto): Promise<User> {
    const { email, password } = body;
    const user = await this.findOne({ email });
    if (!user || !(await user.validatePassword(password)))
      throw new UnauthorizedException();
    delete user.password;
    return user;
  }
}
