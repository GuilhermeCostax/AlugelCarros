import { CircleAlert, CircleCheck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Alerta({ tipo = 'erro', children }) {
  if (!children) return null;
  if (tipo === 'erro') {
    return (
      <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
        <CircleAlert />
        <AlertDescription>{children}</AlertDescription>
      </Alert>
    );
  }
  return (
    <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
      <CircleCheck />
      <AlertDescription className="text-emerald-800">{children}</AlertDescription>
    </Alert>
  );
}
