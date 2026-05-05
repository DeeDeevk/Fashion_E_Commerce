import express from 'express';
import cors from 'cors';
import userRoutes from './modules/user/user.routes.js';
import accountRoutes from './modules/account/account.routes.js';
import addressRoutes from './modules/address/address.routes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/customer', userRoutes);
app.use('/accounts', accountRoutes);
app.use('/addresses', addressRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.statusCode || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
});

export default app;
