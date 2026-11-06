import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Alerta from '../components/Alerta';
import Campo from '../components/Campo';
import Carregando from '../components/Carregando';
import { listarAutomoveis } from '../services/automovelService';
import { buscarPedido, criarPedido, modificarPedido } from '../services/pedidoService';
import { mensagemDeErro } from '../utils/erro';
import { hojeISO, placa } from '../utils/formatos';

/** Criação (/pedidos/novo) e modificação (/pedidos/:id/editar) de pedido. */
export default function PedidoForm() {
  const { id } = useParams();
  const criando = !id;
  const navigate = useNavigate();
  const [automoveis, setAutomoveis] = useState(null);
  const [form, setForm] = useState({ automovelId: '', dataInicio: '', dataFim: '' });
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    listarAutomoveis().then(setAutomoveis).catch((e) => setErro(mensagemDeErro(e)));
    if (!criando) {
      buscarPedido(id)
        .then((p) => setForm({ automovelId: String(p.automovel.id), dataInicio: p.dataInicio, dataFim: p.dataFim }))
        .catch((e) => setErro(mensagemDeErro(e)));
    }
  }, [id, criando]);

  const alterar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    const dados = { ...form, automovelId: Number(form.automovelId) };
    try {
      const pedido = criando ? await criarPedido(dados) : await modificarPedido(id, dados);
      navigate(`/pedidos/${pedido.id}`);
    } catch (err) {
      setErro(mensagemDeErro(err));
    } finally {
      setEnviando(false);
    }
  }

  const diarias =
    form.dataInicio && form.dataFim
      ? Math.round((new Date(form.dataFim) - new Date(form.dataInicio)) / 86400000)
      : 0;

  return (
    <>
      <div className="cabecalho-pagina">
        <div>
          <Link to={criando ? '/pedidos' : `/pedidos/${id}`} className="voltar">← Voltar</Link>
          <h1>{criando ? 'Novo pedido de aluguel' : `Modificar pedido #${id}`}</h1>
          <p className="subtitulo">Escolha o automóvel e o período desejado.</p>
        </div>
      </div>

      {automoveis === null ? (
        erro ? <Alerta>{erro}</Alerta> : <Carregando />
      ) : (
        <form className="card" onSubmit={enviar}>
          <h2 className="secao">Automóvel</h2>
          {automoveis.length === 0 ? (
            <p className="vazio">Nenhum automóvel cadastrado ainda.</p>
          ) : (
            <div className="opcoes-carro" role="radiogroup" aria-label="Automóvel">
              {automoveis.map((a) => (
                <label key={a.id} className={form.automovelId === String(a.id) ? 'ativo' : ''}>
                  <input
                    type="radio"
                    name="automovelId"
                    value={a.id}
                    checked={form.automovelId === String(a.id)}
                    onChange={alterar}
                    required
                  />
                  <strong>{a.marca} {a.modelo}</strong>
                  <span className="texto-suave">{a.ano} · {placa(a.placa)}</span>
                </label>
              ))}
            </div>
          )}

          <h2 className="secao">Período</h2>
          <div className="grade-2">
            <Campo label="Data de início" id="dataInicio" type="date" min={criando ? hojeISO() : undefined}
              value={form.dataInicio} onChange={alterar} required />
            <Campo label="Data de fim" id="dataFim" type="date" min={form.dataInicio || hojeISO()}
              value={form.dataFim} onChange={alterar} required />
          </div>
          {diarias > 0 && <p className="texto-suave">{diarias} diária(s)</p>}

          <Alerta>{erro}</Alerta>
          <div className="acoes">
            <button className="btn btn-primario" disabled={enviando || automoveis.length === 0}>
              {enviando ? 'Enviando…' : criando ? 'Enviar pedido' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
