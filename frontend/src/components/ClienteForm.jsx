import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Alerta from './Alerta';
import Campo from './Campo';
import RendimentosEditor, { MAX_RENDIMENTOS } from './RendimentosEditor';
import { mensagemDeErro } from '../utils/erro';

const VAZIO = { nome: '', rg: '', cpf: '', endereco: '', profissao: '', login: '', senha: '', rendimentos: [] };

function Secao({ titulo, descricao, children }) {
  return (
    <div className="grid gap-6 md:grid-cols-[14rem_1fr]">
      <div>
        <h3 className="font-medium">{titulo}</h3>
        {descricao && <p className="mt-1 text-sm text-muted-foreground">{descricao}</p>}
      </div>
      <div className="grid gap-4">{children}</div>
    </div>
  );
}

/**
 * Formulário de cliente usado na criação (agente), edição (agente) e em "Meus dados" (cliente).
 * Na criação, login e senha são obrigatórios; na edição a senha só é trocada se preenchida.
 */
export default function ClienteForm({ inicial, criando = false, textoBotao = 'Salvar', onSalvar, onCancelar }) {
  const [form, setForm] = useState(() => ({
    ...VAZIO,
    ...inicial,
    senha: '',
    rendimentos: (inicial?.rendimentos ?? []).map(({ entidadeEmpregadora, valor }) => ({ entidadeEmpregadora, valor })),
  }));
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const alterar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    const dados = {
      ...form,
      senha: form.senha || null,
      rendimentos: form.rendimentos.map((r) => ({ ...r, valor: Number(r.valor) })),
    };
    try {
      await onSalvar(dados);
      toast.success('Dados salvos com sucesso.');
      setForm((f) => ({ ...f, senha: '' }));
    } catch (err) {
      setErro(mensagemDeErro(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar}>
      <Card>
        <CardHeader>
          <CardTitle>Dados do cliente</CardTitle>
          <CardDescription>Identificação, rendimentos e acesso ao sistema.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <Secao titulo="Identificação" descricao="RG, CPF, endereço e profissão.">
            <Campo label="Nome completo" id="nome" value={form.nome} onChange={alterar} required />
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="CPF" id="cpf" value={form.cpf} onChange={alterar} placeholder="000.000.000-00" required />
              <Campo label="RG" id="rg" value={form.rg} onChange={alterar} required />
            </div>
            <Campo label="Endereço" id="endereco" value={form.endereco} onChange={alterar} required />
            <Campo label="Profissão" id="profissao" value={form.profissao} onChange={alterar} required />
          </Secao>

          <Separator />

          <Secao
            titulo="Empregadores e rendimentos"
            descricao={`Usados na análise financeira dos pedidos. Máximo de ${MAX_RENDIMENTOS}.`}
          >
            <RendimentosEditor rendimentos={form.rendimentos} onChange={(rendimentos) => setForm({ ...form, rendimentos })} />
          </Secao>

          <Separator />

          <Secao titulo="Acesso" descricao={criando ? 'Login e senha do cliente.' : 'Deixe a senha em branco para mantê-la.'}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Login" id="login" value={form.login} onChange={alterar} minLength={3} required autoComplete="username" />
              <Campo
                label={criando ? 'Senha' : 'Nova senha (opcional)'}
                id="senha"
                type="password"
                value={form.senha}
                onChange={alterar}
                minLength={6}
                required={criando}
                autoComplete="new-password"
              />
            </div>
          </Secao>

          <Alerta>{erro}</Alerta>
        </CardContent>
        <CardFooter className="justify-end gap-2 border-t">
          {onCancelar && (
            <Button type="button" variant="outline" onClick={onCancelar}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={enviando}>
            {enviando && <Loader2 className="animate-spin" />}
            {enviando ? 'Salvando…' : textoBotao}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
