import { SetMetadata } from '@nestjs/common';
import { Action } from '../enums/action.enum';

export const CHECK_POLICIES_KEY = 'check_policy';

// Bir endpoint için birden fazla politika kontrolü yapabilmek için
export const CheckPolicies = (...action: Action[]) =>
  SetMetadata(CHECK_POLICIES_KEY, action);
