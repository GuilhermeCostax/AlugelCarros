import { Toaster } from '@/components/ui/sonner';
import AuthProvider from './context/AuthProvider';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster theme="light" richColors position="top-right" />
    </AuthProvider>
  );
}
