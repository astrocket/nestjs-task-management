import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { Task } from './task.entity';
import { TaskStatus } from './task-status.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskRepository } from './task.repository';

@Injectable()
export class TasksService {
  // 배열로 관리하던걸 디비 repository 로 연결
  constructor(
    @InjectRepository(TaskRepository)
    private taskRepository: TaskRepository
  ) {}
//   private tasks: Task[] = [];

    async getTasks(filterDto: GetTasksFilterDto): Promise<Task[]> {
      return this.taskRepository.getTasks(filterDto);
    }

    // string 으로 받던걸 number 로 받아야한다.
    // typeOrm을 통해서 데이터를 꺼내오는 함수는 비동기임. 그래서 asnyc / await 으로 처리해주어야함.
    // async 함수의 결과물은 항상 프러미스 이어야함.
    async getTaskById(id: number): Promise<Task> {
      const found = await this.taskRepository.findOne(id);

      if (!found) {
        throw new NotFoundException(`Task with ID '${id}' not found.`);
      }

      return found;
    }

    async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
      return this.taskRepository.createTask(createTaskDto);
    }

    async deleteTask(id: number): Promise<void> {
      const result = await this.taskRepository.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException(`Task with ID '${id}' not found.`);
      }
    }

    async updateTaskStatus(id: number, status: TaskStatus): Promise<Task> {
      const task = await this.getTaskById(id); // Entity Object 로 리턴
      task.status = status;
      await task.save(); // 얘도 async
      return task;
    }
}
