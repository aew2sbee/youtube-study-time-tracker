import { User } from '@/types/users';
import GameMode from './GameMode';
import FocusMode from './FocusMode';

export default function Display({ user }: { user: User[] }) {
  if (!user || user.length === 0) {
    return (
      <div className="text-black text-center text-3xl flex-1 flex items-start justify-center pt-16">
        <div className="space-y-2">
          <div>現在、参加者はいません</div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-4 flex-1 overflow-hidden p-2">
      {user.map((u) => (
        u.isGameMode ? (
          <GameMode key={u.displayName} user={u} />
        ) : (
          <FocusMode key={u.displayName} user={u} />
        )
      ))}
    </div>
  );
}
