import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  AddGroupCardDto,
  CreateGroupDto,
  JoinGroupDto,
  UpdateGroupSettingsDto,
} from './dto/groups.dto';
import { GroupsService } from './groups.service';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  createGroup(@CurrentUser('id') userId: string, @Body() dto: CreateGroupDto) {
    return this.groupsService.createGroup(userId, dto);
  }

  @Post('join')
  joinGroup(@CurrentUser('id') userId: string, @Body() dto: JoinGroupDto) {
    return this.groupsService.joinGroup(userId, dto);
  }

  @Get('my-group')
  getMyGroup(
    @CurrentUser('id') userId: string,
    @Query('languageCode') languageCode?: string,
  ) {
    return this.groupsService.getMyGroup(userId, languageCode);
  }

  @Get('league')
  getLeagueLeaderboard(
    @CurrentUser('id') userId: string,
    @Query('languageCode') languageCode?: string,
  ) {
    return this.groupsService.getLeagueLeaderboard(userId, languageCode);
  }

  @Patch('settings')
  updateSettings(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateGroupSettingsDto,
    @Query('languageCode') languageCode?: string,
  ) {
    return this.groupsService.updateSettings(userId, dto, languageCode);
  }

  @Post('cards')
  addCard(@CurrentUser('id') userId: string, @Body() dto: AddGroupCardDto) {
    return this.groupsService.addCard(userId, dto);
  }

  @Get('cards')
  getCards(@CurrentUser('id') userId: string) {
    return this.groupsService.getGroupCards(userId);
  }

  @Delete('cards/:id')
  deleteCard(@CurrentUser('id') userId: string, @Param('id') cardId: string) {
    return this.groupsService.deleteCard(userId, cardId);
  }

  @Post('nudge/:memberId')
  nudgeMember(
    @CurrentUser('id') userId: string,
    @Param('memberId') targetUserId: string,
  ) {
    return this.groupsService.nudgeMember(userId, targetUserId);
  }

  @Post('leave')
  leaveGroup(
    @CurrentUser('id') userId: string,
    @Query('languageCode') languageCode?: string,
  ) {
    return this.groupsService.leaveGroup(userId, languageCode);
  }
}
