import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { listarPedidos } from '../services/pedidoService';
import { PERFIS, ehAgente } from '../utils/perfis';
import { STATUS } from '../utils/status';

export default function Home() {
  const { usuario } = useAuth();
  const agente = ehAgente(usuario.perfil);
  const [pedidos, setPedidos] = useState(null);

  useEffect(() => {
    listarPedidos().then(setPedidos).catch(() => setPedidos([]));
  }, []);

  const contagem = (status) => (pedidos ?? []).filter((p) => p.status === status).length;

  const atalhos = agente
    ? [
        { to: '/pedidos', titulo: 'Analisar pedidos', texto: 'Avalie pedidos pendentes e execute contratos.' },
        { to: '/automoveis', titulo: 'Automóveis', texto: 'Cadastre e mantenha a frota.' },
        { to: '/clientes', titulo: 'Clientes', texto: 'Consulte dados e rendimentos dos clientes.' },
        { to: '/contratos', titulo: 'Contratos', texto: usuario.perfil === 'BANCO' ? 'Conceda crédito aos contratos.' : 'Acompanhe os contratos executados.' },
      ]
    : [
        { to: '/pedidos/novo', titulo: 'Novo pedido', texto: 'Escolha um automóvel e o período.' },
        { to: '/pedidos', titulo: 'Meus pedidos', texto: 'Consulte, modifique ou cancele pedidos.' },
        { to: '/meus-dados', titulo: 'Meus dados', texto: 'Atualize seus dados e rendimentos.' },
        { to: '/contratos', titulo: 'Meus contratos', texto: 'Veja contratos e créditos.' },
      ];

  return (
    <>
      <h1>Olá, {usuario.nome}!</h1>
      <p className="subtitulo">Você está conectado como <strong>{PERFIS[usuario.perfil]}</strong>.</p>

      <div className="resumo">
        {Object.entries(STATUS).map(([status, rotulo]) => (
          <div key={status} className={`resumo-item resumo-${status.toLowerCase()}`}>
            <span className="resumo-valor">{pedidos === null ? '–' : contagem(status)}</span>
            <span className="resumo-rotulo">{rotulo}</span>
          </div>
        ))}
      </div>

      <div className="atalhos">
        {atalhos.map((a) => (
          <Link key={a.to} to={a.to} className="card atalho">
            <strong>{a.titulo}</strong>
            <span>{a.texto}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
