import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import router from './app/routes';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';

const app: Application = express();

app.use(express.json());
// app.use(cors());
app.use(cookieParser());

app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  }),
);
// app.use(
//   cors({
//     origin: 'https://fishcove-client.vercel.app',
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//     credentials: true,
//   }),
// );
// app.options('*', cors());
app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to fishCove!');
});

app.use(globalErrorHandler);

app.use(notFound);
export default app;
