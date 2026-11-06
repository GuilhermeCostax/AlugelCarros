import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alerta from '../components/Alerta';
import Carregando from '../components/Carregando';
import ClienteForm from '../components/ClienteForm';
import { useAuth } from '../context/useAuth';
import { atualizarCliente, buscarCliente, excluirCliente } from '../services/clienteService';
import { mensagemDeErro } from '../utils/erro';

export default function MeusDados() {
  const { usuario, atualizarUsuario, logout } = useAuth();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    buscarCliente(usuario.id).then(setCliente).catch((e) => setErro(mensagemDeErro(e)));
  }, [usuario.id]);

  async function salvar(dados) {
    const atualizado = await atualizarCliente(usuario.id, dados);
    setCliente(atualizado);
    atualizarUsuario({ nome: atualizado.nome, login: atualizado.login });
  }

  async function excluirConta() {
    if (!window.confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) return;
    try {
      await excluirCliente(usuario.id);
      logout();
      navigate('/login', { replace: true });
    } catch (e) {
      setErro(mensagemDeErro(e));
    }
  }

  return (
    <>
      <div className="cabecalho-pagina">
        <div>
          <h1>Meus dados</h1>
          <p className="subtitulo">Mantenha seus dados e rendimentos atualizados para a análise dos pedidos.</p>
        </div>
      </div>
      <Alerta>{erro}</Alerta>
      {cliente ? <ClienteForm key={cliente.id} inicial={cliente} onSalvar={salvar} /> : !erro && <Carregando />}

      {cliente && (
        <div className="card zona-perigo">
          <div>
            <h2 className="secao">Excluir conta</h2>
            <p>Remove permanentemente seu cadastro e seus rendimentos.</p>
          </div>
          <button className="btn btn-perigo" onClick={excluirConta}>Excluir minha conta</button>
        </div>
      )}
    </>
  );
}
