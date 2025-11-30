<?php
header('Content-Type: application/json');

// Tente conectar ao banco
try {
    require_once 'config.php';
} catch(Exception $e) {
    echo json_encode(['error' => 'Erro de conexão com o banco de dados: ' . $e->getMessage()]);
    exit;
}

// Criar diretório de uploads se não existir
if (!file_exists('uploads')) {
    mkdir('uploads', 0777, true);
}

function uploadFoto($file, $prefixo = '') {
    if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
        return null;
    }
    
    $extensoesPermitidas = ['jpg', 'jpeg', 'png', 'gif'];
    $extensao = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    
    if (!in_array($extensao, $extensoesPermitidas)) {
        return null;
    }
    
    $nomeArquivo = $prefixo . '_' . time() . '_' . uniqid() . '.' . $extensao;
    $caminho = 'uploads/' . $nomeArquivo;
    
    if (move_uploaded_file($file['tmp_name'], $caminho)) {
        return $nomeArquivo;
    }
    
    return null;
}

$acao = $_GET['acao'] ?? $_POST['acao'] ?? '';

switch($acao) {
    // ========== ANOTAÇÕES ==========
    case 'listar_anotacoes':
        try {
            $stmt = $pdo->query("SELECT * FROM anotacoes ORDER BY data_criacao DESC");
            $anotacoes = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($anotacoes);
        } catch(PDOException $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;
    
    case 'adicionar_anotacao':
        try {
            $titulo = $_POST['titulo'] ?? '';
            $conteudo = $_POST['conteudo'] ?? '';
            $foto = null;
            
            if (isset($_FILES['foto']) && $_FILES['foto']['error'] === UPLOAD_ERR_OK) {
                $foto = uploadFoto($_FILES['foto'], 'anotacao');
            }
            
            $stmt = $pdo->prepare("INSERT INTO anotacoes (titulo, conteudo, foto) VALUES (?, ?, ?)");
            $stmt->execute([$titulo, $conteudo, $foto]);
            
            echo json_encode(['success' => true]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;
    
    case 'deletar_anotacao':
        try {
            $id = $_POST['id'] ?? 0;
            
            $stmt = $pdo->prepare("DELETE FROM anotacoes WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['success' => true]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;
    
    // ========== LEMBRETES ==========
    case 'listar_lembretes':
        try {
            $stmt = $pdo->query("SELECT * FROM lembretes ORDER BY data_criacao DESC");
            $lembretes = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($lembretes);
        } catch(PDOException $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;
    
    case 'adicionar_lembrete':
        try {
            $descricao = $_POST['descricao'] ?? '';
            
            $stmt = $pdo->prepare("INSERT INTO lembretes (descricao) VALUES (?)");
            $stmt->execute([$descricao]);
            
            echo json_encode(['success' => true]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;
    
    case 'toggle_lembrete':
        try {
            $id = $_POST['id'] ?? 0;
            $concluido = $_POST['concluido'] ?? 0;
            
            $stmt = $pdo->prepare("UPDATE lembretes SET concluido = ? WHERE id = ?");
            $stmt->execute([$concluido, $id]);
            
            echo json_encode(['success' => true]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;
    
    case 'deletar_lembrete':
        try {
            $id = $_POST['id'] ?? 0;
            
            $stmt = $pdo->prepare("DELETE FROM lembretes WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['success' => true]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;
    
    // ========== CONTAS ==========
    case 'listar_contas':
        try {
            $stmt = $pdo->query("SELECT * FROM contas ORDER BY instituicao ASC");
            $contas = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($contas);
        } catch(PDOException $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;
    
    case 'adicionar_conta':
        try {
            $instituicao = $_POST['instituicao'] ?? '';
            $tipo_conta = $_POST['tipo_conta'] ?? '';
            $numero_conta = $_POST['numero_conta'] ?? '';
            $saldo = $_POST['saldo'] ?? 0;
            $descricao = $_POST['descricao'] ?? '';
            
            $stmt = $pdo->prepare("INSERT INTO contas (instituicao, tipo_conta, numero_conta, saldo, descricao) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$instituicao, $tipo_conta, $numero_conta, $saldo, $descricao]);
            
            echo json_encode(['success' => true]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;
    
    case 'atualizar_conta':
        try {
            $id = $_POST['id'] ?? 0;
            $instituicao = $_POST['instituicao'] ?? '';
            $tipo_conta = $_POST['tipo_conta'] ?? '';
            $numero_conta = $_POST['numero_conta'] ?? '';
            $saldo = $_POST['saldo'] ?? 0;
            $descricao = $_POST['descricao'] ?? '';
            
            $stmt = $pdo->prepare("UPDATE contas SET instituicao = ?, tipo_conta = ?, numero_conta = ?, saldo = ?, descricao = ? WHERE id = ?");
            $stmt->execute([$instituicao, $tipo_conta, $numero_conta, $saldo, $descricao, $id]);
            
            echo json_encode(['success' => true]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;
    
    case 'deletar_conta':
        try {
            $id = $_POST['id'] ?? 0;
            
            $stmt = $pdo->prepare("DELETE FROM contas WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['success' => true]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;
    
    // ========== DESPESAS ==========
    case 'listar_despesas':
        try {
            $stmt = $pdo->query("SELECT d.*, c.instituicao FROM despesas d LEFT JOIN contas c ON d.conta_id = c.id ORDER BY d.data_vencimento ASC, d.data_criacao DESC");
            $despesas = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($despesas);
        } catch(PDOException $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;
    
    case 'adicionar_despesa':
        try {
            $descricao = $_POST['descricao'] ?? '';
            $valor = $_POST['valor'] ?? 0;
            $categoria = $_POST['categoria'] ?? '';
            $conta_id = $_POST['conta_id'] ?? null;
            $data_vencimento = $_POST['data_vencimento'] ?? null;
            $pago = $_POST['pago'] ?? 0;
            $observacoes = $_POST['observacoes'] ?? '';
            $foto = null;
            
            if (isset($_FILES['foto']) && $_FILES['foto']['error'] === UPLOAD_ERR_OK) {
                $foto = uploadFoto($_FILES['foto'], 'despesa');
            }
            
            $stmt = $pdo->prepare("INSERT INTO despesas (descricao, valor, categoria, conta_id, data_vencimento, pago, observacoes, foto) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$descricao, $valor, $categoria, $conta_id, $data_vencimento, $pago, $observacoes, $foto]);
            
            echo json_encode(['success' => true]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;
    
    case 'atualizar_despesa':
        try {
            $id = $_POST['id'] ?? 0;
            $descricao = $_POST['descricao'] ?? '';
            $valor = $_POST['valor'] ?? 0;
            $categoria = $_POST['categoria'] ?? '';
            $conta_id = $_POST['conta_id'] ?? null;
            $data_vencimento = $_POST['data_vencimento'] ?? null;
            $pago = $_POST['pago'] ?? 0;
            $observacoes = $_POST['observacoes'] ?? '';
            
            $stmt = $pdo->prepare("UPDATE despesas SET descricao = ?, valor = ?, categoria = ?, conta_id = ?, data_vencimento = ?, pago = ?, observacoes = ? WHERE id = ?");
            $stmt->execute([$descricao, $valor, $categoria, $conta_id, $data_vencimento, $pago, $observacoes, $id]);
            
            echo json_encode(['success' => true]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;
    
    case 'toggle_despesa':
        try {
            $id = $_POST['id'] ?? 0;
            $pago = $_POST['pago'] ?? 0;
            
            $stmt = $pdo->prepare("UPDATE despesas SET pago = ? WHERE id = ?");
            $stmt->execute([$pago, $id]);
            
            echo json_encode(['success' => true]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;
    
    case 'deletar_despesa':
        try {
            $id = $_POST['id'] ?? 0;
            
            $stmt = $pdo->prepare("DELETE FROM despesas WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['success' => true]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;
    
    // ========== DIÁRIO PESSOAL ==========
    case 'listar_diarios':
        try {
            $stmt = $pdo->query("SELECT * FROM diarios ORDER BY data_diario DESC, data_criacao DESC");
            $diarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($diarios);
        } catch(PDOException $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;
    
    case 'adicionar_diario':
        try {
            $titulo = $_POST['titulo'] ?? '';
            $conteudo = $_POST['conteudo'] ?? '';
            $humor = $_POST['humor'] ?? '';
            $tag = $_POST['tag'] ?? '';
            $data_diario = $_POST['data_diario'] ?? date('Y-m-d');
            $foto = null;
            
            if (isset($_FILES['foto']) && $_FILES['foto']['error'] === UPLOAD_ERR_OK) {
                $foto = uploadFoto($_FILES['foto'], 'diario');
            }
            
            $stmt = $pdo->prepare("INSERT INTO diarios (titulo, conteudo, humor, tag, data_diario, foto) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$titulo, $conteudo, $humor, $tag, $data_diario, $foto]);
            
            echo json_encode(['success' => true]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;
    
    case 'atualizar_diario':
        try {
            $id = $_POST['id'] ?? 0;
            $titulo = $_POST['titulo'] ?? '';
            $conteudo = $_POST['conteudo'] ?? '';
            $humor = $_POST['humor'] ?? '';
            $tag = $_POST['tag'] ?? '';
            $data_diario = $_POST['data_diario'] ?? date('Y-m-d');
            
            $stmt = $pdo->prepare("UPDATE diarios SET titulo = ?, conteudo = ?, humor = ?, tag = ?, data_diario = ? WHERE id = ?");
            $stmt->execute([$titulo, $conteudo, $humor, $tag, $data_diario, $id]);
            
            echo json_encode(['success' => true]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;
    
    case 'deletar_diario':
        try {
            $id = $_POST['id'] ?? 0;
            
            $stmt = $pdo->prepare("DELETE FROM diarios WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['success' => true]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;
    
    // ========== ESTATÍSTICAS ==========
    case 'estatisticas_despesas':
        try {
            $stmt = $pdo->query("
                SELECT 
                    categoria,
                    SUM(valor) as total,
                    COUNT(*) as quantidade
                FROM despesas
                GROUP BY categoria
            ");
            $estatisticas = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($estatisticas);
        } catch(PDOException $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;
    
    default:
        echo json_encode(['error' => 'Ação não reconhecida']);
        break;
}
?>

