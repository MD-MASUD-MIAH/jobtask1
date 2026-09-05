import { IsNotEmpty, IsOptional, IsString, IsEmail } from 'class-validator';

export class CreateBoardDto {
  @IsString()
  @IsNotEmpty({ message: 'Board title is required' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateBoardDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class AddBoardMemberDto {
  @IsEmail({}, { message: 'Valid user email is required' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}
