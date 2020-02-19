# NestJS 기본
소스코드 : https://github.com/arielweinberger/nestjs-course-task-management/tree/validation/task-filtering-and-search

## Module
모듈은 하나의 기능을 묶는 단위고 최소한 한개의 모듈은 있어야 nest 가 돌아감.
필요한 다른 모듈들을 import 해서 가져다 쓰거나 export 해서 제공할 수 있음
모듈에는 provider 와 controller 가 있는데, provider 에 비즈니스 로직이 들어감.
controller 는 라우터, 렌더링 등을 담당함.

> Task 모듈 만들기
```bash
nest g module tasks
# tasks/tasks.module.ts 파일 하나 떨궈짐
# app.module.ts 에서 TaskModule 이 import 됨
```

## Controller
컨트롤러는 응답 주고받는 역할을 해주고, 라우팅을 정의 한다.
http method 와 endpoint 를 처리할 handler 들을 제공해줌
Controller 가 사용되는 모듈에서 떨어지는 provider 들를 사용 가능 (dependency injection 을 통해서)
@Controller 데코레이터로 선언. 선언할 때 path 를 변수로 받는다.
Handler 선언하기 (개별 Action 에 대해서 어떤 http 로 사용할지 Action 함수 위에다가 정의한다.)

> 샘플
```typescript
@Controller('/tasks')
export class TasksController {
  @Get()
  getAllTasks() {
    // do Stuff
    return ...;
  }
}
```

> Controller 만들기
```bash
nest g controller tasks --no-spec
```

## Provider
@Injectable 데코레이터로 선언.
그냥 값일 수도 있고, Class 일 수도 있고, sync/async 팩토리 일 수도 있다.
프로바이더는 모듈에서 가져가다 쓴다.
어떤 provider 가 특정 모듈에서 export 되고 그 특정 모듈을 다른 모듈에서 import 해도 provider 어떤 provider 를 사용할 수 있다.
Servie 레이어 선언도 provider 로 한다. 싱글톤.
서비스 : Validate data, Create an item in DB, return a response

> Service Ex
```typescript
import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { LoggerService } from './shared/logger.service';

@Module({
  controllers: [TasksController],
  providers: [TasksService, LoggerService]
})
export class TasksModule {}
```

## Dependency Injection
어떤 컴포넌트던 간에 디펜던시 인젝션을 활용해서 @Injectable 로 선언 된 provider 를 inject 해서 사용할 수 있다.
이걸 가져다가 쓰는 import 방식을 nestJs의 Dependency Injection 이 직관적으로 처리 해준다.
예를 들면 constructor 에서 간단하게 선언해주면, 클래스 내에서 클래스 변수로 접근해서 사용 할 수 있는 식.
```typescript
import { TasksService } from "./tasks.service";

@Controller('/tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  async getAllTasks() {
    return await this.tasksService.getAllTasks();
  }
}
```

> Service 만들기
```bash
nest g service tasks --no-spec
# service 파일하나 만들어줌 @Injectable 로 감싸짐
# module 에 import 됨
```

## Model 추가하기
1. Interface
타입스크립트 컨셉트. Compile 하고 나면 더 이상 인터페이스가 아님.
2. Class
JS 기본 스펙이라 Compile 하고도 클래스임.
Interface 로 시작해서 만들다가 Class 로 바꾸는게 좋다.

Type 선언할떄 id 가 같이 선언되어야 한다.
요걸 해주는게 uuid 패키지임
```text
Property 'id' is missing in type '{ title: string; description: string; status: TaskStatus.OPEN; }' but required in type 'Task'.
```

> post 에서 모든 body 파라미터를 허용하는 방식
```typescript
  @Post()
  createTask(@Body() body) {
    console.log('body', body);
  }
```

> post 에서 특정 body 파라미터만 허용하는 방식
```typescript
  @Post()
  createTask(
    @Body('title') title: string,
    @Body('description') description: string,
  ): Task {
    return this.taskService.createTask(title, description);
  }
```


## Data Type Object
A DTO is an object that defines how the data will be sent over the network.
A DTO is *NOT* a model definition.
It defines the shape of data for a specific case, for example - creating a task.
Can be defined using an interface or a class.
Task 데이터를 컨트롤러에서 받아서 실행하고, Service 에서도 데이터 정의가 필요하다.
아래처럼 두번의 중복이 발생하고 이로인한 문제가 생길 수도 있어서 정의 해두는 중간체가 필요하다.

