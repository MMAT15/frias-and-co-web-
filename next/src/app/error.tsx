'use client';
export default function Error({ error }: { error: Error }) {
  return (
    <div className="h-screen flex items-center justify-center">
      <h1 className="text-2xl font-bold">Algo salió mal</h1>
      <p className="mt-2">{error.message}</p>
    </div>
  );
}
