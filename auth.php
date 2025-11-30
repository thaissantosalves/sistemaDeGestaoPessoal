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

// Função para validar CPF
function validarCPF($cpf) {
    $cpf = preg_replace('/[^0-9]/', '', $cpf);
    
    if (strlen($cpf) != 11) {
        return false;
    }
    
    // Verificar se todos os dígitos são iguais
    if (preg_match('/(\d)\1{10}/', $cpf)) {
        return false;
    }
    
    // Validar dígitos verificadores
    for ($t = 9; $t < 11; $t++) {
        for ($d = 0, $c = 0; $c < $t; $c++) {
            $d += $cpf[$c] * (($t + 1) - $c);
        }
        $d = ((10 * $d) % 11) % 10;
        if ($cpf[$c] != $d) {
            return false;
        }
    }
    
    return true;
}

$acao = $_POST['acao'] ?? '';

switch($acao) {
    case 'registro':
        try {
            $nome = trim($_POST['nome'] ?? '');
            $email = trim($_POST['email'] ?? '');
            $cpf = preg_replace('/[^0-9]/', '', $_POST['cpf'] ?? '');
            $cep = preg_replace('/[^0-9]/', '', $_POST['cep'] ?? '');
            $senha = $_POST['senha'] ?? '';
            
            if (empty($nome) || empty($email) || empty($cpf) || empty($cep) || empty($senha)) {
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
            
            // Validar CPF
            if (!validarCPF($cpf)) {
                echo json_encode(['success' => false, 'error' => 'CPF inválido']);
                exit;
            }
            
            // Validar CEP
            if (strlen($cep) !== 8) {
                echo json_encode(['success' => false, 'error' => 'CEP deve ter 8 dígitos']);
                exit;
            }
            
            // Verificar se email já existe
            $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                echo json_encode(['success' => false, 'error' => 'Este email já está cadastrado']);
                exit;
            }
            
            // Verificar se CPF já existe
            $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE cpf = ?");
            $stmt->execute([$cpf]);
            if ($stmt->fetch()) {
                echo json_encode(['success' => false, 'error' => 'Este CPF já está cadastrado']);
                exit;
            }
            
            // Criar hash da senha
            $senhaHash = password_hash($senha, PASSWORD_DEFAULT);
            
            // Formatar CPF e CEP
            $cpfFormatado = substr($cpf, 0, 3) . '.' . substr($cpf, 3, 3) . '.' . substr($cpf, 6, 3) . '-' . substr($cpf, 9, 2);
            $cepFormatado = substr($cep, 0, 5) . '-' . substr($cep, 5, 3);
            
            // Inserir usuário
            $stmt = $pdo->prepare("INSERT INTO usuarios (nome, email, cpf, cep, senha) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$nome, $email, $cpfFormatado, $cepFormatado, $senhaHash]);
            
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

