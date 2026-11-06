# Histórias de Usuário — Sistema de Aluguel de Carros

**Versão:** v2 · **Atores:** Usuário (não autenticado), Cliente, Agente (Empresa ou Banco), Banco

---

## Acesso ao sistema

### US01 — Cadastrar-se no sistema
**Como** usuário não cadastrado, **quero** criar uma conta informando login e senha, **para** poder usar o sistema.

**Critérios de aceitação**
- O login deve ser único.
- A senha é armazenada criptografada (BCrypt).
- O usuário escolhe o perfil: Cliente, Empresa ou Banco.
- Cliente informa RG, CPF, nome, endereço e profissão. Empresa e Banco informam nome e CNPJ.

### US02 — Fazer login
**Como** usuário cadastrado, **quero** entrar com login e senha, **para** acessar as funcionalidades do meu perfil.

**Critérios de aceitação**
- Credenciais inválidas exibem mensagem de erro e não liberam acesso.
- Nenhuma tela (além de login e cadastro) é acessível sem autenticação.
- Após o login, o usuário vê apenas o menu do seu perfil.

### US03 — Sair do sistema
**Como** usuário autenticado, **quero** fazer logout, **para** encerrar minha sessão com segurança.

---

## Gestão de clientes

### US04 — Manter dados do cliente (CRUD)
**Como** cliente, **quero** consultar, editar e excluir meus dados cadastrais, **para** mantê-los atualizados.

**Critérios de aceitação**
- Dados: RG, CPF, nome, endereço, profissão.
- CPF e RG são únicos e o CPF é validado.
- Exclusão só é permitida se o cliente não possuir contrato ativo.

### US05 — Informar empregadores e rendimentos
**Como** cliente, **quero** registrar minhas entidades empregadoras e os rendimentos de cada uma, **para** que os agentes possam analisar meus pedidos financeiramente.

**Critérios de aceitação**
- Máximo de **3** rendimentos por cliente.
- Cada rendimento tem entidade empregadora e valor (> 0).
- O sistema exibe o total de rendimentos.

### US17 — Gerenciar clientes (agente)
**Como** agente (empresa ou banco), **quero** listar, cadastrar, editar e excluir clientes, **para** manter a base de contratantes que vou analisar.

**Critérios de aceitação**
- A lista mostra nome, CPF, profissão, quantidade de rendimentos e renda total.
- Ao cadastrar, o agente define login e senha do cliente.
- Clientes não têm acesso a esta funcionalidade; cada cliente só acessa os próprios dados (US04).

---

## Automóveis

### US06 — Cadastrar automóveis
**Como** agente (empresa ou banco), **quero** cadastrar, editar e remover automóveis, **para** disponibilizá-los para aluguel.

**Critérios de aceitação**
- Dados: matrícula, ano, marca, modelo e placa.
- Matrícula e placa são únicas; a placa segue o padrão antigo (ABC-1234) ou Mercosul (ABC1D23).
- Ao ser cadastrado, o automóvel fica registrado em nome do agente que o cadastrou.
- Automóveis que já possuem pedidos não podem ser excluídos.

### US07 — Consultar automóveis disponíveis
**Como** cliente, **quero** ver os automóveis disponíveis, **para** escolher qual alugar.

---

## Pedidos de aluguel (cliente)

### US08 — Criar pedido de aluguel
**Como** cliente, **quero** criar um pedido escolhendo um automóvel e o período, **para** solicitar um aluguel.

**Critérios de aceitação**
- A data de fim deve ser posterior à data de início e a de início não pode estar no passado.
- O automóvel não pode ter outro pedido ativo (PENDENTE, APROVADO ou CONTRATADO) em período sobreposto.
- O pedido é criado com status **PENDENTE**.

### US09 — Consultar meus pedidos e status
**Como** cliente, **quero** listar meus pedidos e ver o status de cada um, **para** acompanhar a análise.

**Critérios de aceitação**
- Status possíveis: PENDENTE, APROVADO, REPROVADO, CONTRATADO, CANCELADO.
- O parecer do agente fica visível quando existir.

### US10 — Modificar pedido
**Como** cliente, **quero** alterar o automóvel ou o período de um pedido, **para** ajustar minha solicitação.

**Critérios de aceitação**
- Só é permitido enquanto o pedido estiver **PENDENTE**.

### US11 — Cancelar pedido
**Como** cliente, **quero** cancelar um pedido, **para** desistir do aluguel.

**Critérios de aceitação**
- Permitido para pedidos PENDENTE ou APROVADO (ainda não contratados).
- O status passa para **CANCELADO**.

---

## Pedidos de aluguel (agente)

### US12 — Listar pedidos para análise
**Como** agente, **quero** ver os pedidos pendentes com os dados financeiros do cliente, **para** analisá-los.

### US13 — Modificar pedido
**Como** agente, **quero** ajustar dados de um pedido (período, automóvel), **para** adequá-lo antes da aprovação.

**Critérios de aceitação**
- Só é permitido para pedidos PENDENTE ou APROVADO.
- A verificação de conflito de datas também é aplicada.

### US14 — Avaliar pedido (parecer financeiro)
**Como** agente, **quero** aprovar ou reprovar um pedido com um parecer, **para** registrar a análise financeira.

**Critérios de aceitação**
- Só pedidos PENDENTE podem ser avaliados.
- Parecer positivo → **APROVADO**; negativo → **REPROVADO**.
- O agente responsável e a data da avaliação ficam registrados.

### US15 — Executar contrato
**Como** agente, **quero** gerar o contrato de um pedido aprovado, **para** formalizar o aluguel.

**Critérios de aceitação**
- Só pedidos APROVADO geram contrato; o pedido passa para **CONTRATADO**.
- O agente informa o valor total do contrato; o agente executor e a data de assinatura ficam registrados.
- O contrato define o tipo de proprietário do automóvel: **Cliente, Empresa ou Banco**, e o automóvel passa a ser registrado em nome dele.
- O automóvel pode ser registrado em nome do cliente ou do próprio agente que executa o contrato (uma empresa não registra em nome de um banco, e vice-versa).

### US16 — Conceder contrato de crédito
**Como** banco, **quero** associar um contrato de crédito ao aluguel, **para** financiar o cliente.

**Critérios de aceitação**
- Apenas usuários do perfil Banco podem conceder crédito.
- Dados: valor, taxa de juros, número de parcelas.
- O crédito é opcional e associado a no máximo um contrato.
- O valor do crédito não pode ser maior que o valor total do contrato.
- O sistema calcula o valor da parcela pela Tabela Price.

### US18 — Consultar contratos
**Como** usuário autenticado, **quero** listar os contratos, **para** acompanhar aluguéis e créditos concedidos.

**Critérios de aceitação**
- Agentes veem todos os contratos; o cliente vê apenas os próprios.
- A lista mostra cliente, automóvel, data, tipo de registro, valor e crédito (se houver).

---

## Histórico de versões

| Versão | Alterações |
| :--- | :--- |
| v1 | Versão inicial com as histórias US01 a US16. |
| v2 | Adicionadas US17 (gestão de clientes pelo agente) e US18 (consultar contratos). Critérios refinados durante a implementação: conflito de datas por automóvel, regra de registro do automóvel no contrato, limite do crédito ao valor do contrato e cálculo da parcela. |
