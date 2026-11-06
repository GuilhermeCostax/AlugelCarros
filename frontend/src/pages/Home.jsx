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
          <p>Como agente, você poderá cadastrar automóveis, analisar pedidos de aluguel e executar contratos.</p>
        ) : (
          <p>Como cliente, você poderá manter seus dados, informar rendimentos e criar pedidos de aluguel.</p>
        )}
      </div>
    </>
  );
}
