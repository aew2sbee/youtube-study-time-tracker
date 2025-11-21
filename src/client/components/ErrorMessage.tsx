export default function ErrorMessage({ error }: { error?: Error | null }) {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-red-500 text-black p-6 rounded-lg max-w-md">
        <h2 className="text-xl font-bold mb-2">エラーが発生しました</h2>
        <p className="text-sm">
          {error?.message || 'データの取得に失敗しました。しばらく待ってから再度お試しください。'}
        </p>
      </div>
    </div>
  );
}
