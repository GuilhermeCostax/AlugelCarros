import { Car, ChevronRight, ClipboardList, Clock, FileSignature, Landmark, Plus, UserRound, Users, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '../context/useAuth';
import { listarContratos } from '../services/contratoService';
import { listarPedidos } from '../services/pedidoService';
import { moeda } from '../utils/formatos';
import { PERFIS, ehAgente } from '../utils/perfis';
import { STATUS } from '../utils/status';

const CORES_STATUS = {
  PENDENTE: 'var(--color-amber-500)',
  APROVADO: 'var(--color-emerald-500)',
  REPROVADO: 'var(--color-red-500)',
  CONTRATADO: 'var(--color-blue-600)',
  CANCELADO: 'var(--color-zinc-400)',
};

const configStatus = { total: { label: 'Pedidos' } };
const configValores = {
  contratado: { label: 'Valor contratado', color: 'var(--primary)' },
  financiado: { label: 'Valor financiado', color: 'var(--color-emerald-500)' },
};

/** Últimos 6 meses (inclusive o atual) com os valores contratados e financiados em cada um. */
function valoresPorMes(contratos) {
  const hoje = new Date();
  const meses = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - 5 + i, 1);
    const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const rotulo = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    return { chave, mes: rotulo.charAt(0).toUpperCase() + rotulo.slice(1), contratado: 0, financiado: 0 };
  });
  for (const c of contratos) {
    const mes = meses.find((m) => m.chave === String(c.dataAssinatura).slice(0, 7));
    if (!mes) continue;
    mes.contratado += Number(c.valorTotal);
    mes.financiado += Number(c.credito?.valor ?? 0);
  }
  return meses;
}

