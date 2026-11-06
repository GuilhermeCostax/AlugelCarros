import api from './api';

export const listarAutomoveis = () => api.get('/automoveis').then((r) => r.data);
export const criarAutomovel = (dados) => api.post('/automoveis', dados).then((r) => r.data);
export const atualizarAutomovel = (id, dados) => api.put(`/automoveis/${id}`, dados).then((r) => r.data);
export const excluirAutomovel = (id) => api.delete(`/automoveis/${id}`);
