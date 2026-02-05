export interface IGenericResponse<T> {
  success: boolean;
  statusCode: number;
  meta: {
    path: string;
    method: string;
    message: string;
    timestamp: string;
  };
  data: T;
}
