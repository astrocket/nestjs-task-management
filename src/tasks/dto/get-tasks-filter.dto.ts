import { IsOptional, IsIn, IsNotEmpty } from 'class-validator';
import { TaskStatus } from '../task-status.enum';

export class GetTasksFilterDto {
  @IsOptional() // 있으면 밸리데이션, 없으면 밸리데이션무시
  @IsIn([TaskStatus.OPEN, TaskStatus.IN_PROGRESS, TaskStatus.DONE]) // Checks if given value is in a array of allowed values.
  status: TaskStatus;

  @IsOptional()
  @IsNotEmpty()
  search: string;
}