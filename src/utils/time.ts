import { parameter } from "@/config/system";
import { User } from "@/types/users";

export const calcStudyTime = (start: Date, end: Date): number => {
  const diffMs = end.getTime() - start.getTime();
  const safeDiffMs = Math.max(diffMs, 0); // マイナスにならないように
  return Math.floor(safeDiffMs / 1000);
}
export const calcTotalTime = (users: User[]): number => {
  const total = users.reduce((total, u) => total + u.studyTime, parameter.ADDITIONAL_STUDY_TIME)
  console.debug(`total: ${total}`);
  return total;
}