> 왜 필요한가..? 아래처럼 중복이 발생한다.
```typescript
  ...
  @Body('title') title: string,
  @Body('description') description: string,
  ...
  createTask(title: string, description: string): Task {
  ...
```

#### Classes VS Interfaces for DTOs
클래스로 선언하면: 런타임에서 참조 가능.
인터페이스로 선언하면: 타입스크립트의 선언체여서 컴파일 전에만 사용가능함.
DTO는 클래스로 선언하는게 좋다.

#### Example DTOs
delivery 서비스일 때
- CreateShippingDto
- UpdateShippingAddressDto
- CreateTransitDto

#### Creating DTO
- tasks/dto/action-name.dto.ts 컨벤션으로 생성
- 클래스로 선언하고, 타입만 정의 해준다.

> DTO를 활용해서 아래처럼 중복을 제거 가능하다
```typescript
  ...
  createTask(@Body() createTaskDto: CreateTaskDto): Task {
  ...
  createTask(createTaskDto: CreateTaskDto): Task {
    const { title, description } = createTaskDto;
  ...
```

## Deleting Task
- Incoming DELETE HTTP
- Get 이랑 똑같음 `this.tasks = this.tasks.filter(task => task.id !== id)` 로 간단히 처리.
- 응답은 void 로 떨궈준다 아무것도 안가고 200 떨어짐.

## Updating Task's Status
`PATCH http://localhost:3000/tasks/:id/status`
- 함수에서 Enum 으로 선언된 밸류의 타입을 검증 할 때는 그냥 Enum 클래스명을 타입으로 해주면 된다.

## Searching & Filtering Tasks
- 필터관련 DTO를 먼저 만든다. `tasks/dto/get-tasks-filter.dto.ts`
- getTasks 컨트롤러 핸들러를 만든다. DTO를 쿼리파람으로 받고 키가 존재하면 getTasksWithFilters 서비스로 처리한다
- getTasksWithFilters 서비스에서 `let` 로컬변수로 tasks 를 복사하고 Array.filter 를 활용해서 조건에 맞추어서 걸러낸다.

## NestJS Pipes
파라미터 전처리기
- 컨트롤러(Handler)에 들어가기 전에 Router Handler 가 처리해주는거에 대한 부분
- data transformation / data validation 을 하는 역할
- can return original/modified data
- can throw Exceptions which will be handled by NestJS and parsed into an error response.
- can be asynchronous

#### @nestjs/common module
- ValidationPipe : 인자로 받는 DTO랑 다르면 Exception 떨궈줌
- ParseIntPipe : 파라미터가 숫자 형태이면, `Number` 타입으로 캐스팅 해서 핸들러에 넘겨줌

#### Custom Pipe
- Pipes are `@Injectable()` annotated Class.
- Pipes must implement the `PipeTransform` generic interface. Therefore, every pipe must have a `transform()` method. Which will be called by NestJS to process.
- `transform()` method accepts two parameters : value / metadata
  - value : processed argument
  - metadata (optional) : an object containing metadata about argument
- Whatever is returned from `transform()` method will be passed on to the route handler.
- Exceptions will be sent back to the client.

#### Handler-level pipes
컨트롤러 액션별로 pipe를 다는 방식.
```typescript
@Post()
@UsePipes(SomePipe)
createTask() {
  ...
}
```

#### Parameter-level pipes
파라미터 별로 pipe를 다는 방식
```typescript
@Post()
createTask(
  @Body('description', somePipe) description
)
```

#### Global pipes
앱에 통으로 거는 방식
```typescript
async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);
  app.useGlobalPipes(SomePipe);
  await app.listen(3000);
}
bootstrap();
```

## Task 생성에 validation 추가하기
Task 를 생성하는데 쓰이는 CreateTaskDto 에 현재 validation  이 없다.
validation 을 추가하는데 쓰이는 패키지들이 있다.
- https://github.com/typestack/class-validator
- https://github.com/typestack/class-transformer
```bash
yarn add class-validator class-transformer
```

#### CreateTaskDto에 밸리데이터 추가하기
```typescript
import { IsNotEmpty } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;
}
```

