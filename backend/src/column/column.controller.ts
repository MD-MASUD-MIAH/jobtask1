import {
  Controller,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ColumnService } from './column.service';
import { CreateColumnDto, UpdateColumnDto, MoveColumnDto } from './dto/column.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BoardAccessGuard } from '../board/guards/board-access.guard';

@Controller('columns')
@UseGuards(JwtAuthGuard)
export class ColumnController {
  constructor(private columnService: ColumnService) {}

  @Post()
  @UseGuards(BoardAccessGuard)
  createColumn(@Body() dto: CreateColumnDto) {
    return this.columnService.createColumn(dto);
  }

  @Put(':id')
  @UseGuards(BoardAccessGuard)
  updateColumn(@Param('id') id: string, @Body() dto: UpdateColumnDto) {
    return this.columnService.updateColumn(id, dto);
  }

  @Delete(':id')
  @UseGuards(BoardAccessGuard)
  deleteColumn(@Param('id') id: string) {
    return this.columnService.deleteColumn(id);
  }

  @Patch(':id/move')
  @UseGuards(BoardAccessGuard)
  moveColumn(@Param('id') id: string, @Body() dto: MoveColumnDto) {
    return this.columnService.moveColumn(id, dto);
  }
}
