import useSWR from 'swr';
export { useSWR };

/**
 * デフォルトのfetcher関数
 * fetch APIを使ってJSONデータを取得する
 * @param url - 取得するURL
 * @returns JSONレスポンス
 */
export const fetcher = (url: string) => fetch(url).then((res) => res.json());
