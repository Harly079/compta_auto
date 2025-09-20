import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { router as healthRouter } from './routes/health.js';
import { router as whatsappRouter } from './routes/webhook.whatsapp.js';
import { router as pdfRouter } from './routes/pdf.js';
import { router as aiRouter } from './routes/ai.classify.js';

const app = express();

app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }
}));
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

app.use('/health', healthRouter);
app.use('/webhook/whatsapp', whatsappRouter);
app.use('/pdf', pdfRouter);
app.use('/ai', aiRouter);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const port = process.env.PORT ? Number(process.env.PORT) : 8080;
app.listen(port, () => {
  console.log(`Compta-Auto API listening on port ${port}`);
});
