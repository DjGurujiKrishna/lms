import {
  ArrayMinSize,
  IsArray,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateQuestionDto {
  @IsUUID()
  examId: string;

  @IsString()
  @MinLength(3)
  @MaxLength(5000)
  question: string;

  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  options: string[];

  /** Must match exactly one of `options` (checked in service). */
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  answer: string;
}
