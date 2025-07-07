import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../src/app/page';

// Mock the useStudyTime hook
jest.mock('../src/hooks/useStudyTime', () => ({
  useStudyTime: () => ({
    users: [
      {
        name: 'TestUser',
        studyTime: 3600,
        profileImageUrl: 'https://example.com/avatar.jpg',
        isStudying: true,
        startTime: new Date('2025-01-01T10:00:00Z'),
      },
    ],
    nextUpdateTime: new Date('2025-01-01T10:30:00Z'),
    formatTime: (seconds: number) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    },
    formatUpdateTime: (date: Date) => {
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    },
    getTotalStudyTime: () => 3600,
    targetStudyTime: 7200,
    showProgressBar: true,
    personalProgress: {
      totalTime: 79200,
      examDate: 'Not scheduled yet',
      testScore: '科目A: 47%, 科目B: 95%',
      updateDate: '2025/07/05',
    },
  }),
}));

// Mock StudyTimeDisplay component
jest.mock('../src/components/StudyTimeDisplay', () => ({
  StudyTimeDisplay: ({ users, formatTime, personalProgress }: any) => (
    <div data-testid="study-time-display">
      <h1>Study Time Display</h1>
      <div>Users: {users.length}</div>
      <div>Personal Progress: {formatTime(personalProgress.totalTime)}</div>
      <div>Update Date: {personalProgress.updateDate}</div>
    </div>
  ),
}));

describe('Home Page', () => {
  test('should render StudyTimeDisplay component', () => {
    render(<Home />);
    
    expect(screen.getByTestId('study-time-display')).toBeInTheDocument();
    expect(screen.getByText('Study Time Display')).toBeInTheDocument();
  });

  test('should pass correct props to StudyTimeDisplay', () => {
    render(<Home />);
    
    expect(screen.getByText('Users: 1')).toBeInTheDocument();
    expect(screen.getByText('Personal Progress: 22:00')).toBeInTheDocument();
    expect(screen.getByText('Update Date: 2025/07/05')).toBeInTheDocument();
  });

  test('should integrate useStudyTime hook correctly', () => {
    render(<Home />);
    
    // Verify that the hook data is being passed to the component
    const studyTimeDisplay = screen.getByTestId('study-time-display');
    expect(studyTimeDisplay).toBeInTheDocument();
    
    // Check if the mocked hook data is displayed
    expect(screen.getByText('Users: 1')).toBeInTheDocument();
  });
});