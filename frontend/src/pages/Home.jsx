import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { PERFIS, ehAgente } from '../utils/perfis';

export default function Home() {
  const { usuario } = useAuth();

  return (
    <>
      <h1>Olá, {usuario.nome}!</h1>
      <p className="subtitulo">Você está conectado como <strong>{PERFIS[usuario.perfil]}</strong>.</p>

      <div className="card">
        {ehAgente(usuario.perfil) ? (
          <p>
            Como agente, você pode <Link to="/clientes">gerenciar os clientes</Link>, e em breve cadastrar automóveis,
            analisar pedidos de aluguel e executar contratos.
          </p>
        ) : (
          <p>
            Como cliente, você pode <Link to="/meus-dados">manter seus dados e rendimentos</Link>, e em breve criar
            pedidos de aluguel.
          </p>
        )}
      </div>
    </>
  );
}
