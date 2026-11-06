-- Automóveis disponíveis para aluguel
CREATE TABLE automovel (
    id              BIGSERIAL PRIMARY KEY,
    matricula       VARCHAR(30) NOT NULL UNIQUE,
    ano             INTEGER     NOT NULL,
    marca           VARCHAR(60) NOT NULL,
    modelo          VARCHAR(60) NOT NULL,
    placa           VARCHAR(8)  NOT NULL UNIQUE,
    proprietario_id BIGINT REFERENCES usuario (id) ON DELETE SET NULL
);

-- Pedidos de aluguel feitos pelos clientes e avaliados pelos agentes
CREATE TABLE pedido_aluguel (
    id                  BIGSERIAL PRIMARY KEY,
    cliente_id          BIGINT      NOT NULL REFERENCES cliente (id) ON DELETE CASCADE,
    automovel_id        BIGINT      NOT NULL REFERENCES automovel (id),
    data_criacao        TIMESTAMP   NOT NULL,
    data_inicio         DATE        NOT NULL,
    data_fim            DATE        NOT NULL,
    status              VARCHAR(20) NOT NULL,
    parecer             VARCHAR(500),
    data_avaliacao      TIMESTAMP,
    agente_avaliador_id BIGINT REFERENCES agente (id) ON DELETE SET NULL,
    CHECK (data_fim > data_inicio)
);

CREATE INDEX idx_pedido_cliente ON pedido_aluguel (cliente_id);
CREATE INDEX idx_pedido_automovel ON pedido_aluguel (automovel_id);

-- Contrato gerado a partir de um pedido aprovado
CREATE TABLE contrato (
    id                BIGSERIAL PRIMARY KEY,
    pedido_id         BIGINT        NOT NULL UNIQUE REFERENCES pedido_aluguel (id) ON DELETE CASCADE,
    agente_id         BIGINT REFERENCES agente (id) ON DELETE SET NULL,
    data_assinatura   DATE          NOT NULL,
    valor_total       NUMERIC(12,2) NOT NULL CHECK (valor_total > 0),
    tipo_proprietario VARCHAR(20)   NOT NULL
);

-- Contrato de crédito (opcional) concedido por um banco
CREATE TABLE contrato_credito (
    id              BIGSERIAL PRIMARY KEY,
    contrato_id     BIGINT        NOT NULL UNIQUE REFERENCES contrato (id) ON DELETE CASCADE,
    banco_id        BIGINT        NOT NULL REFERENCES banco (id),
    valor           NUMERIC(12,2) NOT NULL CHECK (valor > 0),
    taxa_juros      NUMERIC(6,3)  NOT NULL CHECK (taxa_juros >= 0),
    numero_parcelas INTEGER       NOT NULL CHECK (numero_parcelas > 0)
);
