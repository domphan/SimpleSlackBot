import { Request } from 'express';

export interface ReqWithRawBody extends Request {
    rawBody: string;
}
