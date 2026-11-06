import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from './authContext';
import api from '../services/api';
import * as authService from '../services/authService';

function lerUsuarioSalvo() {
  try {
    return JSON.parse(localStorage.getItem('usuario'));
  } catch {
    return null;
  }
}

export default function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(lerUsuarioSalvo);

  const salvarSessao = useCallback(({ token, usuario }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    setUsuario(usuario);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  }, []);

  const login = useCallback(
    async (login, senha) => salvarSessao(await authService.login(login, senha)),
    [salvarSessao],
  );

  const registrar = useCallback(
    async (dados) => salvarSessao(await authService.registrar(dados)),
    [salvarSessao],
  );

  // Token expirado ou inválido: encerra a sessão automaticamente.
  useEffect(() => {
    const id = api.interceptors.response.use(
      (resposta) => resposta,
      (erro) => {
        const ehLogin = erro.config?.url?.startsWith('/auth/');
        if (erro.response?.status === 401 && !ehLogin) logout();
        return Promise.reject(erro);
      },
    );
    return () => api.interceptors.response.eject(id);
  }, [logout]);

  const valor = useMemo(
    () => ({ usuario, autenticado: !!usuario, login, registrar, logout }),
    [usuario, login, registrar, logout],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
