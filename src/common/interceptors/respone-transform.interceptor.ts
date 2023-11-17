import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}

@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    
    const excludePaths = ['metrics'];
    const request = context.switchToHttp().getRequest();
    let IgnoredPaths = ['/auth-service/api/metrics'];
    if (IgnoredPaths.includes(request.url)) return next.handle();
    return next.handle().pipe(
      map((data) =>{
        if(!data) return {
          status:true,
          message:true,
          data:true
        }
        return ({
          status: data['status'] ? data['status'] : true,
          message: data['message'],
          data: data['result'] ? data['result'] : data['data'],
        })
      }
       ),
    );
  }
}
