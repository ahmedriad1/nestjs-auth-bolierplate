import {
  Controller,
  Param,
  Patch,
  Body,
  Delete,
  Get,
  Query,
  Post,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { IPaginatedResult } from '../shared/interface/pagination-result.interface';
import { PaginationDto } from '../shared/dto/pagination.dto';
import { UserService } from './user.service';
import { User } from '@prisma/client';

@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Get()
  index(
    @Query() paginationDto: PaginationDto,
  ): Promise<IPaginatedResult<User>> {
    return this.usersService.index(paginationDto);
  }

  @Get('/:id')
  show(@Param('id') id: string): Promise<User> {
    return this.usersService.show(id);
  }

  @Post()
  store(@Body() body: CreateUserDto): Promise<User> {
    return this.usersService.store(body);
  }

  @Patch('/:id')
  update(@Param('id') id: string, @Body() body: UpdateUserDto): Promise<User> {
    return this.usersService.update(id, body);
  }

  @Delete('/:id')
  destory(@Param('id') id: string): Promise<void> {
    return this.usersService.destory(id);
  }
}
