import { useEffect, useState } from 'react';
import Alerta from '../components/Alerta';
import Campo from '../components/Campo';
import Carregando from '../components/Carregando';
import { atualizarAutomovel, criarAutomovel, excluirAutomovel, listarAutomoveis } from '../services/automovelService';
import { mensagemDeErro } from '../utils/erro';
import { placa } from '../utils/formatos';
import { PERFIS } from '../utils/perfis';

const VAZIO = { matricula: '', ano: '', marca: '', modelo: '', placa: '' };

export default function Automoveis() {
  const [automoveis, setAutomoveis] = useState(null);
  const [form, setForm] = useState(VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [erro, setErro] = useState('');
  const [erroLista, setErroLista] = useState('');
  const [enviando, setEnviando] = useState(false);

  const carregar = () => listarAutomoveis().then(setAutomoveis).catch((e) => setErroLista(mensagemDeErro(e)));
  useEffect(() => {
    carregar();
  }, []);

  const alterar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  function editar(a) {
    setEditandoId(a.id);
    setForm({ matricula: a.matricula, ano: a.ano, marca: a.marca, modelo: a.modelo, placa: a.placa });
    setErro('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function limpar() {
    setEditandoId(null);
    setForm(VAZIO);
    setErro('');
  }

  async function salvar(e) {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    const dados = { ...form, ano: Number(form.ano) };
    try {
      if (editandoId) await atualizarAutomovel(editandoId, dados);
      else await criarAutomovel(dados);
      limpar();
      await carregar();
    } catch (err) {
      setErro(mensagemDeErro(err));
    } finally {
      setEnviando(false);
    }
  }

  async function excluir(a) {
    if (!window.confirm(`Excluir o automóvel ${a.marca} ${a.modelo} (${placa(a.placa)})?`)) return;
    setErroLista('');
    try {
      await excluirAutomovel(a.id);
      setAutomoveis((lista) => lista.filter((x) => x.id !== a.id));
    } catch (err) {
      setErroLista(mensagemDeErro(err));
    }
  }

  return (
    <>
      <div className="cabecalho-pagina">
        <div>
          <h1>Automóveis</h1>
          <p className="subtitulo">Frota disponível para aluguel.</p>
        </div>
      </div>

      <form className="card" onSubmit={salvar}>
        <h2 className="secao">{editandoId ? 'Editar automóvel' : 'Cadastrar automóvel'}</h2>
        <div className="grade-3">
          <Campo label="Marca" id="marca" value={form.marca} onChange={alterar} required />
          <Campo label="Modelo" id="modelo" value={form.modelo} onChange={alterar} required />
          <Campo label="Ano" id="ano" type="number" min="1950" max="2100" value={form.ano} onChange={alterar} required />
          <Campo label="Placa" id="placa" value={form.placa} onChange={alterar} placeholder="ABC1D23" required />
          <Campo label="Matrícula" id="matricula" value={form.matricula} onChange={alterar} required />
        </div>
        <Alerta>{erro}</Alerta>
        <div className="acoes">
          {editandoId && <button type="button" className="btn btn-secundario" onClick={limpar}>Cancelar</button>}
          <button className="btn btn-primario" disabled={enviando}>
            {enviando ? 'Salvando…' : editandoId ? 'Salvar alterações' : 'Cadastrar'}
          </button>
        </div>
      </form>

      <Alerta>{erroLista}</Alerta>
      {automoveis === null ? (
        !erroLista && <Carregando />
      ) : (
        <div className="card card-tabela">
          <div className="tabela-rolagem">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Automóvel</th>
                  <th>Placa</th>
                  <th>Matrícula</th>
                  <th>Proprietário</th>
                  <th aria-label="Ações" />
                </tr>
              </thead>
              <tbody>
                {automoveis.map((a) => (
                  <tr key={a.id}>
                    <td><strong>{a.marca} {a.modelo}</strong> <span className="texto-suave">{a.ano}</span></td>
                    <td>{placa(a.placa)}</td>
                    <td>{a.matricula}</td>
                    <td>
                      {a.proprietario ? (
                        <>{a.proprietario.nome} <span className="texto-suave">({PERFIS[a.proprietario.perfil]})</span></>
                      ) : '—'}
                    </td>
                    <td className="acoes-linha">
                      <button className="btn btn-secundario btn-sm" onClick={() => editar(a)}>Editar</button>
                      <button className="btn btn-perigo btn-sm" onClick={() => excluir(a)}>Excluir</button>
                    </td>
                  </tr>
                ))}
                {automoveis.length === 0 && (
                  <tr><td colSpan={5} className="vazio">Nenhum automóvel cadastrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