#### createTask Handler 에 파이프 추가하기
여기서 Dto가 이미 적절한 class-validator 를 가지고 있고.
UsePipes가 선언 되었기 때문에 Nest가 알아서 DTO의 밸리데이션을 적용해준다.
```typescript
  @Post()
  @UsePipes(ValidationPipe)
  createTask(@Body() createTaskDto: CreateTaskDto): Task {
    return this.tasksService.createTask(createTaskDto);
  }
```
실제로 빈거 날려서 create 시도해보면 알아서 exception 까지 떨궈서 포맷된 json 으로 내려준다.

#### Non Existing Task 핸들링하기
`tasksService.getTaskById` 에서 처리한다.
리소스를 못찾으면 404 를 떨궈주는게 좋음.
Service 단에서 `throw new NotFoundException("custom message response");` 올려주면 controller 를 넘어서 nest.js 에서 알아서 404 Notfound 로 판단하고 에러를 내려준다.
요렇게 해주면 `tasksService.getTaskById` 를 사용하는 업데이트 핸들러에서도 없는거에 대한 에러를 잘 처리해준다.
```json
{
    "statusCode": 404,
    "error": "Not Found",
    "message": "Task with ID 'fdsfdsa' not found."
}
```

#### Delete 도 tasksService.getTaskById 를 참조하도록 수정
그래야지 dry 하게 404 처리가 가능하다.

#### Update 에도 밸리데이션 추가
Status 를 체크해주는 CustomPipe 를 넣으려고 한다.
`src/pipes/task-status-validation.pipe.ts` 컨벤션으로 파일명을 생성한다.
`PipeTransform` 을 implement 해야한다.
그리고 transform 메서드를 반드시 선언해야한다. 자동으로 이게 실행됨.
```typescript
import { PipeTransform, ArgumentMetadata } from "@nestjs/common";

export class TaskStatusValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    console.log('value', value);
    console.log('metadata', metadata);

    return value;
  }
}
```
이러고 Handler 에서는 아래처럼 쓰면됨.
```typescript
  updateStatus(
    @Param('id') id: string,
    @Body('status', TaskStatusValidationPipe) status: TaskStatus,
  ): Task {
```

만약에 인자를 받아서 Pipe 를 다이나믹하게 만들려면 클래스가 아닌 아래처럼 object 를 넘겨도 된다.
body, param, query 다 똑같이 동작함.
```typescript
  updateStatus(
    @Param('id') id: string,
    @Body('status', new TaskStatusValidationPipe()) status: TaskStatus,
  ): Task {
```

이 상태에서 존재하지 않는 status 로 업데이트 요청 날려보면 아래처럼 콘솔이 찍힌다.
```bash
value 가짜상태
metadata { metatype: [Function: String], type: 'body', data: 'status' }
```

metadata는 당장 쓰지는 않으므로 지우고 value 를 가공, 검증 하는 거 위주로 코드를 작성해보면.

```typescript
import { PipeTransform, BadRequestException } from "@nestjs/common";
import { TaskStatus } from '../task.model';

export class TaskStatusValidationPipe implements PipeTransform {
  // 클래스 내에서만 수정가능
  readonly allowedStatuses = [
    TaskStatus.OPEN,
    TaskStatus.IN_PROGRESS,
    TaskStatus.DONE,
  ];

// BadRequestException 로 400에러 떨구기, transform 구현
  transform(value: any) {
    value = value.toUpperCase();

    if (!this.isStatusValid(value)) {
      throw new BadRequestException(`${value} is an invalid status`);
    }

    return value;
  }

  private isStatusValid(status: any) {
    const idx = this.allowedStatuses.indexOf(status) // -1 if not present.
    return idx !== -1;
  }
}
```

```json
{
    "statusCode": 400,
    "error": "Bad Request",
    "message": "가짜상태 is an invalid status"
}
```

#### Filter 에도 밸리데이션 추가
마찬가지로 DTO 에다가 선언하고 Handler 에서 pipe만 추가해준다.
status 는 옵셔널하고, Enum 중에 하나여야 하므로 : IsOptional / IsIn
search 는 옵셔널하고, 주어질 경우 빈 값이면 안되므로 : IsOptional / IsNotEmpty

# DataBase 연동

## PostgresSQL & pgAdmin 설치
postgres : https://postgresapp.com/downloads.html
pgadmin : https://www.pgadmin.org/download/
어드민 깔면 웹으로 컨트롤 패널이 열린다. 거기서 통제 하면됨.
taskmanagement 이름으로 DB 하나 생성함..

## TypeORM
- Define & Manage : entities, repositories, columns, relations, replication, indices, queries

