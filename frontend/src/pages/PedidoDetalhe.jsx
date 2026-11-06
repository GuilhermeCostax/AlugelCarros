import { Ban, Check, FileSignature, Landmark, Loader2, Pencil, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import Alerta from '../components/Alerta';
import CabecalhoPagina from '../components/CabecalhoPagina';
import Campo from '../components/Campo';
import Carregando from '../components/Carregando';
import Confirmar from '../components/Confirmar';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/useAuth';
import { concederCredito } from '../services/contratoService';
import { avaliarPedido, buscarPedido, cancelarPedido, executarContrato } from '../services/pedidoService';
import { mensagemDeErro } from '../utils/erro';
import { cpf, data, dataHora, moeda, parcelaPrice, placa } from '../utils/formatos';
import { PERFIS, ehAgente } from '../utils/perfis';
import { TIPOS_PROPRIETARIO } from '../utils/status';

function Dados({ itens }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
      {itens.map(([rotulo, valor]) => (
        <div key={rotulo} className="contents">
          <dt className="text-muted-foreground">{rotulo}</dt>
          <dd>{valor}</dd>
        </div>
      ))}
    </dl>
  );
}

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
    try {
      setPedido(await cancelarPedido(pedido.id));
      toast.success('Pedido cancelado.');
    } catch (e) {
      setErro(mensagemDeErro(e));
    }
  }

  return (
    <>
      <CabecalhoPagina
        voltar={{ to: '/pedidos', rotulo: 'Pedidos' }}
        titulo={`Pedido #${pedido.id}`}
        extra={<StatusBadge status={status} />}
        descricao={`Criado em ${dataHora(pedido.dataCriacao)}`}
        acoes={
          <>
            {podeModificar && (
              <Button variant="outline" asChild>
                <Link to={`/pedidos/${pedido.id}/editar`}>
                  <Pencil /> Modificar
                </Link>
              </Button>
            )}
            {podeCancelar && (
              <Confirmar
                titulo="Cancelar este pedido?"
                descricao="O pedido passa para CANCELADO e não poderá mais ser avaliado."
                textoConfirmar="Cancelar pedido"
                onConfirmar={cancelar}
              >
                <Button variant="destructive">
                  <Ban /> Cancelar pedido
                </Button>
              </Confirmar>
            )}
          </>
        }
      />

      <div className="grid gap-6">
        <Alerta>{erro}</Alerta>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Aluguel</CardTitle>
            </CardHeader>
            <CardContent>
              <Dados
                itens={[
                  ['Automóvel', `${automovel.marca} ${automovel.modelo} ${automovel.ano}`],
                  ['Placa', <span key="p" className="font-mono">{placa(automovel.placa)}</span>],
                  ['Período', `${data(pedido.dataInicio)} a ${data(pedido.dataFim)}`],
                  ['Diárias', pedido.diarias],
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Dados
                itens={[
                  ['Nome', cliente.nome],
                  ['CPF', cpf(cliente.cpf)],
                  ['Profissão', cliente.profissao],
                  ['Renda total', <span key="r" className="font-semibold">{moeda(cliente.rendaTotal)}</span>],
                ]}
              />
              {cliente.rendimentos.length > 0 && (
                <ul className="divide-y rounded-lg border text-sm">
                  {cliente.rendimentos.map((r) => (
                    <li key={r.id} className="flex justify-between px-3 py-2">
                      <span>{r.entidadeEmpregadora}</span>
                      <span className="tabular-nums">{moeda(r.valor)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {pedido.parecer && (
          <Card className={cn('border-l-4', status === 'REPROVADO' ? 'border-l-red-500' : 'border-l-emerald-500')}>
            <CardHeader>
              <CardTitle>Parecer financeiro</CardTitle>
              <CardDescription>
                {pedido.agenteAvaliador?.nome} ({PERFIS[pedido.agenteAvaliador?.perfil]}) · {dataHora(pedido.dataAvaliacao)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{pedido.parecer}</p>
            </CardContent>
          </Card>
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
      </div>
    </>
  );
}

function FormAvaliacao({ pedidoId, onConcluir }) {
  const [parecer, setParecer] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(null);

  async function avaliar(aprovado) {
    setErro('');
    if (!parecer.trim()) {
      setErro('Escreva o parecer antes de avaliar.');
      return;
    }
    setEnviando(aprovado ? 'aprovar' : 'reprovar');
    try {
      onConcluir(await avaliarPedido(pedidoId, { aprovado, parecer }));
      toast.success(aprovado ? 'Pedido aprovado.' : 'Pedido reprovado.');
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setEnviando(null);
    }
  }

  return (
    <Card className="ring-2 ring-primary/40">
      <CardHeader>
        <CardTitle>Avaliação financeira</CardTitle>
        <CardDescription>Analise a renda do cliente e registre o parecer.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="parecer">Parecer</Label>
          <Textarea
            id="parecer"
            rows={3}
            maxLength={500}
            value={parecer}
            onChange={(e) => setParecer(e.target.value)}
            placeholder="Ex.: renda compatível com o valor do aluguel."
          />
        </div>
        <Alerta>{erro}</Alerta>
      </CardContent>
      <CardFooter className="justify-end gap-2 border-t">
        <Button variant="destructive" disabled={!!enviando} onClick={() => avaliar(false)}>
          {enviando === 'reprovar' ? <Loader2 className="animate-spin" /> : <X />} Reprovar
        </Button>
        <Button className="bg-emerald-600 hover:bg-emerald-700" disabled={!!enviando} onClick={() => avaliar(true)}>
          {enviando === 'aprovar' ? <Loader2 className="animate-spin" /> : <Check />} Aprovar
        </Button>
      </CardFooter>
    </Card>
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
      toast.success('Contrato executado.');
    } catch (err) {
      setErro(mensagemDeErro(err));
    } finally {
      setEnviando(false);
    }
  }

  const opcoes = [
    { valor: 'CLIENTE', rotulo: 'Em nome do cliente' },
    { valor: perfilAgente, rotulo: perfilAgente === 'EMPRESA' ? 'Em nome da empresa (você)' : 'Em nome do banco (você)' },
  ];

  return (
    <form onSubmit={enviar}>
      <Card className="ring-2 ring-primary/40">
        <CardHeader>
          <CardTitle>Executar contrato</CardTitle>
          <CardDescription>Defina em nome de quem o automóvel ficará registrado e o valor total do contrato.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <RadioGroup
            value={form.tipoProprietario}
            onValueChange={(tipoProprietario) => setForm({ ...form, tipoProprietario })}
            className="grid gap-3 sm:grid-cols-2"
            aria-label="Proprietário do automóvel"
          >
            {opcoes.map(({ valor, rotulo }) => (
              <Label
                key={valor}
                htmlFor={`prop-${valor}`}
                className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 font-normal has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10 has-[[data-state=checked]]:ring-1 has-[[data-state=checked]]:ring-primary"
              >
                <RadioGroupItem value={valor} id={`prop-${valor}`} />
                {rotulo}
              </Label>
            ))}
          </RadioGroup>
          <Campo
            label="Valor total (R$)"
            id="valorTotal"
            type="number"
            min="0.01"
            step="0.01"
            className="sm:max-w-xs"
            value={form.valorTotal}
            onChange={(e) => setForm({ ...form, valorTotal: e.target.value })}
            required
          />
          <Alerta>{erro}</Alerta>
        </CardContent>
        <CardFooter className="justify-end border-t">
          <Button type="submit" disabled={enviando}>
            {enviando ? <Loader2 className="animate-spin" /> : <FileSignature />}
            {enviando ? 'Executando…' : 'Executar contrato'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

function ContratoCard({ contrato, podeConcederCredito, onAtualizar }) {
  const { credito } = contrato;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSignature className="size-4 text-primary" /> Contrato #{contrato.id}
        </CardTitle>
        <CardDescription>Assinado em {data(contrato.dataAssinatura)}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <Dados
          itens={[
            ['Valor total', <span key="v" className="font-semibold">{moeda(contrato.valorTotal)}</span>],
            ['Executado por', contrato.agente?.nome ?? '—'],
            [
              'Registro do automóvel',
              `${TIPOS_PROPRIETARIO[contrato.tipoProprietario]}${contrato.proprietario ? ` — ${contrato.proprietario.nome}` : ''}`,
            ],
          ]}
        />

        <Separator />

        {credito ? (
          <div className="grid gap-3">
            <h3 className="flex items-center gap-2 font-medium">
              <Landmark className="size-4 text-primary" /> Contrato de crédito
            </h3>
            <Dados
              itens={[
                ['Banco', credito.banco.nome],
                ['Valor financiado', moeda(credito.valor)],
                [
                  'Condições',
                  <span key="c">
                    {credito.numeroParcelas}x de <span className="font-semibold">{moeda(credito.valorParcela)}</span> (
                    {credito.taxaJuros}% a.m.)
                  </span>,
                ],
              ]}
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Sem contrato de crédito associado.</p>
        )}

        {podeConcederCredito && <FormCredito contrato={contrato} onConcluir={onAtualizar} />}
      </CardContent>
    </Card>
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
      onConcluir(
        await concederCredito(contrato.id, {
          valor: Number(form.valor),
          taxaJuros: Number(form.taxaJuros),
          numeroParcelas: Number(form.numeroParcelas),
        }),
      );
      toast.success('Crédito concedido.');
    } catch (err) {
      setErro(mensagemDeErro(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="grid gap-4 rounded-lg border bg-muted/40 p-4">
      <div>
        <h3 className="font-medium">Conceder crédito</h3>
        <p className="text-sm text-muted-foreground">O valor não pode ser maior que o total do contrato.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Campo label="Valor (R$)" id="valor" type="number" min="0.01" step="0.01" max={contrato.valorTotal}
          value={form.valor} onChange={alterar} required />
        <Campo label="Juros (% a.m.)" id="taxaJuros" type="number" min="0" max="100" step="0.01"
          value={form.taxaJuros} onChange={alterar} required />
        <Campo label="Parcelas" id="numeroParcelas" type="number" min="1" max="120"
          value={form.numeroParcelas} onChange={alterar} required />
      </div>
      <Alerta>{erro}</Alerta>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">
          Parcela estimada:{' '}
          <span className="font-semibold text-foreground">
            {moeda(parcelaPrice(form.valor, form.taxaJuros, form.numeroParcelas))}
          </span>
        </span>
        <Button type="submit" disabled={enviando}>
          {enviando ? <Loader2 className="animate-spin" /> : <Landmark />}
          {enviando ? 'Concedendo…' : 'Conceder crédito'}
        </Button>
      </div>
    </form>
  );
}
