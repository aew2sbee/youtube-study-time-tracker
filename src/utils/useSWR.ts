import { User } from '@/types/users';

export const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const postLowdb = async (url: string, { arg }: { arg: User }) => {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  }).then((res) => res.json());
};

export const postYouTubeComment = async (url: string, { arg }: { arg: { message: string } }) => {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  }).then((res) => res.json());
};
