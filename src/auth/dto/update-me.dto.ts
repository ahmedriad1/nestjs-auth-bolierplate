import {
  IsString,
  IsEmail,
  MaxLength,
  MinLength,
  IsOptional,
} from 'class-validator';

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  password: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  old_password: string;
}
