import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskRepository } from './task.repository';
import { TaskStatus } from './task-status.enum';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { NotFoundException } from '@nestjs/common';

// 실제 디비와 연결하지 않기 위한 테스트 리포지토리
const mockTaskRepository = () => ({
  // TaskRepository 의 getTasks 함수를 목함수로 갈아끼운다.
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
});

describe('TasksService', () => {
  let tasksService;
  let taskRepository;

  // 실제 모듈을 가지고 테스트 하면 db 같은 거랑 repository 랑 다 엮이므로 테스트용 모듈을 임시로 만들어서
  // 사용한다.
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        // type은 TaskRepository 로 제공하되 코드는 mock 으로 만든다.
        // useFactory / useClass / useExisting 셋 중 하나를 사용가능한데, useFactory 로 해주면
        // 실행될때마다 새로 다시 찍어내게 된다.
        { provide: TaskRepository, useFactory: mockTaskRepository }
      ],
    }).compile();

    tasksService = await module.get<TasksService>(TasksService);
    taskRepository = await module. get<TaskRepository>(TaskRepository);
  });

  // getTasks 테스트 하기
  describe('getTasks', () => {
    it('gets all tasks from the repository', async () => {
      // 아래처럼 해서 mock 으로 만든 repository 의 promise 리턴값 도 목으로 채워준다.
      taskRepository.getTasks.mockResolvedValue('someValue');
      expect(taskRepository.getTasks).not.toHaveBeenCalled();
      const filters: GetTasksFilterDto = { status: TaskStatus.IN_PROGRESS, search: 'some Query' };
      // call tasksService.getTasks
      const result = await tasksService.getTasks(filters);
      expect(taskRepository.getTasks).toHaveBeenCalled();
      // expect taskRepository.getTasks TO HAVE BEEN CALLED
      expect(result).toEqual('someValue')
    });
  });

  // Exception 이 발생가능한 조회 getTaskById 테스트하기
  describe('getTaskById', () => {
    it('calls taskRepository.findOne() and successfully retrieve and return the task', async () => {
      const mockTask = { title: 'Test Task', description: "Test Desc" };
      taskRepository.findOne.mockResolvedValue(mockTask);

      const result = await tasksService.getTaskById(1)
      expect(result).toEqual(mockTask)
    });

    it('throws an error as task is not found', () => {
      taskRepository.findOne.mockResolvedValue(null);
      // expect 속에 있는 promise 의 reject 되는 promise 가 exception 을 날릴것이다.. 라는 테스트.
      // 어렵다 .. !
      expect(tasksService.getTaskById(1)).rejects.toThrow();
    });
  });

  describe('createTask', () => {
    it('calls taskRepository.create() and returns the result', async () => {
      taskRepository.createTask.mockResolvedValue('someTask');

      expect(taskRepository.createTask).not.toHaveBeenCalled();
      const createTaskDto = { title: 'Test task', description: 'Test desc' };
      const result = await tasksService.createTask(createTaskDto);
      expect(taskRepository.createTask).toHaveBeenCalled(); // 아래꺼에 중복
      expect(taskRepository.createTask).toHaveBeenCalledWith(createTaskDto);

      expect(result).toEqual('someTask')
    });
  });

  describe('deleteTask', () => {
    it('calls taskRepository.delete() to delete a task', async () => {
      // 여기서 리포지토리의 delete 는 무조건 성공한다고 본다.
      // 그래서 아래처럼 리턴된 프러미스가 affected 함수에 반응 하도록 해줌..
      taskRepository.delete.mockResolvedValue({ affected: 1 });
      expect(taskRepository.delete).not.toHaveBeenCalled();
      await tasksService.deleteTask(1);
      expect(taskRepository.delete).toHaveBeenCalled();
      expect(taskRepository.delete).toHaveBeenCalledWith(1);
    });

    it('throws an error as task could not be found', () => {
      taskRepository.delete.mockResolvedValue({ affected: 0 });
      expect(tasksService.deleteTask(1)).rejects.toThrow(NotFoundException)
    });
  });

  describe('updateTaskService', () => {
    it('calls taskRepository.updateTaskStatus() to update a task', async () => {
      const save = jest.fn().mockResolvedValue(true);

      tasksService.getTaskById = jest.fn().mockResolvedValue({
        status: TaskStatus.OPEN,
        save,
      })

      expect(tasksService.getTaskById).not.toHaveBeenCalled();
      expect(save).not.toHaveBeenCalled();

      const result = await tasksService.updateTaskStatus(1, TaskStatus.DONE);

      expect(tasksService.getTaskById).toHaveBeenCalled();
      expect(result.status).toEqual(TaskStatus.DONE);
      expect(save).toHaveBeenCalled();
    });
  });
});
