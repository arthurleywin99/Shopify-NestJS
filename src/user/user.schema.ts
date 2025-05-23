import { IsEmail, IsNotEmpty, IsPhoneNumber, MinLength } from 'class-validator';

export class UserSchema {
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  avatar?: string;

  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string;

  @IsEmail()
  email?: string;
}

export class CreateUserSchema {
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  avatar?: string;

  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string;

  @IsEmail()
  email?: string;
}
