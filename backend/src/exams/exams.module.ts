import { Module } from '@nestjs/common';
import { CoursesModule } from '../courses/courses.module.js';
import { ExamsController } from './exams.controller.js';
import { ExamsService } from './exams.service.js';
import { QuestionsController } from './questions.controller.js';
import { SubmitController } from './submit.controller.js';

@Module({
  imports: [CoursesModule],
  controllers: [ExamsController, QuestionsController, SubmitController],
  providers: [ExamsService],
  exports: [ExamsService],
})
export class ExamsModule {}
