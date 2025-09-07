import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import tasksRouter from './routes/tasks.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

mongoose.connect('mongodb+srv://hirentss786hirentss786:hirentss786hirentss786@hirent.nddwt8z.mongodb.net/tasksdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use('/api/tasks', tasksRouter);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
