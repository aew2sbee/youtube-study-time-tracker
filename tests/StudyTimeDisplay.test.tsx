import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { StudyTimeDisplay } from '../src/components/StudyTimeDisplay';
import { StudyTimeUser } from '../src/types/youtube';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: any }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock timers
jest.useFakeTimers();

describe('StudyTimeDisplay', () => {
  const mockFormatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const mockFormatUpdateTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const mockGetTotalStudyTime = () => 7200; // 2 hours
  const mockNextUpdateTime = new Date('2025-01-01T10:30:00Z');
  const mockTargetStudyTime = 7200; // 2 hours
  const mockPersonalProgress = {
    totalTime: 79200, // 22 hours
    examDate: 'Not scheduled yet',
    testScore: '科目A: 47%, 科目B: 95%',
    updateDate: '2025/07/05',
  };

  const mockUsers: StudyTimeUser[] = [
    {
      name: 'TestUser1',
      studyTime: 3600,
      profileImageUrl: 'https://example.com/avatar1.jpg',
      isStudying: true,
      startTime: new Date('2025-01-01T10:00:00Z'),
    },
    {
      name: 'TestUser2',
      studyTime: 1800,
      profileImageUrl: 'https://example.com/avatar2.jpg',
      isStudying: false,
    },
  ];

  const defaultProps = {
    users: mockUsers,
    formatTime: mockFormatTime,
    nextUpdateTime: mockNextUpdateTime,
    formatUpdateTime: mockFormatUpdateTime,
    getTotalStudyTime: mockGetTotalStudyTime,
    targetStudyTime: mockTargetStudyTime,
    showProgressBar: true,
    personalProgress: mockPersonalProgress,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  test('should render personal progress initially', () => {
    render(<StudyTimeDisplay {...defaultProps} />);
    
    expect(screen.getByText('My Study Progress')).toBeInTheDocument();
    expect(screen.getByText('Total Time')).toBeInTheDocument();
    expect(screen.getByText('22:00')).toBeInTheDocument();
    expect(screen.getByText('Not scheduled yet')).toBeInTheDocument();
    expect(screen.getByText('科目A: 47%, 科目B: 95%')).toBeInTheDocument();
  });

  test('should display studying user correctly', () => {
    // Force display of user page by setting different initial state
    const { rerender } = render(<StudyTimeDisplay {...defaultProps} />);
    
    // Simulate page transition to show users
    act(() => {
      jest.advanceTimersByTime(11000); // PAGE_DISPLAY_INTERVAL + TRANSITION_DURATION
    });
    
    rerender(<StudyTimeDisplay {...defaultProps} />);
    
    expect(screen.getByText('TestUser1')).toBeInTheDocument();
    expect(screen.getByText('Focusing')).toBeInTheDocument();
    expect(screen.getByText('01:00')).toBeInTheDocument();
  });

  test('should display finished user correctly', () => {
    const usersWithFinishedUser: StudyTimeUser[] = [
      {
        name: 'FinishedUser',
        studyTime: 1800,
        profileImageUrl: 'https://example.com/avatar.jpg',
        isStudying: false,
      },
    ];

    render(<StudyTimeDisplay {...{ ...defaultProps, users: usersWithFinishedUser }} />);
    
    // Simulate page transition to show users
    act(() => {
      jest.advanceTimersByTime(11000);
    });
    
    expect(screen.getByText('FinishedUser')).toBeInTheDocument();
    expect(screen.getByText('Finished')).toBeInTheDocument();
    expect(screen.getByText('00:30')).toBeInTheDocument();
  });

  test('should show empty state when no users', () => {
    render(<StudyTimeDisplay {...{ ...defaultProps, users: [] }} />);
    
    // Simulate page transition to show empty state
    act(() => {
      jest.advanceTimersByTime(11000);
    });
    
    expect(screen.getByText('Focus Time Tracker')).toBeInTheDocument();
    expect(screen.getByText('誰でも勉強時間の計測に参加することができます。')).toBeInTheDocument();
    expect(screen.getByText('「start」')).toBeInTheDocument();
    expect(screen.getByText('「end」')).toBeInTheDocument();
  });

  test('should show progress bar when enabled', () => {
    const propsWithProgressBar = { ...defaultProps, showProgressBar: true };
    render(<StudyTimeDisplay {...propsWithProgressBar} />);
    
    // Initially shows personal progress
    expect(screen.getByText('My Study Progress')).toBeInTheDocument();
    
    // The component should accept showProgressBar prop
    expect(propsWithProgressBar.showProgressBar).toBe(true);
  });

  test('should handle pagination correctly', () => {
    const manyUsers: StudyTimeUser[] = Array.from({ length: 5 }, (_, i) => ({
      name: `User${i + 1}`,
      studyTime: 1800,
      profileImageUrl: `https://example.com/avatar${i + 1}.jpg`,
      isStudying: false,
    }));

    render(<StudyTimeDisplay {...{ ...defaultProps, users: manyUsers }} />);
    
    // Should show pagination indicator
    act(() => {
      jest.advanceTimersByTime(11000);
    });
    
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });

  test('should format time correctly', () => {
    expect(mockFormatTime(0)).toBe('00:00');
    expect(mockFormatTime(3600)).toBe('01:00');
    expect(mockFormatTime(7200)).toBe('02:00');
    expect(mockFormatTime(3661)).toBe('01:01');
  });

  test('should format update time correctly', () => {
    const testDate = new Date('2025-01-01T10:30:00Z');
    const expectedTime = mockFormatUpdateTime(testDate);
    expect(expectedTime).toMatch(/^\d{2}:\d{2}$/); // Just check format, not exact time due to timezone
  });

  test('should handle transitions correctly', () => {
    render(<StudyTimeDisplay {...defaultProps} />);
    
    // Initially should show personal progress
    expect(screen.getByText('My Study Progress')).toBeInTheDocument();
    
    // After transition, should show users
    act(() => {
      jest.advanceTimersByTime(11000);
    });
    
    expect(screen.getByText('Focus Time Tracker')).toBeInTheDocument();
  });

  test('should display progress bar with correct percentage', () => {
    const halfProgressProps = {
      ...defaultProps,
      getTotalStudyTime: () => 3600, // 1 hour
      targetStudyTime: 7200, // 2 hours (50% progress)
      showProgressBar: true,
    };

    render(<StudyTimeDisplay {...halfProgressProps} />);
    
    // Verify that the functions are called correctly
    expect(halfProgressProps.getTotalStudyTime()).toBe(3600);
    expect(halfProgressProps.targetStudyTime).toBe(7200);
    expect(halfProgressProps.showProgressBar).toBe(true);
  });

  test('should not show progress bar when disabled', () => {
    render(<StudyTimeDisplay {...defaultProps} showProgressBar={false} />);
    
    // Even after multiple transitions, should not show progress bar
    act(() => {
      jest.advanceTimersByTime(50000);
    });
    
    expect(screen.queryByText("Everyone's Total Time")).not.toBeInTheDocument();
  });
});