import { Module } from '@nestjs/common';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { BoardAccessGuard } from './guards/board-access.guard';

@Module({
  controllers: [BoardController],
  providers: [BoardService, BoardAccessGuard],
  exports: [BoardService, BoardAccessGuard],
})
export class BoardModule {}
