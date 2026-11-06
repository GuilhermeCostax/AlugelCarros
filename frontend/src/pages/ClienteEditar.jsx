import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Alerta from '../components/Alerta';
import CabecalhoPagina from '../components/CabecalhoPagina';
import Carregando from '../components/Carregando';
import ClienteForm from '../components/ClienteForm';
import { atualizarCliente, buscarCliente, criarCliente } from '../services/clienteService';
import { mensagemDeErro } from '../utils/erro';

/** Criação (/clientes/novo) e edição (/clientes/:id/editar) de cliente pelo agente. */
export default function ClienteEditar() {
  const { id } = useParams();
  const criando = !id;
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(criando ? {} : null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!criando) buscarCliente(id).then(setCliente).catch((e) => setErro(mensagemDeErro(e)));
  }, [id, criando]);

  async function salvar(dados) {
    if (criando) await criarCliente(dados);
    else await atualizarCliente(id, dados);
    navigate('/clientes');
  }

  return (
    <>
      <CabecalhoPagina
        voltar={{ to: '/clientes', rotulo: 'Clientes' }}
        titulo={criando ? 'Novo cliente' : 'Editar cliente'}
        descricao={criando ? 'Cadastre um novo contratante.' : cliente?.nome}
      />
      <div className="grid gap-6">
        <Alerta>{erro}</Alerta>
        {cliente ? (
          <ClienteForm
            inicial={cliente}
            criando={criando}
            textoBotao={criando ? 'Cadastrar cliente' : 'Salvar alterações'}
            onSalvar={salvar}
            onCancelar={() => navigate('/clientes')}
          />
        ) : (
          !erro && <Carregando />
        )}
      </div>
    </>
  );
}
