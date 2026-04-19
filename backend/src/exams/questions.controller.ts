import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { MANAGE_CURRICULUM_ROLES } from '../auth/access.constants.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RoleGuard } from '../auth/guards/role.guard.js';
import { CurrentInstituteId } from '../tenant/decorators/current-institute-id.decorator.js';
import { CreateQuestionDto } from './dto/create-question.dto.js';
import { ExamsService } from './exams.service.js';

@Controller('questions')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(...MANAGE_CURRICULUM_ROLES)
export class QuestionsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post()
  create(
    @CurrentInstituteId() instituteId: string,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.examsService.createQuestion(instituteId, dto);
  }
}