function Indicador({ titulo, valor, detalhe, Icone, carregando }) {
  return (
    <Card size="sm">
      <CardContent className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-medium text-muted-foreground">{titulo}</p>
          {carregando ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <p className="truncate text-2xl font-semibold tracking-tight tabular-nums">{valor}</p>
          )}
          {detalhe && <p className="text-xs text-muted-foreground">{detalhe}</p>}
        </div>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icone className="size-4" />
        </span>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const { usuario } = useAuth();
  const agente = ehAgente(usuario.perfil);
  const [pedidos, setPedidos] = useState(null);
  const [contratos, setContratos] = useState(null);

  useEffect(() => {
    listarPedidos().then(setPedidos).catch(() => setPedidos([]));
    listarContratos().then(setContratos).catch(() => setContratos([]));
  }, []);

  const carregando = pedidos === null || contratos === null;
  const lista = pedidos ?? [];
  const contagem = (status) => lista.filter((p) => p.status === status).length;
  const totalContratado = (contratos ?? []).reduce((s, c) => s + Number(c.valorTotal), 0);
  const totalFinanciado = (contratos ?? []).reduce((s, c) => s + Number(c.credito?.valor ?? 0), 0);

  const dadosStatus = Object.entries(STATUS).map(([status, rotulo]) => ({
    status,
    rotulo,
    total: contagem(status),
  }));
  const dadosMes = valoresPorMes(contratos ?? []);

  const atalhos = agente
    ? [
        { to: '/pedidos', titulo: 'Analisar pedidos', texto: 'Avalie pedidos pendentes e execute contratos.', Icone: ClipboardList },
        { to: '/automoveis', titulo: 'Automóveis', texto: 'Cadastre e mantenha a frota.', Icone: Car },
        { to: '/clientes', titulo: 'Clientes', texto: 'Consulte dados e rendimentos.', Icone: Users },
        {
          to: '/contratos',
          titulo: 'Contratos',
          texto: usuario.perfil === 'BANCO' ? 'Conceda crédito aos contratos.' : 'Acompanhe os contratos.',
          Icone: FileSignature,
        },
      ]
    : [
        { to: '/pedidos/novo', titulo: 'Novo pedido', texto: 'Escolha um automóvel e o período.', Icone: Plus },
        { to: '/pedidos', titulo: 'Meus pedidos', texto: 'Consulte, modifique ou cancele.', Icone: ClipboardList },
        { to: '/meus-dados', titulo: 'Meus dados', texto: 'Atualize dados e rendimentos.', Icone: UserRound },
        { to: '/contratos', titulo: 'Meus contratos', texto: 'Veja contratos e créditos.', Icone: FileSignature },
      ];

  return (
    <div className="grid gap-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Olá, {usuario.nome}!</h1>
        <p className="text-sm text-muted-foreground">
          {agente ? 'Visão geral dos pedidos e contratos do sistema.' : 'Acompanhe seus pedidos e contratos.'}{' '}
          Conectado como <span className="font-medium text-foreground">{PERFIS[usuario.perfil]}</span>.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Indicador titulo={agente ? 'Pedidos no sistema' : 'Meus pedidos'} valor={lista.length} Icone={ClipboardList} carregando={carregando} />
        <Indicador
          titulo={agente ? 'Aguardando análise' : 'Em análise'}
          valor={contagem('PENDENTE')}
          detalhe={`${contagem('APROVADO')} aprovado(s) aguardando contrato`}
          Icone={Clock}
          carregando={carregando}
        />
        <Indicador
          titulo="Valor contratado"
          valor={moeda(totalContratado)}
          detalhe={`${(contratos ?? []).length} contrato(s)`}
          Icone={FileSignature}
          carregando={carregando}
        />
        <Indicador
          titulo="Valor financiado"
          valor={moeda(totalFinanciado)}
          detalhe={`${(contratos ?? []).filter((c) => c.credito).length} crédito(s) concedido(s)`}
          Icone={usuario.perfil === 'BANCO' ? Landmark : Wallet}
          carregando={carregando}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pedidos por status</CardTitle>
            <CardDescription>{agente ? 'Todos os pedidos do sistema' : 'Seus pedidos'}</CardDescription>
          </CardHeader>
          <CardContent>
            {carregando ? (
              <Skeleton className="aspect-[4/3] w-full" />
            ) : (
              <ChartContainer config={configStatus} className="aspect-[4/3] w-full">
                <BarChart data={dadosStatus} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <CartesianGrid horizontal={false} />
                  <YAxis dataKey="rotulo" type="category" tickLine={false} axisLine={false} width={80} />
                  <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel={false} />} />
                  <Bar dataKey="total" radius={6} isAnimationActive={false}>
                    {dadosStatus.map((d) => (
                      <Cell key={d.status} fill={CORES_STATUS[d.status]} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Contratos nos últimos 6 meses</CardTitle>
            <CardDescription>Valor contratado e valor financiado por mês de assinatura</CardDescription>
          </CardHeader>
          <CardContent>
            {carregando ? (
              <Skeleton className="aspect-[16/9] w-full" />
            ) : (
              <ChartContainer config={configValores} className="aspect-[16/9] w-full">
                <BarChart data={dadosMes} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="mes" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={56}
                    tickFormatter={(v) => (v >= 1000 ? `${v / 1000} mil` : v)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent formatter={(valor, nome) => (
                      <div className="flex w-full justify-between gap-4">
                        <span className="text-muted-foreground">{configValores[nome]?.label}</span>
                        <span className="font-medium tabular-nums">{moeda(valor)}</span>
                      </div>
                    )} />}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="contratado" fill="var(--color-contratado)" radius={[6, 6, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="financiado" fill="var(--color-financiado)" radius={[6, 6, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {atalhos.map(({ to, titulo, texto, Icone }) => (
          <Link key={to} to={to} className="group">
            <Card size="sm" className="h-full transition-shadow group-hover:shadow-md group-hover:ring-primary/30">
              <CardContent className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                  <Icone className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{titulo}</div>
                  <p className="truncate text-xs text-muted-foreground">{texto}</p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
