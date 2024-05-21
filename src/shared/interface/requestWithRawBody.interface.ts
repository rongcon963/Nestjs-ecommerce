import { Request } from 'express';
 
interface RequestWithRawBody extends Request {
  rawBody: Buffer;
  url: string;
}
 
export default RequestWithRawBody;