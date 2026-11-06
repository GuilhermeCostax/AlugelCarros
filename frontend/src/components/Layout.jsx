import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { PERFIS } from '../utils/perfis';

export default function Layout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function sair() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/" className="marca">🚗 AluguelCarros</NavLink>
          <nav className="menu">
            <NavLink to="/" end>Início</NavLink>
          </nav>
          <div className="usuario">
            <span className="usuario-nome">{usuario.nome}</span>
            <span className={`badge badge-${usuario.perfil.toLowerCase()}`}>{PERFIS[usuario.perfil]}</span>
            <button className="btn btn-secundario btn-sm" onClick={sair}>Sair</button>
          </div>
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
