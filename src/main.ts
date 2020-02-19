import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import * as config from 'config';

async function bootstrap() {
  const serverConfig = config.get('server'); // yml 에서 server: 아래에 정의 된걸 object 로 뽑아온다.
  const logger = new Logger('bootstrap'); // 기본으로 찍히는 context 이다.
  const app = await NestFactory.create(AppModule);

  if (process.env.NODE_ENV === 'development') {
    app.enableCors(); // 어떤 api에서의 요청을 허용할지..
  }

  const port = process.env.PORT || serverConfig.port; // env 먼저 체크하고 없으면 yml 에서
  await app.listen(port);
  logger.log(`Application listening on ${port} `)
}
bootstrap();