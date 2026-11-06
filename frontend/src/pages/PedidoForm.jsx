import { Car, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import Alerta from '../components/Alerta';
import CabecalhoPagina from '../components/CabecalhoPagina';
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
    if (!form.automovelId) {
      setErro('Escolha um automóvel.');
      return;
    }
    setEnviando(true);
    const dados = { ...form, automovelId: Number(form.automovelId) };
    try {
      const pedido = criando ? await criarPedido(dados) : await modificarPedido(id, dados);
      toast.success(criando ? 'Pedido enviado para análise.' : 'Pedido atualizado.');
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
      <CabecalhoPagina
        voltar={criando ? { to: '/pedidos', rotulo: 'Pedidos' } : { to: `/pedidos/${id}`, rotulo: `Pedido #${id}` }}
        titulo={criando ? 'Novo pedido de aluguel' : `Modificar pedido #${id}`}
        descricao="Escolha o automóvel e o período desejado."
      />

      {automoveis === null ? (
        erro ? <Alerta>{erro}</Alerta> : <Carregando />
      ) : (
        <form onSubmit={enviar}>
          <Card>
            <CardHeader>
              <CardTitle>Automóvel</CardTitle>
              <CardDescription>Selecione um dos automóveis da frota.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              {automoveis.length === 0 ? (
                <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Nenhum automóvel cadastrado ainda.
                </p>
              ) : (
                <RadioGroup
                  value={form.automovelId}
                  onValueChange={(automovelId) => setForm({ ...form, automovelId })}
                  className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
                  aria-label="Automóvel"
                >
                  {automoveis.map((a) => (
                    <Label
                      key={a.id}
                      htmlFor={`carro-${a.id}`}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 font-normal transition-colors hover:bg-muted/60 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10 has-[[data-state=checked]]:ring-1 has-[[data-state=checked]]:ring-primary"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        <Car className="size-5" />
                      </span>
                      <span className="flex-1">
                        <span className="block font-medium">{a.marca} {a.modelo}</span>
                        <span className="block text-xs text-muted-foreground">
                          {a.ano} · <span className="font-mono">{placa(a.placa)}</span>
                        </span>
                      </span>
                      <RadioGroupItem value={String(a.id)} id={`carro-${a.id}`} />
                    </Label>
                  ))}
                </RadioGroup>
              )}

              <Separator />

              <div className="grid gap-4">
                <div>
                  <h3 className="font-medium">Período</h3>
                  <p className="text-sm text-muted-foreground">
                    O automóvel não pode ter outro pedido ativo no mesmo período.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Campo label="Data de início" id="dataInicio" type="date" min={criando ? hojeISO() : undefined}
                    value={form.dataInicio} onChange={alterar} required />
                  <Campo label="Data de fim" id="dataFim" type="date" min={form.dataInicio || hojeISO()}
                    value={form.dataFim} onChange={alterar} required />
                </div>
                {diarias > 0 && <p className="text-sm text-muted-foreground">{diarias} diária(s)</p>}
              </div>

              <Alerta>{erro}</Alerta>
            </CardContent>
            <CardFooter className="justify-end border-t">
              <Button type="submit" disabled={enviando || automoveis.length === 0}>
                {enviando && <Loader2 className="animate-spin" />}
                {enviando ? 'Enviando…' : criando ? 'Enviar pedido' : 'Salvar alterações'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </>
  );
}
