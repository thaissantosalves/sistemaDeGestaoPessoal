// Script compartilhado para autenticação

function verificarSessao() {
    fetch('auth.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'acao=verificar_sessao'
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            window.location.href = 'login.html';
        } else {
            // Mostrar nome do usuário
            const userNome = document.getElementById('userNome');
            if (userNome) {
                userNome.textContent = 'Olá, ' + data.user_nome;
            }
        }
    })
    .catch(error => {
        console.error('Erro ao verificar sessão:', error);
        window.location.href = 'login.html';
    });
}

function fazerLogout() {
    if (!confirm('Tem certeza que deseja sair?')) {
        return;
    }
    
    fetch('auth.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'acao=logout'
    })
    .then(response => response.json())
    .then(data => {
        window.location.href = 'login.html';
    })
    .catch(error => {
        console.error('Erro ao fazer logout:', error);
        window.location.href = 'login.html';
    });
}

