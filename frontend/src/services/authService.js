import api from './api';

export async function login(login, senha) {
  const { data } = await api.post('/auth/login', { login, senha });
  return data;
}

export async function registrar(dados) {
  const { data } = await api.post('/auth/registro', dados);
  return data;
}
