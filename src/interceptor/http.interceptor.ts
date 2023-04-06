import { Injectable, NestInterceptor, CallHandler, ExecutionContext } from '@nestjs/common'
import { map } from 'rxjs/operators'
import { Observable } from 'rxjs'
import { Logger } from '../utils/log4js'

// 自定义返回结构体
interface Response<T> {
  data: T
}

@Injectable()
export class HttpInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<Response<T>> {
    const req = context.getArgByIndex(1).req
    return next.handle().pipe(
      map(data => {
        const logFormat = ` <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
        Request original url: ${req.originalUrl}
        Method: ${req.method}
        IP: ${req.ip}
        Response data:\n ${JSON.stringify(data)}
        <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`
        Logger.info(logFormat)
        Logger.access(logFormat)
        return {
          data,
          code: 2000,
          message: 'Success',
        }
      }),
    )
  }
}
