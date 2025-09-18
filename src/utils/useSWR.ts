import { User } from '@/types/users';

export const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const postUser = async (url: string, { arg }: { arg: User }) => {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  }).then((res) => res.json());
};

// YouTube コメント投稿用: ユーザー情報に加え任意の endFlag を渡せる
export const postYoutubeComment = async (url: string, { arg }: { arg: { user: User; flag: string } }) => {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  }).then((res) => res.json());
};
