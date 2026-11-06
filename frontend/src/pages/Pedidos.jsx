import { ChevronRight, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Alerta from '../components/Alerta';
import CabecalhoPagina from '../components/CabecalhoPagina';
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
  const navigate = useNavigate();
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
      <CabecalhoPagina
        titulo={agente ? 'Pedidos de aluguel' : 'Meus pedidos'}
        descricao={agente ? 'Analise os pedidos e execute os contratos aprovados.' : 'Acompanhe o status dos seus pedidos.'}
        acoes={
          !agente && (
            <Button asChild>
              <Link to="/pedidos/novo">
                <Plus /> Novo pedido
              </Link>
            </Button>
          )
        }
      />

      <div className="grid gap-4">
        <Alerta>{erro}</Alerta>
        {pedidos === null ? (
          !erro && <Carregando />
        ) : (
          <Card className="gap-0 py-0">
            <CardHeader className="overflow-x-auto border-b px-4 pt-3 pb-2">
              <Tabs value={filtro} onValueChange={setFiltro}>
                <TabsList variant="line">
                  {['TODOS', ...Object.keys(STATUS)].map((s) => (
                    <TabsTrigger key={s} value={s} className="px-3">
                      {s === 'TODOS' ? 'Todos' : STATUS[s]}
                      <span className="rounded-full bg-muted px-1.5 text-xs text-muted-foreground tabular-nums">
                        {s === 'TODOS' ? pedidos.length : contagem(s)}
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">#</TableHead>
                    {agente && <TableHead>Cliente</TableHead>}
                    <TableHead>Automóvel</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-0 pr-4"><span className="sr-only">Ações</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visiveis.map((p) => (
                    <TableRow key={p.id} className="cursor-pointer" onClick={() => navigate(`/pedidos/${p.id}`)}>
                      <TableCell className="pl-4 text-muted-foreground tabular-nums">{p.id}</TableCell>
                      {agente && <TableCell className="font-medium">{p.cliente.nome}</TableCell>}
                      <TableCell>
                        <div>{p.automovel.marca} {p.automovel.modelo}</div>
                        <div className="font-mono text-xs text-muted-foreground">{placa(p.automovel.placa)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="tabular-nums">{data(p.dataInicio)} – {data(p.dataFim)}</div>
                        <div className="text-xs text-muted-foreground">{p.diarias} diária(s)</div>
                      </TableCell>
                      <TableCell><StatusBadge status={p.status} /></TableCell>
                      <TableCell className="pr-4">
                        <Button variant={agente && p.status === 'PENDENTE' ? 'default' : 'ghost'} size="sm" asChild>
                          <Link to={`/pedidos/${p.id}`} onClick={(e) => e.stopPropagation()}>
                            {agente && p.status === 'PENDENTE' ? 'Avaliar' : 'Detalhes'}
                            <ChevronRight />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {visiveis.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={agente ? 6 : 5} className="h-24 text-center text-muted-foreground">
                        Nenhum pedido encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
