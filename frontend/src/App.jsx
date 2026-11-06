import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import AuthProvider from './context/AuthProvider';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <AppRoutes />
        <Toaster theme="light" richColors position="top-right" />
      </TooltipProvider>
    </AuthProvider>
  );
}
