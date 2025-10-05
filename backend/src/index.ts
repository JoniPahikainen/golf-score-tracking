import express from 'express';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import courseRoutes from './routes/courses';
import roundRoutes from './routes/rounds';
import friendRoutes from './routes/friends';
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/rounds', roundRoutes);
app.use('/api/friends', friendRoutes);

app.get('/', (req, res) => {
  res.send('Profile Service is running');
});


if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export { app };