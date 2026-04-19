import { IsIn, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export const CONTENT_TYPES = ['Video', 'PDF'] as const;

export class UploadContentDto {
  @IsString()
  @MinLength(2)
  @MaxLength(300)
  title: string;

  @IsUUID()
  subjectId: string;

  @IsIn(CONTENT_TYPES)
  type: (typeof CONTENT_TYPES)[number];
}
