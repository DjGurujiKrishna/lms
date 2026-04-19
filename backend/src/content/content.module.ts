import { Module } from '@nestjs/common';
import { SubjectsModule } from '../subjects/subjects.module.js';
import { ContentController } from './content.controller.js';
import { ContentService } from './content.service.js';
import { StudentContentController } from './student-content.controller.js';

@Module({
  imports: [SubjectsModule],
  controllers: [ContentController, StudentContentController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
