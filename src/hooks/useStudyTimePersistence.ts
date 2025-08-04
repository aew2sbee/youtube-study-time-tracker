import { useState, useCallback } from 'react';
import { StudyTimeUser } from '@/types/youtube';
import { studyTimeDb } from '@/utils/db';

export const useStudyTimePersistence = () => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const saveUsers = useCallback(async (users: Map<string, StudyTimeUser>) => {
    try {
      await studyTimeDb.saveUsers(users);
    } catch (error) {
      console.error('Error saving users to database:', error);
    }
  }, []);

  const loadUsers = useCallback(async (): Promise<Map<string, StudyTimeUser>> => {
    try {
      const savedUsers = await studyTimeDb.loadUsers();
      setIsLoaded(true);
      return savedUsers;
    } catch (error) {
      console.error('Error loading users from database:', error);
      setIsLoaded(true);
      return new Map();
    }
  }, []);

  const getLastSaved = useCallback(async (): Promise<Date | null> => {
    try {
      return await studyTimeDb.getLastSaved();
    } catch (error) {
      console.error('Error getting last saved time:', error);
      return null;
    }
  }, []);

  return {
    isLoaded,
    saveUsers,
    loadUsers,
    getLastSaved,
  };
};