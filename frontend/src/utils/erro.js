/** Extrai uma mensagem legível de um erro do axios/backend. */
export function mensagemDeErro(erro, padrao = 'Não foi possível concluir a operação.') {
  const dados = erro?.response?.data;
  if (!erro?.response) return 'Não foi possível conectar ao servidor.';
  const campos = dados?.erros ? Object.values(dados.erros) : [];
  if (campos.length) return campos.join(' · ');
  return dados?.mensagem ?? padrao;
}
