import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alerta from '../components/Alerta';
import Campo from '../components/Campo';
import { useAuth } from '../context/useAuth';
import { mensagemDeErro } from '../utils/erro';
import { PERFIS } from '../utils/perfis';

const VAZIO = {
  perfil: 'CLIENTE',
  login: '',
  senha: '',
  nome: '',
  rg: '',
  cpf: '',
  endereco: '',
  profissao: '',
  cnpj: '',
};

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
    <div className="auth-pagina">
      <form className="card auth-card auth-card-largo" onSubmit={enviar}>
        <h1>Criar conta</h1>
        <p className="subtitulo">Escolha o tipo de conta e preencha seus dados</p>
        <Alerta>{erro}</Alerta>

        <div className="seletor-perfil" role="radiogroup" aria-label="Tipo de conta">
          {Object.entries(PERFIS).map(([valor, rotulo]) => (
            <label key={valor} className={form.perfil === valor ? 'ativo' : ''}>
              <input type="radio" name="perfil" value={valor} checked={form.perfil === valor} onChange={alterar} />
              {rotulo}
            </label>
          ))}
        </div>

        <Campo label={ehCliente ? 'Nome completo' : 'Razão social'} id="nome" value={form.nome} onChange={alterar} required />

        {ehCliente ? (
          <>
            <div className="grade-2">
              <Campo label="CPF" id="cpf" value={form.cpf} onChange={alterar} placeholder="000.000.000-00" required />
              <Campo label="RG" id="rg" value={form.rg} onChange={alterar} placeholder="MG-00.000.000" required />
            </div>
            <Campo label="Endereço" id="endereco" value={form.endereco} onChange={alterar} required />
            <Campo label="Profissão" id="profissao" value={form.profissao} onChange={alterar} required />
          </>
        ) : (
          <Campo label="CNPJ" id="cnpj" value={form.cnpj} onChange={alterar} placeholder="00.000.000/0000-00" required />
        )}

        <div className="grade-2">
          <Campo label="Login" id="login" value={form.login} onChange={alterar} autoComplete="username" minLength={3} required />
          <Campo label="Senha" id="senha" type="password" value={form.senha} onChange={alterar} autoComplete="new-password" minLength={6} required />
        </div>

        <button className="btn btn-primario btn-bloco" disabled={enviando}>
          {enviando ? 'Cadastrando…' : 'Cadastrar'}
        </button>
        <p className="rodape-form">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </form>
    </div>
  );
}
