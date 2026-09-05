import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { BoardService } from './board.service';
import { CreateBoardDto, UpdateBoardDto, AddBoardMemberDto } from './dto/board.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BoardAccessGuard } from './guards/board-access.guard';
import { GetUser } from '../auth/get-user.decorator';

@Controller('boards')
@UseGuards(JwtAuthGuard)
export class BoardController {
  constructor(private boardService: BoardService) {}

  @Get()
  getUserBoards(@GetUser('id') userId: string) {
    return this.boardService.getUserBoards(userId);
  }

  @Post()
  createBoard(@GetUser('id') userId: string, @Body() dto: CreateBoardDto) {
    return this.boardService.createBoard(userId, dto);
  }

  @Get(':id')
  @UseGuards(BoardAccessGuard)
  getBoardById(@Param('id') id: string) {
    return this.boardService.getBoardById(id);
  }

  @Put(':id')
  @UseGuards(BoardAccessGuard)
  updateBoard(@Param('id') id: string, @Body() dto: UpdateBoardDto) {
    return this.boardService.updateBoard(id, dto);
  }

  @Delete(':id')
  @UseGuards(BoardAccessGuard)
  deleteBoard(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.boardService.deleteBoard(id, userId);
  }

  @Post(':id/members')
  @UseGuards(BoardAccessGuard)
  addMember(@Param('id') id: string, @Body() dto: AddBoardMemberDto) {
    return this.boardService.addMember(id, dto);
  }

  @Delete(':id/members/:userId')
  @UseGuards(BoardAccessGuard)
  removeMember(
    @Param('id') id: string,
    @Param('userId') memberUserId: string,
    @GetUser('id') requestingUserId: string,
  ) {
    return this.boardService.removeMember(id, memberUserId, requestingUserId);
  }
}
