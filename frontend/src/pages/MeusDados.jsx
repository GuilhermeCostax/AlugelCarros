import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import Alerta from '../components/Alerta';
import CabecalhoPagina from '../components/CabecalhoPagina';
import Carregando from '../components/Carregando';
import ClienteForm from '../components/ClienteForm';
import Confirmar from '../components/Confirmar';
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
    try {
      await excluirCliente(usuario.id);
      logout();
      toast.success('Conta excluída.');
      navigate('/login', { replace: true });
    } catch (e) {
      setErro(mensagemDeErro(e));
    }
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Meus dados"
        descricao="Mantenha seus dados e rendimentos atualizados para a análise dos pedidos."
      />
      <div className="grid gap-6">
        <Alerta>{erro}</Alerta>
        {cliente ? <ClienteForm key={cliente.id} inicial={cliente} onSalvar={salvar} /> : !erro && <Carregando />}

        {cliente && (
          <Card className="ring-destructive/30">
            <CardHeader>
              <CardTitle className="text-destructive">Excluir conta</CardTitle>
              <CardDescription>Remove permanentemente seu cadastro e seus rendimentos.</CardDescription>
              <CardAction>
                <Confirmar
                  titulo="Excluir sua conta?"
                  descricao="Esta ação não pode ser desfeita. Contas com contrato ativo não podem ser excluídas."
                  textoConfirmar="Excluir conta"
                  onConfirmar={excluirConta}
                >
                  <Button variant="destructive">
                    <Trash2 /> Excluir minha conta
                  </Button>
                </Confirmar>
              </CardAction>
            </CardHeader>
          </Card>
        )}
      </div>
    </>
  );
}
