import {
  IsString,
  // IsEmail,
  MaxLength,
  // MinLength,
  IsOptional,
} from 'class-validator';

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name: string;

  // @IsOptional()
  // @IsEmail()
  // email: string;
}
