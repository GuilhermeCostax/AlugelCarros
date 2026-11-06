import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Alerta from '../components/Alerta';
import CabecalhoPagina from '../components/CabecalhoPagina';
import Carregando from '../components/Carregando';
import Confirmar from '../components/Confirmar';
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
    setErro('');
    try {
      await excluirCliente(cliente.id);
      setClientes((lista) => lista.filter((c) => c.id !== cliente.id));
      toast.success(`Cliente ${cliente.nome} excluído.`);
    } catch (e) {
      setErro(mensagemDeErro(e));
    }
  }

  const termo = busca.trim().toLowerCase();
  const digitos = termo.replace(/\D/g, '');
  const filtrados = (clientes ?? []).filter(
    (c) => !termo || c.nome.toLowerCase().includes(termo) || (digitos && c.cpf.includes(digitos)),
  );

  return (
    <>
      <CabecalhoPagina
        titulo="Clientes"
        descricao="Cadastro de clientes e seus rendimentos."
        acoes={
          <Button asChild>
            <Link to="/clientes/novo">
              <Plus /> Novo cliente
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4">
        <Alerta>{erro}</Alerta>
        {clientes === null ? (
          !erro && <Carregando />
        ) : (
          <Card className="gap-0 py-0">
            <CardHeader className="flex flex-row items-center justify-between gap-4 border-b py-3">
              <div className="relative w-full max-w-xs">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Buscar por nome ou CPF"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  aria-label="Buscar clientes"
                />
              </div>
              <span className="text-sm whitespace-nowrap text-muted-foreground">{filtrados.length} cliente(s)</span>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Nome</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Profissão</TableHead>
                    <TableHead>Rendimentos</TableHead>
                    <TableHead className="text-right">Renda total</TableHead>
                    <TableHead className="w-0 pr-4"><span className="sr-only">Ações</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtrados.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="pl-4">
                        <div className="font-medium">{c.nome}</div>
                        <div className="text-xs text-muted-foreground">{c.login}</div>
                      </TableCell>
                      <TableCell className="tabular-nums">{cpf(c.cpf)}</TableCell>
                      <TableCell>{c.profissao}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{c.rendimentos.length} / 3</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">{moeda(c.rendaTotal)}</TableCell>
                      <TableCell className="pr-4">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon-sm" asChild>
                            <Link to={`/clientes/${c.id}/editar`} aria-label={`Editar ${c.nome}`}>
                              <Pencil />
                            </Link>
                          </Button>
                          <Confirmar
                            titulo={`Excluir ${c.nome}?`}
                            descricao="O cadastro e os rendimentos serão removidos. Clientes com contrato ativo não podem ser excluídos."
                            textoConfirmar="Excluir"
                            onConfirmar={() => excluir(c)}
                          >
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-muted-foreground hover:text-destructive"
                              aria-label={`Excluir ${c.nome}`}
                            >
                              <Trash2 />
                            </Button>
                          </Confirmar>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtrados.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        Nenhum cliente encontrado.
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
