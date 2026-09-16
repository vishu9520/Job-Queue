import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateJobDto {
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  @MaxLength(100, { message: 'Title cannot exceed 100 characters' })
  title: string;

  @IsNotEmpty({ message: 'Type is required' })
  @IsString({ message: 'Type must be a string' })
  @MaxLength(50, { message: 'Type cannot exceed 50 characters' })
  type: string;
}
