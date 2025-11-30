CREATE DATABASE IF NOT EXISTS diario_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE diario_db;

-- ========== ANOTAÇÕES ==========
CREATE TABLE IF NOT EXISTS anotacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    conteudo TEXT NOT NULL,
    categoria VARCHAR(50) DEFAULT 'Geral',
    foto VARCHAR(255) DEFAULT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== LEMBRETES ==========
CREATE TABLE IF NOT EXISTS lembretes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descricao TEXT NOT NULL,
    concluido TINYINT(1) DEFAULT 0,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== CONTAS (Bancárias/Financeiras) ==========
CREATE TABLE IF NOT EXISTS contas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    instituicao VARCHAR(255) NOT NULL,
    tipo_conta VARCHAR(50) NOT NULL,
    numero_conta VARCHAR(100),
    saldo DECIMAL(10, 2) DEFAULT 0.00,
    descricao TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== DESPESAS ==========
CREATE TABLE IF NOT EXISTS despesas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    conta_id INT,
    data_vencimento DATE,
    pago TINYINT(1) DEFAULT 0,
    observacoes TEXT,
    foto VARCHAR(255) DEFAULT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conta_id) REFERENCES contas(id) ON DELETE SET NULL
);

-- ========== DIÁRIO PESSOAL ==========
CREATE TABLE IF NOT EXISTS diarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    conteudo TEXT NOT NULL,
    humor VARCHAR(20),
    tag VARCHAR(50),
    foto VARCHAR(255) DEFAULT NULL,
    data_diario DATE NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

