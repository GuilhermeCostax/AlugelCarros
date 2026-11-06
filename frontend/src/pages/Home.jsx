import { Ban, Car, CheckCircle2, ChevronRight, Clock, FileText, Plus, User, Users, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '../context/useAuth';
import { listarPedidos } from '../services/pedidoService';
import { PERFIS, ehAgente } from '../utils/perfis';
import { STATUS } from '../utils/status';

const ICONES_STATUS = {
  PENDENTE: { Icone: Clock, cor: 'text-amber-600 bg-amber-50' },
  APROVADO: { Icone: CheckCircle2, cor: 'text-emerald-600 bg-emerald-50' },
  REPROVADO: { Icone: XCircle, cor: 'text-red-600 bg-red-50' },
  CONTRATADO: { Icone: FileText, cor: 'text-blue-600 bg-blue-50' },
  CANCELADO: { Icone: Ban, cor: 'text-zinc-500 bg-zinc-100' },
};

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
        { to: '/pedidos', titulo: 'Analisar pedidos', texto: 'Avalie pedidos pendentes e execute contratos.', Icone: FileText },
        { to: '/automoveis', titulo: 'Automóveis', texto: 'Cadastre e mantenha a frota.', Icone: Car },
        { to: '/clientes', titulo: 'Clientes', texto: 'Consulte dados e rendimentos dos clientes.', Icone: Users },
        {
          to: '/contratos',
          titulo: 'Contratos',
          texto: usuario.perfil === 'BANCO' ? 'Conceda crédito aos contratos.' : 'Acompanhe os contratos executados.',
          Icone: FileText,
        },
      ]
    : [
        { to: '/pedidos/novo', titulo: 'Novo pedido', texto: 'Escolha um automóvel e o período.', Icone: Plus },
        { to: '/pedidos', titulo: 'Meus pedidos', texto: 'Consulte, modifique ou cancele pedidos.', Icone: FileText },
        { to: '/meus-dados', titulo: 'Meus dados', texto: 'Atualize seus dados e rendimentos.', Icone: User },
        { to: '/contratos', titulo: 'Meus contratos', texto: 'Veja contratos e créditos.', Icone: FileText },
      ];

  return (
    <>
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Olá, {usuario.nome}!</h1>
        <p className="text-sm text-muted-foreground">
          Você está conectado como <span className="font-medium text-foreground">{PERFIS[usuario.perfil]}</span>.
        </p>
      </div>

      <h2 className="mb-3 text-sm font-medium text-muted-foreground">
        {agente ? 'Pedidos no sistema' : 'Seus pedidos'}
      </h2>
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Object.entries(STATUS).map(([status, rotulo]) => {
          const { Icone, cor } = ICONES_STATUS[status];
          return (
            <Card key={status} size="sm">
              <CardContent className="flex items-center gap-3">
                <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${cor}`}>
                  <Icone className="size-4" />
                </span>
                <div>
                  {pedidos === null ? (
                    <Skeleton className="h-6 w-8" />
                  ) : (
                    <div className="text-2xl leading-none font-semibold tabular-nums">{contagem(status)}</div>
                  )}
                  <div className="mt-1 text-xs text-muted-foreground">{rotulo}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <h2 className="mb-3 text-sm font-medium text-muted-foreground">Acesso rápido</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {atalhos.map(({ to, titulo, texto, Icone }) => (
          <Link key={to} to={to} className="group">
            <Card className="h-full transition-shadow group-hover:shadow-md group-hover:ring-primary/30">
              <CardContent className="flex h-full flex-col gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icone className="size-4" />
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between font-medium">
                    {titulo}
                    <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{texto}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
