<?php
// Configuração de conexão com o banco de dados

$host = 'localhost';
$port = '3306';
$dbname = 'diario_db';
$username = 'root';
$password = '';

// Não lançar exceção fatal - deixar api.php tratar
$pdo = null;
$pdo_error = null;

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    // Não lançar exceção - apenas guardar o erro
    $pdo = null;
    $pdo_error = $e->getMessage();
}
?>

