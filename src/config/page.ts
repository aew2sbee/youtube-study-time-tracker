import { ReactElement } from 'react';
import { parameter } from './system';
import { StudyTimeUser } from '@/types/youtube';

interface PageConfig {
  key: string;
  title: string;
  component: ReactElement;
}




export const createPageComponent = (user: StudyTimeUser[]): PageConfig => {
  const totalUserPages = Math.ceil(user.length / parameter.USERS_PER_PAGE);

  // ユーザーページを動的に生成
  const userPages = Array.from({ length: totalUserPages }, (_, pageIndex) => {
    const startIndex = pageIndex * parameter.USERS_PER_PAGE;
    const endIndex = startIndex + parameter.USERS_PER_PAGE;
    const pageUsers = user.slice(startIndex, endIndex);

    return {
      key: `users-${pageIndex}`,
      title: totalUserPages > 1 ? `Focus Tracker (${pageIndex + 1}/${totalUserPages})` : 'Focus Tracker',
      component: (
        <UserListPage 
          users={pageUsers} 
          pageIndex={pageIndex} 
          totalPages={totalUserPages} 
        />
      ),
    };
  });
}



