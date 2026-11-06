import { Car } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Logo({ grande = false, className }) {
  return (
    <span className={cn('inline-flex items-center gap-2 font-semibold tracking-tight', className)}>
      <span
        className={cn(
          'flex items-center justify-center rounded-lg bg-primary text-primary-foreground',
          grande ? 'size-10' : 'size-7',
        )}
      >
        <Car className={grande ? 'size-5' : 'size-4'} />
      </span>
      <span className={grande ? 'text-xl' : 'text-base'}>AluguelCarros</span>
    </span>
  );
}
