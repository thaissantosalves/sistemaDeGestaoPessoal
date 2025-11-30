-- Script para atualizar o banco de dados existente com campos de foto
-- Execute este script se você já tem um banco de dados criado
-- Se algum campo já existir, você receberá um erro, mas pode ignorá-lo

USE diario_db;

-- Adicionar campo foto na tabela anotacoes
-- Se o campo já existir, você receberá um erro que pode ser ignorado
ALTER TABLE anotacoes 
ADD COLUMN foto VARCHAR(255) DEFAULT NULL;

-- Adicionar campo foto na tabela despesas
ALTER TABLE despesas 
ADD COLUMN foto VARCHAR(255) DEFAULT NULL;

-- Adicionar campo foto na tabela diarios
ALTER TABLE diarios 
ADD COLUMN foto VARCHAR(255) DEFAULT NULL;

