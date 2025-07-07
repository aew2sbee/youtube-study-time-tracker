// Jest setup file for additional configuration
require('@testing-library/jest-dom');

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

// Mock environment variables
process.env.YOUTUBE_API_KEY = 'test-api-key';
process.env.VIDEO_ID = 'test-video-id';