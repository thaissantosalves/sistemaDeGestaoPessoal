<?php
// Configuração de conexão com o banco de dados

$host = 'localhost';
$port = '3307'; // Altere para 3307 se for o caso
$dbname = 'diario_db';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    throw new Exception("Erro de conexão com o banco de dados: " . $e->getMessage());
}
?>

