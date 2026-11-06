import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Alerta from '../components/Alerta';
import CabecalhoPagina from '../components/CabecalhoPagina';
import Campo from '../components/Campo';
import Carregando from '../components/Carregando';
import Confirmar from '../components/Confirmar';
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
      toast.success(editandoId ? 'Automóvel atualizado.' : 'Automóvel cadastrado.');
      limpar();
      await carregar();
    } catch (err) {
      setErro(mensagemDeErro(err));
    } finally {
      setEnviando(false);
    }
  }

  async function excluir(a) {
    setErroLista('');
    try {
      await excluirAutomovel(a.id);
      setAutomoveis((lista) => lista.filter((x) => x.id !== a.id));
      toast.success('Automóvel excluído.');
    } catch (err) {
      setErroLista(mensagemDeErro(err));
    }
  }

  return (
    <>
      <CabecalhoPagina titulo="Automóveis" descricao="Frota disponível para aluguel." />

      <div className="grid gap-6">
        <form onSubmit={salvar}>
          <Card>
            <CardHeader>
              <CardTitle>{editandoId ? 'Editar automóvel' : 'Cadastrar automóvel'}</CardTitle>
              <CardDescription>
                Ao ser cadastrado, o automóvel fica registrado em nome do agente que o cadastrou.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <Campo label="Marca" id="marca" value={form.marca} onChange={alterar} placeholder="Toyota" required />
                <Campo label="Modelo" id="modelo" value={form.modelo} onChange={alterar} placeholder="Corolla" required />
                <Campo label="Ano" id="ano" type="number" min="1950" max="2100" value={form.ano} onChange={alterar} placeholder="2024" required />
                <Campo label="Placa" id="placa" value={form.placa} onChange={alterar} placeholder="ABC1D23" required />
                <Campo label="Matrícula" id="matricula" value={form.matricula} onChange={alterar} placeholder="MAT-0001" required />
              </div>
              <Alerta>{erro}</Alerta>
            </CardContent>
            <CardFooter className="justify-end gap-2 border-t">
              {editandoId && (
                <Button type="button" variant="outline" onClick={limpar}>
                  Cancelar
                </Button>
              )}
              <Button type="submit" disabled={enviando}>
                {enviando ? <Loader2 className="animate-spin" /> : !editandoId && <Plus />}
                {enviando ? 'Salvando…' : editandoId ? 'Salvar alterações' : 'Cadastrar'}
              </Button>
            </CardFooter>
          </Card>
        </form>

        <Alerta>{erroLista}</Alerta>
        {automoveis === null ? (
          !erroLista && <Carregando />
        ) : (
          <Card className="py-0">
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Automóvel</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Matrícula</TableHead>
                    <TableHead>Proprietário</TableHead>
                    <TableHead className="w-0 pr-4"><span className="sr-only">Ações</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {automoveis.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="pl-4">
                        <span className="font-medium">{a.marca} {a.modelo}</span>{' '}
                        <span className="text-muted-foreground">{a.ano}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">{placa(a.placa)}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{a.matricula}</TableCell>
                      <TableCell>
                        {a.proprietario ? (
                          <>
                            {a.proprietario.nome}{' '}
                            <span className="text-xs text-muted-foreground">({PERFIS[a.proprietario.perfil]})</span>
                          </>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell className="pr-4">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon-sm" onClick={() => editar(a)} aria-label={`Editar ${a.modelo}`}>
                            <Pencil />
                          </Button>
                          <Confirmar
                            titulo={`Excluir ${a.marca} ${a.modelo}?`}
                            descricao={`Placa ${placa(a.placa)}. Automóveis com pedidos não podem ser excluídos.`}
                            textoConfirmar="Excluir"
                            onConfirmar={() => excluir(a)}
                          >
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-muted-foreground hover:text-destructive"
                              aria-label={`Excluir ${a.modelo}`}
                            >
                              <Trash2 />
                            </Button>
                          </Confirmar>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {automoveis.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        Nenhum automóvel cadastrado.
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
