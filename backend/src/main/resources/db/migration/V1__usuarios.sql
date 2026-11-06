-- Usuários do sistema (herança JOINED: usuario -> cliente | agente -> empresa | banco)
CREATE TABLE usuario (
    id          BIGSERIAL PRIMARY KEY,
    tipo        VARCHAR(20)  NOT NULL,
    login       VARCHAR(60)  NOT NULL UNIQUE,
    senha       VARCHAR(100) NOT NULL,
    nome        VARCHAR(120) NOT NULL
);

CREATE TABLE cliente (
    id          BIGINT PRIMARY KEY REFERENCES usuario (id) ON DELETE CASCADE,
    rg          VARCHAR(20)  NOT NULL UNIQUE,
    cpf         VARCHAR(11)  NOT NULL UNIQUE,
    endereco    VARCHAR(200) NOT NULL,
    profissao   VARCHAR(80)  NOT NULL
);

CREATE TABLE agente (
    id          BIGINT PRIMARY KEY REFERENCES usuario (id) ON DELETE CASCADE,
    cnpj        VARCHAR(14)  NOT NULL UNIQUE
);

CREATE TABLE empresa (
    id          BIGINT PRIMARY KEY REFERENCES agente (id) ON DELETE CASCADE
);

CREATE TABLE banco (
    id          BIGINT PRIMARY KEY REFERENCES agente (id) ON DELETE CASCADE
);

-- Rendimentos do cliente (máximo 3, regra garantida na aplicação)
CREATE TABLE rendimento (
    id                   BIGSERIAL PRIMARY KEY,
    cliente_id           BIGINT        NOT NULL REFERENCES cliente (id) ON DELETE CASCADE,
    entidade_empregadora VARCHAR(120)  NOT NULL,
    valor                NUMERIC(12,2) NOT NULL CHECK (valor > 0)
);
