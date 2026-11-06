import { Skeleton } from '@/components/ui/skeleton';

export default function Carregando() {
  return (
    <div className="space-y-3" aria-busy="true">
      <span className="sr-only">Carregando…</span>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}
