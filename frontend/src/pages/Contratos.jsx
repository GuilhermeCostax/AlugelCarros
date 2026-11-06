import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Alerta from '../components/Alerta';
import Carregando from '../components/Carregando';
import { useAuth } from '../context/useAuth';
import { listarContratos } from '../services/contratoService';
import { mensagemDeErro } from '../utils/erro';
import { data, moeda } from '../utils/formatos';
import { ehAgente } from '../utils/perfis';
import { TIPOS_PROPRIETARIO } from '../utils/status';

export default function Contratos() {
  const { usuario } = useAuth();
  const [contratos, setContratos] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    listarContratos().then(setContratos).catch((e) => setErro(mensagemDeErro(e)));
  }, []);

  return (
    <>
      <div className="cabecalho-pagina">
        <div>
          <h1>{ehAgente(usuario.perfil) ? 'Contratos' : 'Meus contratos'}</h1>
          <p className="subtitulo">Contratos de aluguel executados e créditos associados.</p>
        </div>
      </div>
      <Alerta>{erro}</Alerta>
      {contratos === null ? (
        !erro && <Carregando />
      ) : (
        <div className="card card-tabela">
          <div className="tabela-rolagem">
            <table className="tabela">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>Automóvel</th>
                  <th>Assinatura</th>
                  <th>Registro</th>
                  <th className="num">Valor</th>
                  <th>Crédito</th>
                  <th aria-label="Ações" />
                </tr>
              </thead>
              <tbody>
                {contratos.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.cliente}</td>
                    <td>{c.automovel}</td>
                    <td>{data(c.dataAssinatura)}</td>
                    <td>{TIPOS_PROPRIETARIO[c.tipoProprietario]}</td>
                    <td className="num">{moeda(c.valorTotal)}</td>
                    <td>
                      {c.credito
                        ? `${c.credito.numeroParcelas}x ${moeda(c.credito.valorParcela)} (${c.credito.banco.nome})`
                        : '—'}
                    </td>
                    <td className="acoes-linha">
                      <Link to={`/pedidos/${c.pedidoId}`} className="btn btn-secundario btn-sm">Ver pedido</Link>
                    </td>
                  </tr>
                ))}
                {contratos.length === 0 && (
                  <tr><td colSpan={8} className="vazio">Nenhum contrato ainda.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
