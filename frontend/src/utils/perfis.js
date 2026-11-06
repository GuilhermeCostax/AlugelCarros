export const PERFIS = {
  CLIENTE: 'Cliente',
  EMPRESA: 'Empresa',
  BANCO: 'Banco',
};

export const ehAgente = (perfil) => perfil === 'EMPRESA' || perfil === 'BANCO';
