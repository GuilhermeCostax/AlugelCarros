import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

/** Login e cadastro: se já estiver logado, volta para o início. */
export default function RotaPublica() {
  const { usuario } = useAuth();
  return usuario ? <Navigate to="/" replace /> : <Outlet />;
}
