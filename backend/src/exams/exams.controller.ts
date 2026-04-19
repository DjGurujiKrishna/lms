import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MANAGE_CURRICULUM_ROLES } from '../auth/access.constants.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RoleGuard } from '../auth/guards/role.guard.js';
import { CurrentInstituteId } from '../tenant/decorators/current-institute-id.decorator.js';
import { CreateExamDto } from './dto/create-exam.dto.js';
import { ExamsService } from './exams.service.js';

@Controller('exams')
@UseGuards(JwtAuthGuard)
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Get()
  @UseGuards(RoleGuard)
  @Roles(...MANAGE_CURRICULUM_ROLES)
  list(
    @CurrentInstituteId() instituteId: string,
    @Query('courseId') courseId?: string,
  ) {
    return this.examsService.findAll(instituteId, courseId);
  }

  @Post()
  @UseGuards(RoleGuard)
  @Roles(...MANAGE_CURRICULUM_ROLES)
  create(
    @CurrentInstituteId() instituteId: string,
    @Body() dto: CreateExamDto,
  ) {
    return this.examsService.createExam(instituteId, dto);
  }

  /** Staff see correct answers; enrolled students see questions without `answer`. */
  @Get(':id')
  findOneById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentInstituteId() instituteId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.examsService.getExamById(id, instituteId, user);
  }
}
