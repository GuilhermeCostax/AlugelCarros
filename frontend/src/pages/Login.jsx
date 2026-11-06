import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Alerta from '../components/Alerta';
import Campo from '../components/Campo';
import Logo from '../components/Logo';
import { useAuth } from '../context/useAuth';
import { mensagemDeErro } from '../utils/erro';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ login: '', senha: '' });
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const alterar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await login(form.login, form.senha);
      navigate(location.state?.de?.pathname ?? '/', { replace: true });
    } catch (err) {
      setErro(mensagemDeErro(err, 'Login ou senha inválidos.'));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Logo grande className="self-center" />
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-lg">Bem-vindo de volta</CardTitle>
            <CardDescription>Entre com seu usuário e senha</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={enviar} className="grid gap-4">
              <Alerta>{erro}</Alerta>
              <Campo label="Login" id="login" value={form.login} onChange={alterar} autoComplete="username" required autoFocus />
              <Campo label="Senha" id="senha" type="password" value={form.senha} onChange={alterar} autoComplete="current-password" required />
              <Button type="submit" size="lg" className="w-full" disabled={enviando}>
                {enviando && <Loader2 className="animate-spin" />}
                {enviando ? 'Entrando…' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="text-center text-sm text-muted-foreground">
          Ainda não tem conta?{' '}
          <Link to="/registro" className="font-medium text-primary underline-offset-4 hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
