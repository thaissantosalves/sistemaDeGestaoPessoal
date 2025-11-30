<?php
header('Content-Type: application/json');

// Iniciar sessão
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once 'config.php';

if ($pdo === null) {
    echo json_encode(['success' => false, 'error' => 'Erro de conexão com o banco de dados']);
    exit;
}

$acao = $_POST['acao'] ?? '';

switch($acao) {
    case 'registro':
        try {
            $nome = trim($_POST['nome'] ?? '');
            $email = trim($_POST['email'] ?? '');
            $senha = $_POST['senha'] ?? '';
            
            if (empty($nome) || empty($email) || empty($senha)) {
                echo json_encode(['success' => false, 'error' => 'Todos os campos são obrigatórios']);
                exit;
            }
            
            if (strlen($senha) < 6) {
                echo json_encode(['success' => false, 'error' => 'A senha deve ter no mínimo 6 caracteres']);
                exit;
            }
            
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                echo json_encode(['success' => false, 'error' => 'Email inválido']);
                exit;
            }
            
            // Verificar se email já existe
            $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                echo json_encode(['success' => false, 'error' => 'Este email já está cadastrado']);
                exit;
            }
            
            // Criar hash da senha
            $senhaHash = password_hash($senha, PASSWORD_DEFAULT);
            
            // Inserir usuário
            $stmt = $pdo->prepare("INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)");
            $stmt->execute([$nome, $email, $senhaHash]);
            
            echo json_encode(['success' => true, 'message' => 'Usuário cadastrado com sucesso!']);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'error' => 'Erro ao cadastrar: ' . $e->getMessage()]);
        }
        break;
    
    case 'login':
        try {
            $email = trim($_POST['email'] ?? '');
            $senha = $_POST['senha'] ?? '';
            
            if (empty($email) || empty($senha)) {
                echo json_encode(['success' => false, 'error' => 'Email e senha são obrigatórios']);
                exit;
            }
            
            // Buscar usuário
            $stmt = $pdo->prepare("SELECT id, nome, senha FROM usuarios WHERE email = ?");
            $stmt->execute([$email]);
            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$usuario || !password_verify($senha, $usuario['senha'])) {
                echo json_encode(['success' => false, 'error' => 'Email ou senha incorretos']);
                exit;
            }
            
            // Criar sessão
            $_SESSION['user_id'] = $usuario['id'];
            $_SESSION['user_nome'] = $usuario['nome'];
            $_SESSION['user_email'] = $email;
            
            echo json_encode(['success' => true, 'message' => 'Login realizado com sucesso!']);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'error' => 'Erro ao fazer login: ' . $e->getMessage()]);
        }
        break;
    
    case 'logout':
        session_destroy();
        echo json_encode(['success' => true, 'message' => 'Logout realizado com sucesso!']);
        break;
    
    case 'verificar_sessao':
        if (isset($_SESSION['user_id'])) {
            echo json_encode([
                'success' => true,
                'user_id' => $_SESSION['user_id'],
                'user_nome' => $_SESSION['user_nome'] ?? '',
                'user_email' => $_SESSION['user_email'] ?? ''
            ]);
        } else {
            echo json_encode(['success' => false]);
        }
        break;
    
    default:
        echo json_encode(['success' => false, 'error' => 'Ação não reconhecida']);
        break;
}
?>

