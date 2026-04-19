import { IsISO8601, IsObject, IsOptional, IsUUID } from 'class-validator';

export class SubmitExamDto {
  @IsUUID()
  examId: string;

  /** Map questionId → selected answer text (must match one of the MCQ options). */
  @IsObject()
  answers: Record<string, string>;

  /** Optional start time for server-side timer enforcement (ISO 8601). */
  @IsOptional()
  @IsISO8601()
  startedAt?: string;
}