## Examples
https://typeorm.io
> Receiving all tasks owned by "Ashley" and are of status "Done"
```typescript
const tasks = await Task.find({ user: 'Ashley', status: 'DONE' })
```
> Pure JS로 DB에서 직접 뽑아내기 (long and dirty)
```javascript
let tasks;
db.query("SELECT * FROM tasks WHERE status = 'DONE' AND user = 'Ashley'", (err, result) => {
  if (err) {
    throw new Error('Could not retrieve tasks!');
  }
  tasks = result.rows;
})
```

강의 수정사항 entities 설정할 때
entities: [__dirname + '/../**/*.entity.{js,ts}']
로 처리

## Initialize Connection
앱 모듈에서 해준다. 여러방법이 있음.
1. static json 파일로 선언하는 방법이랑.
2. object 로 선언하는 방법.
3. Service 에서 async 로 선언하는 방법.

강의에서는 2번째로 한다.
`src/config/typeorm.config.ts` 에다가 선언하는게 컨벤션.

파일에다가 컨피그 object 로 하나 만들고, `app.module.ts` TypeOrmMmodule import 하면서 설정한 컨피그 갖다 붙인다.

## Task Entity 로 데이터 관리하기
`tasks/task.entity.ts` 컨벤션으로 엔티티 선언한다.
BaseEntity 를 extend 하고 @Entity 데코레이터로 감싸준다.
파일에다가 칼럼들 하나하나 선언해준다.

## Task Repository 로 db 관련 로직 관리하기
db 오퍼레이션을 entity 에 넣으면 지저분해지니까 repository 파일을 새로 하나 판다.
Service 에서도 db 관련된 로직은 repository 로 빼준다.
타입이 선언된?? `Repository<Task>` 를 extend 하고 `@EntityRepository(Task)` 데코레이터로 감싸준다.
```typescript
import { Task } from './task.entity';
import { Repository, EntityRepository } from "typeorm";

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {
}
```

만들어준 repository 를 task 모듈 어디에서나 서야하니까 tasks.module.ts 에서 이걸 import 해줘야한다. 커넥션은 이미 app module 에서 선언 했으므로 해당 task 모듈에서만 활용하고 싶은 Entity/Repository 만 가져와서 forFeature 로 붙여주면 된다.
```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([TaskRepository]),
  ],
  controllers: [TasksController],
  providers: [TasksService]
})
export class TasksModule {}
```

## db 중심으로 리팩토링
기존에 `task.model.ts` 에서 관리하던 interface Task 가 이제 불필요하다.
이 파일을 지워도 되는데, 다만 TaskStatus 는 아직도 필요하다. status 용 파일으르 만들어서 뺸다.
`tasks/task-status.enum.ts` 로 네이밍 하고 model 파일 날리자.

uuid 패키지 필요 없으므로 지운다
```bash
yarn remove uuid
```

일단 기존 controller 랑 service 를 주석처리 하고 다시 짠다.
다시 짤때 TaskRepository 를 통해서 typeOrm 으로 조회하는 매서드들의 결과물은 모두 비동기 promise 이기 때문에 async / await 처리를 해서 기다려 주어야한다.
그리고 async 로 선언한 함수는 항상 Promise 를 반환한다. 그 프로미스가 기다리고 결과를 떨구는..

## Delete Task
- delete : id 등으로 삭제
- remove : entity 로 넘겨서 삭제

# Logging
## Types of Logs
- Log : General purpose logging of important information.
- Warning : Unhandled issue that is NOT fatal or destructive.
- Error : Unhandled issue that is fatal or desctructiive.
- Debug : Useful information that can help us debu
- Verbose : Information that provides insights about the behavior of the application.

## Log Levels
- development : log, error, warning, debug, verbose
- staging : log, error, warning
- production : log, error

## NestJS Logger
Logger 모듈이 기본으로 제공 됨.
private class variable 로 logger 를 선언해서 사용한다.
> repository 에서 db 관련 로직 실패에 대한 로그를 쌓는다고 할 때
```typescript
private logger = new Logger('TaskRepository');
...
try {
  const tasks = await query.getMany();
  return tasks;
} catch (error) {
  this.logger.error(`Some Error happened !`, error.stack); // error.stack 으로 stack trace 를 찍는다.
  throw new InternalServerErrorException();
}
```

