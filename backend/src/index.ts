import express from 'express';
import profileRoutes from './routes/user'; // Adjust path as needed
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/profiles', profileRoutes);

// Basic health check
app.get('/', (req, res) => {
  res.send('Profile Service is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});