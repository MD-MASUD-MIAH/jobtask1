import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateColumnDto {
  @IsString()
  @IsNotEmpty({ message: 'Column title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Board ID is required' })
  boardId: string;
}

export class UpdateColumnDto {
  @IsString()
  @IsOptional()
  title?: string;
}

export class MoveColumnDto {
  @IsNumber()
  newPositionIndex: number;
}
