import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Alerta from '../components/Alerta';
import Campo from '../components/Campo';
import Carregando from '../components/Carregando';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/useAuth';
import { concederCredito } from '../services/contratoService';
import { avaliarPedido, buscarPedido, cancelarPedido, executarContrato } from '../services/pedidoService';
import { mensagemDeErro } from '../utils/erro';
import { cpf, data, dataHora, moeda, parcelaPrice, placa } from '../utils/formatos';
import { PERFIS, ehAgente } from '../utils/perfis';
import { TIPOS_PROPRIETARIO } from '../utils/status';

export default function PedidoDetalhe() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const agente = ehAgente(usuario.perfil);
  const [pedido, setPedido] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    buscarPedido(id).then(setPedido).catch((e) => setErro(mensagemDeErro(e)));
  }, [id]);

  if (!pedido) return erro ? <Alerta>{erro}</Alerta> : <Carregando />;

  const { status, cliente, automovel, contrato } = pedido;
  const podeModificar = agente ? ['PENDENTE', 'APROVADO'].includes(status) : status === 'PENDENTE';
  const podeCancelar = !agente && ['PENDENTE', 'APROVADO'].includes(status);

  async function cancelar() {
    if (!window.confirm('Cancelar este pedido?')) return;
    try {
      setPedido(await cancelarPedido(pedido.id));
    } catch (e) {
      setErro(mensagemDeErro(e));
    }
  }

  return (
    <>
      <div className="cabecalho-pagina">
        <div>
          <Link to="/pedidos" className="voltar">← Pedidos</Link>
          <h1>Pedido #{pedido.id} <StatusBadge status={status} /></h1>
          <p className="subtitulo">Criado em {dataHora(pedido.dataCriacao)}</p>
        </div>
        <div className="acoes">
          {podeModificar && <Link to={`/pedidos/${pedido.id}/editar`} className="btn btn-secundario">Modificar</Link>}
          {podeCancelar && <button className="btn btn-perigo" onClick={cancelar}>Cancelar pedido</button>}
        </div>
      </div>

      <Alerta>{erro}</Alerta>

      <div className="grade-detalhe">
        <section className="card">
          <h2 className="secao">Aluguel</h2>
          <dl className="dados">
            <dt>Automóvel</dt>
            <dd>{automovel.marca} {automovel.modelo} {automovel.ano}</dd>
            <dt>Placa</dt>
            <dd>{placa(automovel.placa)}</dd>
            <dt>Período</dt>
            <dd>{data(pedido.dataInicio)} a {data(pedido.dataFim)} ({pedido.diarias} diária(s))</dd>
          </dl>
        </section>

        <section className="card">
          <h2 className="secao">Cliente</h2>
          <dl className="dados">
            <dt>Nome</dt>
            <dd>{cliente.nome}</dd>
            <dt>CPF</dt>
            <dd>{cpf(cliente.cpf)}</dd>
            <dt>Profissão</dt>
            <dd>{cliente.profissao}</dd>
            <dt>Renda total</dt>
            <dd><strong>{moeda(cliente.rendaTotal)}</strong></dd>
          </dl>
          {cliente.rendimentos.length > 0 && (
            <ul className="lista-rendimentos">
              {cliente.rendimentos.map((r) => (
                <li key={r.id}><span>{r.entidadeEmpregadora}</span><span>{moeda(r.valor)}</span></li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {pedido.parecer && (
        <section className={`card parecer parecer-${status === 'REPROVADO' ? 'negativo' : 'positivo'}`}>
          <h2 className="secao">Parecer financeiro</h2>
          <p>{pedido.parecer}</p>
          <p className="texto-suave">
            {pedido.agenteAvaliador?.nome} ({PERFIS[pedido.agenteAvaliador?.perfil]}) · {dataHora(pedido.dataAvaliacao)}
          </p>
        </section>
      )}

      {agente && status === 'PENDENTE' && <FormAvaliacao pedidoId={pedido.id} onConcluir={setPedido} />}
      {agente && status === 'APROVADO' && (
        <FormContrato pedidoId={pedido.id} perfilAgente={usuario.perfil} onConcluir={setPedido} />
      )}

      {contrato && (
        <ContratoCard
          contrato={contrato}
          podeConcederCredito={usuario.perfil === 'BANCO' && !contrato.credito}
          onAtualizar={(c) => setPedido({ ...pedido, contrato: c })}
        />
      )}
    </>
  );
}

function FormAvaliacao({ pedidoId, onConcluir }) {
  const [parecer, setParecer] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function avaliar(aprovado) {
    setErro('');
    if (!parecer.trim()) {
      setErro('Escreva o parecer antes de avaliar.');
      return;
    }
    setEnviando(true);
    try {
      onConcluir(await avaliarPedido(pedidoId, { aprovado, parecer }));
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="card destaque">
      <h2 className="secao">Avaliação financeira</h2>
      <div className="campo">
        <label htmlFor="parecer">Parecer</label>
        <textarea
          id="parecer"
          rows={3}
          maxLength={500}
          value={parecer}
          onChange={(e) => setParecer(e.target.value)}
          placeholder="Ex.: renda compatível com o valor do aluguel."
        />
      </div>
      <Alerta>{erro}</Alerta>
      <div className="acoes">
        <button className="btn btn-perigo" disabled={enviando} onClick={() => avaliar(false)}>Reprovar</button>
        <button className="btn btn-sucesso" disabled={enviando} onClick={() => avaliar(true)}>Aprovar</button>
      </div>
    </section>
  );
}

function FormContrato({ pedidoId, perfilAgente, onConcluir }) {
  const [form, setForm] = useState({ tipoProprietario: 'CLIENTE', valorTotal: '' });
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      onConcluir(await executarContrato(pedidoId, { ...form, valorTotal: Number(form.valorTotal) }));
    } catch (err) {
      setErro(mensagemDeErro(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="card destaque" onSubmit={enviar}>
      <h2 className="secao">Executar contrato</h2>
      <p className="texto-suave">Defina em nome de quem o automóvel ficará registrado e o valor total do contrato.</p>
      <div className="seletor-perfil seletor-2" role="radiogroup" aria-label="Proprietário do automóvel">
        {['CLIENTE', perfilAgente].map((tipo) => (
          <label key={tipo} className={form.tipoProprietario === tipo ? 'ativo' : ''}>
            <input
              type="radio"
              name="tipoProprietario"
              value={tipo}
              checked={form.tipoProprietario === tipo}
              onChange={(e) => setForm({ ...form, tipoProprietario: e.target.value })}
            />
            {tipo === 'CLIENTE' ? 'Em nome do cliente' : `Em nome do ${TIPOS_PROPRIETARIO[tipo].toLowerCase()} (você)`}
          </label>
        ))}
      </div>
      <Campo
        label="Valor total (R$)"
        id="valorTotal"
        type="number"
        min="0.01"
        step="0.01"
        value={form.valorTotal}
        onChange={(e) => setForm({ ...form, valorTotal: e.target.value })}
        required
      />
      <Alerta>{erro}</Alerta>
      <div className="acoes">
        <button className="btn btn-primario" disabled={enviando}>{enviando ? 'Executando…' : 'Executar contrato'}</button>
      </div>
    </form>
  );
}

function ContratoCard({ contrato, podeConcederCredito, onAtualizar }) {
  const { credito } = contrato;
  return (
    <section className="card">
      <h2 className="secao">Contrato #{contrato.id}</h2>
      <dl className="dados">
        <dt>Assinado em</dt>
        <dd>{data(contrato.dataAssinatura)}</dd>
        <dt>Valor total</dt>
        <dd><strong>{moeda(contrato.valorTotal)}</strong></dd>
        <dt>Executado por</dt>
        <dd>{contrato.agente?.nome ?? '—'}</dd>
        <dt>Registro do automóvel</dt>
        <dd>
          {TIPOS_PROPRIETARIO[contrato.tipoProprietario]}
          {contrato.proprietario && ` — ${contrato.proprietario.nome}`}
        </dd>
      </dl>

      {credito ? (
        <div className="credito">
          <h3>Contrato de crédito</h3>
          <dl className="dados">
            <dt>Banco</dt>
            <dd>{credito.banco.nome}</dd>
            <dt>Valor financiado</dt>
            <dd>{moeda(credito.valor)}</dd>
            <dt>Condições</dt>
            <dd>{credito.numeroParcelas}x de <strong>{moeda(credito.valorParcela)}</strong> ({credito.taxaJuros}% a.m.)</dd>
          </dl>
        </div>
      ) : (
        <p className="texto-suave">Sem contrato de crédito associado.</p>
      )}

      {podeConcederCredito && <FormCredito contrato={contrato} onConcluir={onAtualizar} />}
    </section>
  );
}

function FormCredito({ contrato, onConcluir }) {
  const [form, setForm] = useState({ valor: contrato.valorTotal, taxaJuros: '1.5', numeroParcelas: '12' });
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const alterar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      onConcluir(await concederCredito(contrato.id, {
        valor: Number(form.valor),
        taxaJuros: Number(form.taxaJuros),
        numeroParcelas: Number(form.numeroParcelas),
      }));
    } catch (err) {
      setErro(mensagemDeErro(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="credito destaque-interno" onSubmit={enviar}>
      <h3>Conceder crédito</h3>
      <div className="grade-3">
        <Campo label="Valor (R$)" id="valor" type="number" min="0.01" step="0.01" max={contrato.valorTotal}
          value={form.valor} onChange={alterar} required />
        <Campo label="Juros (% a.m.)" id="taxaJuros" type="number" min="0" max="100" step="0.01"
          value={form.taxaJuros} onChange={alterar} required />
        <Campo label="Parcelas" id="numeroParcelas" type="number" min="1" max="120"
          value={form.numeroParcelas} onChange={alterar} required />
      </div>
      <p className="texto-suave">
        Parcela estimada: <strong>{moeda(parcelaPrice(form.valor, form.taxaJuros, form.numeroParcelas))}</strong>
      </p>
      <Alerta>{erro}</Alerta>
      <div className="acoes">
        <button className="btn btn-primario" disabled={enviando}>{enviando ? 'Concedendo…' : 'Conceder crédito'}</button>
      </div>
    </form>
  );
}
