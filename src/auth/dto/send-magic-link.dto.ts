import { IsEmail } from 'class-validator';

export class SendMagicLinkDto {
  @IsEmail()
  email: string;
}
