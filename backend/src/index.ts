import express from 'express';
import profileRoutes from './routes/user';
import courses from './routes/course';
import rounds from './routes/round';
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/profiles', profileRoutes);
app.use('/api/courses', courses);
app.use('/api/rounds', rounds);


// Basic health check
app.get('/', (req, res) => {
  res.send('Profile Service is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});