import { useState } from 'react';
import Alerta from './Alerta';
import Campo from './Campo';
import RendimentosEditor from './RendimentosEditor';
import { mensagemDeErro } from '../utils/erro';

const VAZIO = { nome: '', rg: '', cpf: '', endereco: '', profissao: '', login: '', senha: '', rendimentos: [] };

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
  const [sucesso, setSucesso] = useState('');
  const [enviando, setEnviando] = useState(false);

  const alterar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    setSucesso('');
    setEnviando(true);
    const dados = {
      ...form,
      senha: form.senha || null,
      rendimentos: form.rendimentos.map((r) => ({ ...r, valor: Number(r.valor) })),
    };
    try {
      await onSalvar(dados);
      setSucesso('Dados salvos com sucesso.');
      setForm((f) => ({ ...f, senha: '' }));
    } catch (err) {
      setErro(mensagemDeErro(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="card" onSubmit={enviar}>
      <h2 className="secao">Identificação</h2>
      <Campo label="Nome completo" id="nome" value={form.nome} onChange={alterar} required />
      <div className="grade-2">
        <Campo label="CPF" id="cpf" value={form.cpf} onChange={alterar} placeholder="000.000.000-00" required />
        <Campo label="RG" id="rg" value={form.rg} onChange={alterar} required />
      </div>
      <Campo label="Endereço" id="endereco" value={form.endereco} onChange={alterar} required />
      <Campo label="Profissão" id="profissao" value={form.profissao} onChange={alterar} required />

      <RendimentosEditor
        rendimentos={form.rendimentos}
        onChange={(rendimentos) => setForm({ ...form, rendimentos })}
      />

      <h2 className="secao">Acesso</h2>
      <div className="grade-2">
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

      <Alerta>{erro}</Alerta>
      <Alerta tipo="sucesso">{sucesso}</Alerta>

      <div className="acoes">
        {onCancelar && (
          <button type="button" className="btn btn-secundario" onClick={onCancelar}>Cancelar</button>
        )}
        <button className="btn btn-primario" disabled={enviando}>{enviando ? 'Salvando…' : textoBotao}</button>
      </div>
    </form>
  );
}
