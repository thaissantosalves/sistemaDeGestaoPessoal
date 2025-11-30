<?php
// Iniciar sessão se não estiver iniciada
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Função para verificar se o usuário está logado
function verificarLogin() {
    if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_nome'])) {
        return false;
    }
    return true;
}

// Função para obter ID do usuário logado
function getUserId() {
    return $_SESSION['user_id'] ?? null;
}

// Função para obter nome do usuário logado
function getUserNome() {
    return $_SESSION['user_nome'] ?? null;
}

// Função para redirecionar se não estiver logado
function requerLogin() {
    if (!verificarLogin()) {
        header('Location: login.html');
        exit;
    }
}
?>

