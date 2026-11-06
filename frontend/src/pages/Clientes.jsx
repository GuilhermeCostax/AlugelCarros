import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Alerta from '../components/Alerta';
import Carregando from '../components/Carregando';
import { excluirCliente, listarClientes } from '../services/clienteService';
import { mensagemDeErro } from '../utils/erro';
import { cpf, moeda } from '../utils/formatos';

export default function Clientes() {
  const [clientes, setClientes] = useState(null);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    listarClientes().then(setClientes).catch((e) => setErro(mensagemDeErro(e)));
  }, []);

  async function excluir(cliente) {
    if (!window.confirm(`Excluir o cliente ${cliente.nome}?`)) return;
    try {
      await excluirCliente(cliente.id);
      setClientes((lista) => lista.filter((c) => c.id !== cliente.id));
    } catch (e) {
      setErro(mensagemDeErro(e));
    }
  }

  const termo = busca.trim().toLowerCase();
  const filtrados = (clientes ?? []).filter(
    (c) => !termo || c.nome.toLowerCase().includes(termo) || c.cpf.includes(termo.replace(/\D/g, '') || '§'),
  );

  return (
    <>
      <div className="cabecalho-pagina">
        <div>
          <h1>Clientes</h1>
          <p className="subtitulo">Cadastro de clientes e seus rendimentos.</p>
        </div>
        <Link to="/clientes/novo" className="btn btn-primario">+ Novo cliente</Link>
      </div>

      <Alerta>{erro}</Alerta>

      {clientes === null ? (
        !erro && <Carregando />
      ) : (
        <div className="card card-tabela">
          <div className="barra-tabela">
            <input
              className="busca"
              placeholder="Buscar por nome ou CPF"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              aria-label="Buscar clientes"
            />
            <span className="contagem">{filtrados.length} cliente(s)</span>
          </div>
          <div className="tabela-rolagem">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>Profissão</th>
                  <th>Rendimentos</th>
                  <th className="num">Renda total</th>
                  <th aria-label="Ações" />
                </tr>
              </thead>
              <tbody>
                {filtrados.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.nome}</strong>
                      <div className="texto-suave">{c.login}</div>
                    </td>
                    <td>{cpf(c.cpf)}</td>
                    <td>{c.profissao}</td>
                    <td>{c.rendimentos.length} / 3</td>
                    <td className="num">{moeda(c.rendaTotal)}</td>
                    <td className="acoes-linha">
                      <Link to={`/clientes/${c.id}/editar`} className="btn btn-secundario btn-sm">Editar</Link>
                      <button className="btn btn-perigo btn-sm" onClick={() => excluir(c)}>Excluir</button>
                    </td>
                  </tr>
                ))}
                {filtrados.length === 0 && (
                  <tr>
                    <td colSpan={6} className="vazio">Nenhum cliente encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
