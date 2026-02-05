import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Eğer decorator'a @CurrentUser('email') gibi bir veri geçilirse onu döndür, yoksa objenin tamamını döndür
    return data ? user?.[data] : user;
  },
);
