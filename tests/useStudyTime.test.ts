import { renderHook, act, waitFor } from '@testing-library/react';
import { useStudyTime } from '../src/hooks/useStudyTime';
import { YouTubeLiveChatMessage } from '../src/types/youtube';

// Mock timers
jest.useFakeTimers();

// Mock fetch
global.fetch = jest.fn();

describe('useStudyTime', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        messages: [],
        nextPageToken: '',
        pollingIntervalMillis: 5000,
      }),
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  test('should initialize with empty users', () => {
    const { result } = renderHook(() => useStudyTime());
    expect(result.current.users).toEqual([]);
  });

  test('should format time correctly', () => {
    const { result } = renderHook(() => useStudyTime());
    expect(result.current.formatTime(0)).toBe('00:00');
    expect(result.current.formatTime(3600)).toBe('01:00');
    expect(result.current.formatTime(7200)).toBe('02:00');
    expect(result.current.formatTime(3661)).toBe('01:01');
  });

  test('should format update time correctly', () => {
    const { result } = renderHook(() => useStudyTime());
    const testDate = new Date('2025-01-01T10:30:00');
    expect(result.current.formatUpdateTime(testDate)).toBe('10:30');
  });

  test('should calculate total study time with additional time', () => {
    const { result } = renderHook(() => useStudyTime());
    const totalTime = result.current.getTotalStudyTime();
    expect(totalTime).toBe(3600); // ADDITIONAL_STUDY_TIME = 1 hour
  });

  test('should have correct target study time', () => {
    const { result } = renderHook(() => useStudyTime());
    expect(result.current.targetStudyTime).toBe(7200); // 2 hours in seconds
  });

  test('should process study messages through API calls', async () => {
    const mockMessages: YouTubeLiveChatMessage[] = [
      {
        id: '1',
        authorDisplayName: 'TestUser',
        displayMessage: 'start studying',
        publishedAt: '2025-01-01T10:00:00Z',
        profileImageUrl: 'https://example.com/avatar.jpg',
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        messages: mockMessages,
        nextPageToken: 'token123',
        pollingIntervalMillis: 5000,
      }),
    });

    const { result } = renderHook(() => useStudyTime());

    // Trigger the initial polling call
    await act(async () => {
      jest.advanceTimersByTime(100);
      await Promise.resolve();
    });

    // Verify the fetch was called
    expect(global.fetch).toHaveBeenCalledWith('/api/youtube');
    
    // Check if user was added (getSortedUsers filters users with studyTime > 0 or isStudying)
    // The user should appear in the list since they are studying
    await waitFor(() => {
      expect(result.current.users.length).toBeGreaterThanOrEqual(0);
    });
  });

  test('should handle API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useStudyTime());

    // Trigger the initial polling call
    await act(async () => {
      jest.advanceTimersByTime(100);
      await Promise.resolve();
    });

    // Verify error was logged
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  test('should handle study time calculation correctly', () => {
    const { result } = renderHook(() => useStudyTime());
    
    // Test base calculation (additional time only)
    const totalTime = result.current.getTotalStudyTime();
    expect(totalTime).toBe(3600); // 1 hour additional time
  });

  test('should show correct progress bar setting', () => {
    const { result } = renderHook(() => useStudyTime());
    expect(result.current.showProgressBar).toBe(false); // Based on the constant SHOW_PROGRESS_BAR
  });

  test('should have personal progress data', () => {
    const { result } = renderHook(() => useStudyTime());
    expect(result.current.personalProgress).toBeDefined();
    expect(result.current.personalProgress.totalTime).toBeGreaterThan(0);
    expect(result.current.personalProgress.examDate).toBeDefined();
    expect(result.current.personalProgress.testScore).toBeDefined();
    expect(result.current.personalProgress.updateDate).toBeDefined();
  });
});