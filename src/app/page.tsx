import Damier from '@/components/Damier';

export default function Home() {
  return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-2">Damier 4x6</h1>
        <Damier />
      </main>
  );
}

