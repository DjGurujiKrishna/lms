import { IsInt, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateExamDto {
  @IsString()
  @MinLength(2)
  @MaxLength(240)
  title: string;

  @IsUUID()
  courseId: string;

  /** Duration in seconds (timer). */
  @IsInt()
  @Min(60)
  @Max(24 * 60 * 60)
  duration: number;
}
