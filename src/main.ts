import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as fs from 'fs';
import * as YAML from 'yaml';
import { gConfig, initConfig, initContract, initJsonRpcProvider} from './global';
import * as express  from 'express';
import { ValidationPipe } from '@nestjs/common';
import { logger } from './middleware/logger.middleware'
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { HttpInterceptor } from './interceptor/http.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
  //获取配置
  const config = YAML.parse(fs.readFileSync("./config.yaml", 'utf8'))
  initConfig(config)

  //初始化合约信息
  for (const item of config.contracts) {
    initContract(item.address,{abi:JSON.parse(fs.readFileSync(item.abi,"utf8")),topic:item.topic})
  }

  //初始化连接
  initJsonRpcProvider(config.jsonRpc)

  // http方式启动
  const app = await NestFactory.create(AppModule)

  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  // 全局参数校验
  app.useGlobalPipes(new ValidationPipe({transform:true, transformOptions: { enableImplicitConversion: true }}))
  // 监听所有的请求路由，并打印日志
  app.use(logger)
  // 注册全局http异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter())
  // 注册全局http拦截器
  app.useGlobalInterceptors(new HttpInterceptor())
  // 设置全局根路由
  app.setGlobalPrefix(gConfig.baseUrl)
  // 设置跨域
  app.enableCors()

  // swagger 相关配置
  const options = new DocumentBuilder().setTitle('NestJsWeb').setDescription('The NestJsWeb API description').setVersion('1.0').addTag('NestJsWeb').addBearerAuth().build()
  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup('/api', app, document)

  await app.listen(gConfig.serverPort)
}
bootstrap();
