import { Handler } from 'aws-lambda';
import { bootstrap } from './main';

let server: Handler;

export const handler: Handler = async (event, context, callback) => {
  server = server ?? (await bootstrap());

  return server(event, context, callback);
};
