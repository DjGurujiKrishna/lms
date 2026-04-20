import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface.js';
import { CurrentInstituteId } from '../tenant/decorators/current-institute-id.decorator.js';
import { ListResultsQueryDto } from './dto/list-results-query.dto.js';
import { ResultsService } from './results.service.js';

@Controller('results')
@UseGuards(JwtAuthGuard)
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Get()
  findAll(
    @CurrentInstituteId() instituteId: string,
    @CurrentUser() user: JwtUser,
    @Query() query: ListResultsQueryDto,
  ) {
    return this.resultsService.findAll(instituteId, user, query.examId);
  }
}
