import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
// import { PaginationDto } from '../shared/dto/pagination.dto';
// import { IPaginatedResult } from '../shared/interface/pagination-result.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AuthCredentialsDto } from 'src/auth/dto/auth-credentials.dto';
@Injectable()
export class UserService {
  logger = new Logger('UserService');

  constructor(private readonly prisma: PrismaService) {}

  private excludePassword(user: User | User[]) {
    if (Array.isArray(user)) return user.map((u) => this.excludePassword(u));

    delete user.password;
    return user;
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  private async validatePassword(
    userPassword: string,
    password: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, userPassword);
  }

  // async index(paginationDto: PaginationDto): Promise<IPaginatedResult<User>> {
  //   const [count, users] = await this.prisma.$transaction([
  //     this.prisma.user.count(),
  //     this.prisma.user.findMany({
  //       skip: paginationDto.limit * (paginationDto.page - 1 || 0),
  //       take: paginationDto.limit,
  //     }),
  //   ]);

  //   return {
  //     data: this.excludePassword(users),
  //     totalCount: count,
  //     page: paginationDto.page,
  //     limit: paginationDto.limit,
  //   };
  // }

  async show(id: string, withPassword = false): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) throw new NotFoundException('User not found !');
    return withPassword ? user : this.excludePassword(user);
  }

  async validateUserCredentials(body: AuthCredentialsDto): Promise<User> {
    const { email, password } = body;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await this.validatePassword(user.password, password)))
      throw new UnauthorizedException();

    return this.excludePassword(user);
  }

  async store(data: CreateUserDto): Promise<User> {
    const { email, password, name } = data;

    try {
      const user = await this.prisma.user.create({
        data: {
          name,
          email,
          password: await this.hashPassword(password),
        },
      });

      return this.excludePassword(user);
    } catch (error) {
      this.logger.error(error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new ConflictException('Email already exists !');
      } else throw new InternalServerErrorException();
    }
  }

  async update(
    id: string,
    body: UpdateUserDto & { old_password?: string },
  ): Promise<User> {
    const user = await this.show(id, true);

    if (body.password) {
      // If user wants to change password, check if he also wrote the old password
      if (!body.old_password)
        throw new BadRequestException('old_password is required');

      // check if the old password is correct
      if (!(await this.validatePassword(user.password, body.old_password)))
        throw new BadRequestException('old_password is incorrect');

      // if it's correct, hash the new password
      body.password = await this.hashPassword(body.password);
    }

    if (body.password) body.password = await this.hashPassword(body.password);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: body,
    });
    if (!updatedUser) throw new NotFoundException('User not found !');

    return this.excludePassword(updatedUser);
  }

  // async destory(id: string): Promise<void> {
  //   const user = await this.prisma.user.delete({ where: { id } });
  //   if (!user) throw new NotFoundException('User not found !');
  // }
}
