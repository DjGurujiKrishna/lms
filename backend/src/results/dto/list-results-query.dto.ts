import { IsOptional, IsUUID } from 'class-validator';

export class ListResultsQueryDto {
  @IsOptional()
  @IsUUID()
  examId?: string;
}
