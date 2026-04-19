import { IsUUID } from 'class-validator';

export class EnrollDto {
  @IsUUID()
  studentId: string;

  @IsUUID()
  courseId: string;
}
