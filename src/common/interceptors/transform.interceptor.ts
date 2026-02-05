import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { IGenericResponse } from 'src/common/interfaces/generic-response.interface';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  IGenericResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IGenericResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((data: unknown) => {
        const isObject = data !== null && typeof data === 'object';

        // Ensure type safety by casting
        const dataObj = isObject ? (data as Record<string, unknown>) : {};

        const message = dataObj.message || 'Request successful';

        // Extract message from data
        let finalData = data;
        if (isObject && 'message' in dataObj) {
          const { message: _, ...rest } = dataObj; // Using _ to discard message property
          finalData = rest;
        }

        // Safely convert message to string
        let messageString: string;
        if (typeof message === 'string') {
          messageString = message;
        } else if (Array.isArray(message)) {
          messageString = message.join(', ');
        } else if (message === null || message === undefined) {
          messageString = 'Request successful';
        } else if (
          typeof message === 'number' ||
          typeof message === 'boolean' ||
          typeof message === 'symbol' ||
          typeof message === 'bigint'
        ) {
          // Primitives: number, boolean, symbol, bigint
          messageString = String(message);
        } else {
          // Fallback: any other type (including objects)
          messageString = JSON.stringify(message);
        }

        return {
          success: true,
          statusCode: response.statusCode,
          meta: {
            path: request.url,
            method: request.method,
            message: messageString,
            timestamp: new Date().toISOString(),
          },
          data: finalData as T,
        };
      }),
    );
  }
}
