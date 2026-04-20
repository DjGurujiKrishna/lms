import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service.js';
import { CoursesController } from './courses.controller.js';
import { StudentCoursesController } from './student-courses.controller.js';

@Module({
  controllers: [CoursesController, StudentCoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
