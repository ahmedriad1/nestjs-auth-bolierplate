import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import { PaginationDto } from '../shared/dto/pagination.dto';
import { IPaginatedResult } from '../shared/interface/pagination-result.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async index(paginationDto: PaginationDto): Promise<IPaginatedResult<User>> {
    const users = await this.userRepository.paginate(paginationDto);
    users.data.forEach((user) => delete user.password);
    return users;
  }

  async show(id: number): Promise<User> {
    const user = await this.userRepository.findOne(id);
    if (!user) throw new NotFoundException('User not found !');
    delete user.password;
    return user;
  }

  async store(data: CreateUserDto): Promise<User> {
    return this.userRepository.register(data);
  }

  async update(id: number, body: UpdateUserDto): Promise<User> {
    if (body.password)
      body.password = await this.userRepository.hashPassword(body.password);

    const result = await this.userRepository.update(id, body);
    if (result.affected === 0) throw new NotFoundException('User not found !');

    const user = await this.show(id);
    return user;
  }

  async destory(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('User not found !');
  }
}
