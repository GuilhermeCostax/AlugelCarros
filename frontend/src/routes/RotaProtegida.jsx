import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

/** Só renderiza as rotas filhas se houver usuário logado (e, opcionalmente, com um dos perfis). */
export default function RotaProtegida({ perfis }) {
  const { usuario } = useAuth();
  const location = useLocation();

  if (!usuario) return <Navigate to="/login" replace state={{ de: location }} />;
  if (perfis && !perfis.includes(usuario.perfil)) return <Navigate to="/" replace />;
  return <Outlet />;
}
