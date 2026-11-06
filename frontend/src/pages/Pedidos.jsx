import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Alerta from '../components/Alerta';
import Carregando from '../components/Carregando';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/useAuth';
import { listarPedidos } from '../services/pedidoService';
import { mensagemDeErro } from '../utils/erro';
import { data, placa } from '../utils/formatos';
import { ehAgente } from '../utils/perfis';
import { STATUS } from '../utils/status';

export default function Pedidos() {
  const { usuario } = useAuth();
  const agente = ehAgente(usuario.perfil);
  const [pedidos, setPedidos] = useState(null);
  const [erro, setErro] = useState('');
  const [filtro, setFiltro] = useState(agente ? 'PENDENTE' : 'TODOS');

  useEffect(() => {
    listarPedidos().then(setPedidos).catch((e) => setErro(mensagemDeErro(e)));
  }, []);

  const contagem = (status) => (pedidos ?? []).filter((p) => p.status === status).length;
  const visiveis = (pedidos ?? []).filter((p) => filtro === 'TODOS' || p.status === filtro);

  return (
    <>
      <div className="cabecalho-pagina">
        <div>
          <h1>{agente ? 'Pedidos de aluguel' : 'Meus pedidos'}</h1>
          <p className="subtitulo">
            {agente ? 'Analise os pedidos e execute os contratos aprovados.' : 'Acompanhe o status dos seus pedidos.'}
          </p>
        </div>
        {!agente && <Link to="/pedidos/novo" className="btn btn-primario">+ Novo pedido</Link>}
      </div>

      <Alerta>{erro}</Alerta>

      {pedidos === null ? (
        !erro && <Carregando />
      ) : (
        <div className="card card-tabela">
          <div className="abas" role="tablist">
            {['TODOS', ...Object.keys(STATUS)].map((s) => (
              <button
                key={s}
                role="tab"
                aria-selected={filtro === s}
                className={filtro === s ? 'ativa' : ''}
                onClick={() => setFiltro(s)}
              >
                {s === 'TODOS' ? 'Todos' : STATUS[s]}
                <span className="contador">{s === 'TODOS' ? pedidos.length : contagem(s)}</span>
              </button>
            ))}
          </div>
          <div className="tabela-rolagem">
            <table className="tabela">
              <thead>
                <tr>
                  <th>#</th>
                  {agente && <th>Cliente</th>}
                  <th>Automóvel</th>
                  <th>Período</th>
                  <th>Status</th>
                  <th aria-label="Ações" />
                </tr>
              </thead>
              <tbody>
                {visiveis.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    {agente && <td><strong>{p.cliente.nome}</strong></td>}
                    <td>
                      {p.automovel.marca} {p.automovel.modelo}
                      <div className="texto-suave">{placa(p.automovel.placa)}</div>
                    </td>
                    <td>
                      {data(p.dataInicio)} a {data(p.dataFim)}
                      <div className="texto-suave">{p.diarias} diária(s)</div>
                    </td>
                    <td><StatusBadge status={p.status} /></td>
                    <td className="acoes-linha">
                      <Link to={`/pedidos/${p.id}`} className="btn btn-secundario btn-sm">
                        {agente && p.status === 'PENDENTE' ? 'Avaliar' : 'Detalhes'}
                      </Link>
                    </td>
                  </tr>
                ))}
                {visiveis.length === 0 && (
                  <tr><td colSpan={agente ? 6 : 5} className="vazio">Nenhum pedido encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
