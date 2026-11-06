import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Alerta from '../components/Alerta';
import CabecalhoPagina from '../components/CabecalhoPagina';
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
      <CabecalhoPagina
        titulo={ehAgente(usuario.perfil) ? 'Contratos' : 'Meus contratos'}
        descricao="Contratos de aluguel executados e créditos associados."
      />
      <div className="grid gap-4">
        <Alerta>{erro}</Alerta>
        {contratos === null ? (
          !erro && <Carregando />
        ) : (
          <Card className="py-0">
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">#</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Automóvel</TableHead>
                    <TableHead>Assinatura</TableHead>
                    <TableHead>Registro</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Crédito</TableHead>
                    <TableHead className="w-0 pr-4"><span className="sr-only">Ações</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contratos.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="pl-4 text-muted-foreground tabular-nums">{c.id}</TableCell>
                      <TableCell className="font-medium">{c.cliente}</TableCell>
                      <TableCell>{c.automovel}</TableCell>
                      <TableCell className="tabular-nums">{data(c.dataAssinatura)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{TIPOS_PROPRIETARIO[c.tipoProprietario]}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">{moeda(c.valorTotal)}</TableCell>
                      <TableCell>
                        {c.credito ? (
                          <>
                            <div className="tabular-nums">
                              {c.credito.numeroParcelas}x {moeda(c.credito.valorParcela)}
                            </div>
                            <div className="text-xs text-muted-foreground">{c.credito.banco.nome}</div>
                          </>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="pr-4">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/pedidos/${c.pedidoId}`}>
                            Ver pedido <ChevronRight />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {contratos.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                        Nenhum contrato ainda.
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
