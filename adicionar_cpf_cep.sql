-- Script para adicionar campos CPF e CEP na tabela de usuários
-- Execute este script se você já tem a tabela usuarios criada

USE diario_db;

-- Adicionar colunas CPF e CEP se não existirem
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS cpf VARCHAR(14) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS cep VARCHAR(9) NOT NULL DEFAULT '';

-- Adicionar índice único para CPF
ALTER TABLE usuarios 
ADD UNIQUE INDEX IF NOT EXISTS idx_cpf (cpf);

-- Se você já tem dados, pode precisar atualizar os valores DEFAULT
-- ALTER TABLE usuarios ALTER COLUMN cpf DROP DEFAULT;
-- ALTER TABLE usuarios ALTER COLUMN cep DROP DEFAULT;

