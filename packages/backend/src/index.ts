import { createApp } from './app.js';
import { logger } from './utils/logger.js';

const PORT = parseInt(process.env.PORT || '3001', 10);

const app = createApp();

app.listen(PORT, () => {
  logger.info(`notg-reader backend running on port ${PORT}`);
});