# Configuration
앱 시작할 때 가져오는 값들: application initializer
configuration per env.
config 에 yml 로 넣기 / env 로 주입하기

## Configuration Management Set up
config package 설치
```bash
yarn add config
```
src 말고 root 에 config 폴더 생성하고
default.yml / development.yml / production.yml 만들기

## DB 배포시 싱크 전략
아래처럼 환경 변수로 배포시에 한번 마이그레이션 해주고 그 이외에는 false 이도록 처리
```typescript
synchronize: process.env.TYPEORM_SYNC || dbConfig.synchronize // Schema 싱크 맞추는건데 프로덕션에서는 꺼두는게 좋다.
```

# 프론트 띄우기

> 노드 환경 설정하기

> cors 설정 하기
```typescript
if (process.env.NODE_ENV === 'development') {
  app.enableCors(); // 어떤 api에서의 요청을 허용할지..
}
```

# Testing NestJS Application
네스트에 기본으로 jest 가 박혀있음.
Jest is a delightful JavaScript Testing Framework with a focus on simplicity.
https://jestjs.io/docs/en/getting-started
```bash
yarn test
```

데모로 빈파일 테스트 코드 만들어서 돌려보기
`src/example.spec.ts`

아래 코드 돌리면 노드가 계속 돌면서 spec.ts 파일이 생기거나 변화가 생길때 테스트 코드를 돌려준다.
근데 안되네 ..? 일단 무시
```bash
yarn test --watch
```

spec.ts 파일 만들기만 하면 import 같은거 안해도 jest 프레임워크에 접근 가능함. 그냥 바로 코딩하면 된다.
`describe('name', () => {})`
다중으로 describe 를 겹쳐서 테스트 코드 선언 할 수 있음.'

## Mock function
함수가 얼마나 불렸는지, 무슨 파라미터가 들어갔는지 추적.
```typescript
  it('announces friendship', () => {
    const friendsList = new FriendsList();
    friendsList.announceFriendship = jest.fn(); // mock function 으로 처리
    expect(friendsList.announceFriendship).not.toHaveBeenCalled();
    friendsList.addFriend('Astro');
    expect(friendsList.announceFriendship).toHaveBeenCalled();
    expect(friendsList.announceFriendship).toHaveBeenCalledWith('Astro');
  });
```

## Mocking Repository
리포지토리를 직접 호출하는거는 DB가 엮이므로 mock을 만들어준다.
```typescript
const mockTaskRepository = () => ({
  // TaskRepository 의 getTasks 함수를 목함수로 갈아끼운다.
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
});
```
요걸 테스트 코드 작성할 때 beforeEach 문 안에서 `Test.createTestingModule` 을 활용해서 붙이고 결과물을 tasksService 로 만들어서 테스트 한다.
```typescript
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
```
## toEqual
```typescript
expect(result).toEqual(mockTask)
```

## beforeEach
반복되는거 dry

## Exception 테스트
콜백으로 함수를 넘겨서 .toThrow() 로 검증
```typescript
expect(() => friendsList.removeFriend('Astro')).toThrow(); // 일반 함수의 Exception
expect(tasksService.deleteTask(1)).rejects.toThrow(NotFoundException) // Promise 를 리턴하는 경우의 Exception Promise 의 성공을 테스트 하는 경우에는 rejects 대신에 다른거..
```


## Promise 테스트
가짜로 함수를 만들고 그 리턴 값이 promise 가 되게 하는 방법.
```typescript
tasksService.getTaskById = jest.fn() // 테스트용 함수
tasksService.getTaskById = jest.fn().mockResolvedValue() // 테스트용 함수가 Promise 를 리턴하도록
tasksService.getTaskById = jest.fn().mockResolvedValue({ status: TaskStatus.DONE }) // 테스트용 함수가 Promise 를 리턴하면서 결과물이 status 에 반응 하는 객체

```

## Test Scope
아래 상태에 있으면 save 메서드를 테스트 할 수 가 없음. 그래서 선언을 밖으로 빼고 해야함.
```typescript
  tasksService.getTaskById = jest.fn().mockResolvedValue({
    status: TaskStatus.OPEN,
    save: jest.fn().mockResolvedValue(true),
  })
```

```typescript
  const save = jest.fn().mockResolvedValue(true);
  tasksService.getTaskById = jest.fn().mockResolvedValue({
    status: TaskStatus.OPEN,
    save,
  })

  expect(save).toHaveBeenCalled();
```