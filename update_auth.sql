-- Script para atualizar banco de dados existente com sistema de autenticação
-- Execute este script se você já tem um banco de dados criado

USE diario_db;

-- Criar tabela de usuários se não existir
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar coluna user_id nas tabelas existentes (se não existir)
ALTER TABLE anotacoes ADD COLUMN IF NOT EXISTS user_id INT;
ALTER TABLE lembretes ADD COLUMN IF NOT EXISTS user_id INT;
ALTER TABLE contas ADD COLUMN IF NOT EXISTS user_id INT;
ALTER TABLE despesas ADD COLUMN IF NOT EXISTS user_id INT;
ALTER TABLE diarios ADD COLUMN IF NOT EXISTS user_id INT;

-- Adicionar foreign keys (se não existir)
-- Nota: Pode dar erro se já existir, mas não é problema
ALTER TABLE anotacoes ADD FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE;
ALTER TABLE lembretes ADD FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE;
ALTER TABLE contas ADD FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE;
ALTER TABLE despesas ADD FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE;
ALTER TABLE diarios ADD FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE;

