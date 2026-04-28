import { IsInt, Max, Min } from 'class-validator';

export class UpdateGoalDto {
  @IsInt()
  @Min(1)
  @Max(500)
  dailyCardTarget: number;
}
