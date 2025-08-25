import { config } from 'dotenv';

// Load environment variables for testing
config({ path: '.env' });

// Set test environment
process.env.NODE_ENV = 'test';

// Global test timeout
jest.setTimeout(30000);

// Global test setup
beforeAll(async () => {
  // Any global setup can go here
  console.log('🧪 Starting API Integration Tests...');
});

// Global test teardown
afterAll(async () => {
  // Any global cleanup can go here
  console.log('✅ API Integration Tests completed');
});
