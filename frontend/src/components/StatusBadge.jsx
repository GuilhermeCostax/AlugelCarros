import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { STATUS } from '../utils/status';

const CORES = {
  PENDENTE: 'bg-amber-100 text-amber-800',
  APROVADO: 'bg-emerald-100 text-emerald-800',
  REPROVADO: 'bg-red-100 text-red-800',
  CONTRATADO: 'bg-blue-100 text-blue-800',
  CANCELADO: 'bg-zinc-100 text-zinc-600',
};

export default function StatusBadge({ status, className }) {
  return (
    <Badge variant="secondary" className={cn('font-semibold', CORES[status], className)}>
      {STATUS[status] ?? status}
    </Badge>
  );
}
