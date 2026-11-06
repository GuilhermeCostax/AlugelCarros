import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Alerta from '../components/Alerta';
import Campo from '../components/Campo';
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
    <div className="auth-pagina">
      <form className="card auth-card" onSubmit={enviar}>
        <h1>🚗 AluguelCarros</h1>
        <p className="subtitulo">Entre com seu usuário e senha</p>
        <Alerta>{erro}</Alerta>
        <Campo label="Login" id="login" value={form.login} onChange={alterar} autoComplete="username" required autoFocus />
        <Campo label="Senha" id="senha" type="password" value={form.senha} onChange={alterar} autoComplete="current-password" required />
        <button className="btn btn-primario btn-bloco" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
        <p className="rodape-form">
          Ainda não tem conta? <Link to="/registro">Cadastre-se</Link>
        </p>
      </form>
    </div>
  );
}
