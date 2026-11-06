import { Building2, Landmark, Loader2, User } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Alerta from '../components/Alerta';
import Campo from '../components/Campo';
import Logo from '../components/Logo';
import { useAuth } from '../context/useAuth';
import { mensagemDeErro } from '../utils/erro';

const OPCOES = [
  { valor: 'CLIENTE', rotulo: 'Cliente', Icone: User },
  { valor: 'EMPRESA', rotulo: 'Empresa', Icone: Building2 },
  { valor: 'BANCO', rotulo: 'Banco', Icone: Landmark },
];

const VAZIO = { perfil: 'CLIENTE', login: '', senha: '', nome: '', rg: '', cpf: '', endereco: '', profissao: '', cnpj: '' };

export default function Registro() {
  const { registrar } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(VAZIO);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const ehCliente = form.perfil === 'CLIENTE';
  const alterar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    const { perfil, login, senha, nome, rg, cpf, endereco, profissao, cnpj } = form;
    const dados = ehCliente
      ? { perfil, login, senha, nome, rg, cpf, endereco, profissao }
      : { perfil, login, senha, nome, cnpj };
    try {
      await registrar(dados);
      navigate('/', { replace: true });
    } catch (err) {
      setErro(mensagemDeErro(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <div className="flex w-full max-w-lg flex-col gap-6">
        <Logo grande className="self-center" />
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-lg">Criar conta</CardTitle>
            <CardDescription>Escolha o tipo de conta e preencha seus dados</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={enviar} className="grid gap-4">
              <Alerta>{erro}</Alerta>

              <RadioGroup
                value={form.perfil}
                onValueChange={(perfil) => setForm({ ...form, perfil })}
                className="grid grid-cols-3 gap-2"
                aria-label="Tipo de conta"
              >
                {OPCOES.map(({ valor, rotulo, Icone }) => (
                  <Label
                    key={valor}
                    htmlFor={`perfil-${valor}`}
                    className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors hover:bg-muted has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10 has-[[data-state=checked]]:ring-1 has-[[data-state=checked]]:ring-primary has-[[data-state=checked]]:text-primary"
                  >
                    <RadioGroupItem value={valor} id={`perfil-${valor}`} className="sr-only" />
                    <Icone className="size-5" />
                    {rotulo}
                  </Label>
                ))}
              </RadioGroup>

              <Campo label={ehCliente ? 'Nome completo' : 'Razão social'} id="nome" value={form.nome} onChange={alterar} required />

              {ehCliente ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Campo label="CPF" id="cpf" value={form.cpf} onChange={alterar} placeholder="000.000.000-00" required />
                    <Campo label="RG" id="rg" value={form.rg} onChange={alterar} placeholder="MG-00.000.000" required />
                  </div>
                  <Campo label="Endereço" id="endereco" value={form.endereco} onChange={alterar} required />
                  <Campo label="Profissão" id="profissao" value={form.profissao} onChange={alterar} required />
                </>
              ) : (
                <Campo label="CNPJ" id="cnpj" value={form.cnpj} onChange={alterar} placeholder="00.000.000/0000-00" required />
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <Campo label="Login" id="login" value={form.login} onChange={alterar} autoComplete="username" minLength={3} required />
                <Campo label="Senha" id="senha" type="password" value={form.senha} onChange={alterar} autoComplete="new-password" minLength={6} required />
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={enviando}>
                {enviando && <Loader2 className="animate-spin" />}
                {enviando ? 'Cadastrando…' : 'Cadastrar'}
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{' '}
          <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
