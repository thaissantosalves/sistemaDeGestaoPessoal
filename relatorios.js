// Inicializar darkmode
document.addEventListener('DOMContentLoaded', function() {
    initDarkMode();
});

function initDarkMode() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
        updateDarkModeIcon();
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    updateDarkModeIcon();
}

function updateDarkModeIcon() {
    const icon = document.getElementById('darkmodeIcon');
    if (icon) {
        icon.className = document.body.classList.contains('dark-mode') ? 'fas fa-sun' : 'fas fa-moon';
    }
}

let dadosRelatorio = null;

async function gerarRelatorio() {
    const tipo = document.getElementById('tipoRelatorio').value;
    const container = document.getElementById('relatorioContainer');
    container.innerHTML = '<p>Carregando relatório...</p>';
    
    try {
        let dados = [];
        
        if (tipo === 'completo') {
            // Buscar todos os dados
            const [anotacoes, lembretes, contas, despesas, diarios] = await Promise.all([
                fetch('api.php?acao=listar_anotacoes').then(r => r.json()),
                fetch('api.php?acao=listar_lembretes').then(r => r.json()),
                fetch('api.php?acao=listar_contas').then(r => r.json()),
                fetch('api.php?acao=listar_despesas').then(r => r.json()),
                fetch('api.php?acao=listar_diarios').then(r => r.json())
            ]);
            
            dados = { anotacoes, lembretes, contas, despesas, diarios };
        } else {
            const response = await fetch(`api.php?acao=listar_${tipo}`);
            dados = await response.json();
        }
        
        dadosRelatorio = dados;
        container.innerHTML = formatarRelatorio(tipo, dados);
    } catch (error) {
        console.error('Erro:', error);
        container.innerHTML = '<p style="color: red;">Erro ao carregar relatório.</p>';
    }
}

function formatarRelatorio(tipo, dados) {
    let html = `<div class="relatorio-item"><h3>Relatório de ${getTipoNome(tipo)}</h3><p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p></div>`;
    
    if (tipo === 'completo') {
        html += formatarRelatorioCompleto(dados);
    } else {
        html += formatarRelatorioSimples(tipo, dados);
    }
    
    return html;
}

function formatarRelatorioCompleto(dados) {
    let html = '';
    
    // Anotações
    if (dados.anotacoes && dados.anotacoes.length > 0) {
        html += '<div class="relatorio-item"><h4><i class="fas fa-sticky-note"></i> Anotações</h4>';
        dados.anotacoes.forEach(item => {
            html += `<p><strong>${item.titulo}</strong> - ${item.conteudo.substring(0, 100)}... (${formatarData(item.data_criacao)})</p>`;
        });
        html += '</div>';
    }
    
    // Lembretes
    if (dados.lembretes && dados.lembretes.length > 0) {
        html += '<div class="relatorio-item"><h4><i class="fas fa-bell"></i> Lembretes</h4>';
        dados.lembretes.forEach(item => {
            html += `<p>${item.descricao} - ${item.concluido ? '<i class="fas fa-check"></i> Concluído' : '<i class="fas fa-clock"></i> Pendente'} (${formatarData(item.data_criacao)})</p>`;
        });
        html += '</div>';
    }
    
    // Contas
    if (dados.contas && dados.contas.length > 0) {
        html += '<div class="relatorio-item"><h4><i class="fas fa-credit-card"></i> Contas</h4>';
        let totalSaldo = 0;
        dados.contas.forEach(item => {
            totalSaldo += parseFloat(item.saldo || 0);
            html += `<p><strong>${item.instituicao}</strong> - ${item.tipo_conta}: R$ ${parseFloat(item.saldo).toFixed(2)}</p>`;
        });
        html += `<p><strong>Total: R$ ${totalSaldo.toFixed(2)}</strong></p></div>`;
    }
    
    // Despesas
    if (dados.despesas && dados.despesas.length > 0) {
        html += '<div class="relatorio-item"><h4><i class="fas fa-wallet"></i> Despesas</h4>';
        let total = 0;
        dados.despesas.forEach(item => {
            total += parseFloat(item.valor || 0);
            html += `<p><strong>${item.descricao}</strong> - ${item.categoria}: R$ ${parseFloat(item.valor).toFixed(2)} ${item.pago == 1 ? '<i class="fas fa-check"></i> Pago' : '<i class="fas fa-clock"></i> Pendente'}</p>`;
        });
        html += `<p><strong>Total: R$ ${total.toFixed(2)}</strong></p></div>`;
    }
    
    // Diários
    if (dados.diarios && dados.diarios.length > 0) {
        html += '<div class="relatorio-item"><h4><i class="fas fa-book"></i> Diário Pessoal</h4>';
        dados.diarios.forEach(item => {
            html += `<p><strong>${item.titulo}</strong> ${item.humor || ''} - ${item.conteudo.substring(0, 100)}... (${formatarDataCurta(item.data_diario)})</p>`;
        });
        html += '</div>';
    }
    
    return html;
}

function formatarRelatorioSimples(tipo, dados) {
    if (!dados || dados.length === 0) {
        return '<div class="relatorio-item"><p>Nenhum dado encontrado.</p></div>';
    }
    
    let html = '';
    
    dados.forEach(item => {
        html += '<div class="relatorio-item">';
        
        switch(tipo) {
            case 'anotacoes':
                html += `<h4>${item.titulo}</h4><p>${item.conteudo}</p><p><small>${formatarData(item.data_criacao)}</small></p>`;
                break;
            case 'lembretes':
                html += `<p>${item.descricao}</p><p>Status: ${item.concluido ? '<i class="fas fa-check"></i> Concluído' : '<i class="fas fa-clock"></i> Pendente'}</p><p><small>${formatarData(item.data_criacao)}</small></p>`;
                break;
            case 'contas':
                html += `<h4>${item.instituicao} - ${item.tipo_conta}</h4><p>Saldo: R$ ${parseFloat(item.saldo).toFixed(2)}</p><p><small>${formatarData(item.data_criacao)}</small></p>`;
                break;
            case 'despesas':
                html += `<h4>${item.descricao}</h4><p>Categoria: ${item.categoria}</p><p>Valor: R$ ${parseFloat(item.valor).toFixed(2)}</p><p>Status: ${item.pago == 1 ? '<i class="fas fa-check"></i> Pago' : '<i class="fas fa-clock"></i> Pendente'}</p><p><small>${formatarData(item.data_criacao)}</small></p>`;
                break;
            case 'diarios':
                html += `<h4>${item.titulo} ${item.humor || ''}</h4><p>${item.conteudo}</p><p><small>${formatarDataCurta(item.data_diario)}</small></p>`;
                break;
        }
        
        html += '</div>';
    });
    
    return html;
}

function getTipoNome(tipo) {
    const nomes = {
        'anotacoes': 'Anotações',
        'lembretes': 'Lembretes',
        'contas': 'Contas',
        'despesas': 'Despesas',
        'diarios': 'Diário Pessoal',
        'completo': 'Relatório Completo'
    };
    return nomes[tipo] || tipo;
}

function formatarData(dataString) {
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR');
}

function formatarDataCurta(dataString) {
    const data = new Date(dataString + 'T00:00:00');
    return data.toLocaleDateString('pt-BR');
}

async function exportarPDF() {
    if (!dadosRelatorio) {
        alert('Por favor, gere um relatório primeiro.');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const tipo = document.getElementById('tipoRelatorio').value;
    
    doc.setFontSize(18);
    doc.text(`Relatório de ${getTipoNome(tipo)}`, 14, 20);
    
    doc.setFontSize(12);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);
    
    let y = 40;
    
    if (tipo === 'completo') {
        y = adicionarSecaoPDF(doc, 'Anotações', dadosRelatorio.anotacoes, y);
        y = adicionarSecaoPDF(doc, 'Lembretes', dadosRelatorio.lembretes, y);
        y = adicionarSecaoPDF(doc, 'Contas', dadosRelatorio.contas, y);
        y = adicionarSecaoPDF(doc, 'Despesas', dadosRelatorio.despesas, y);
        y = adicionarSecaoPDF(doc, 'Diário', dadosRelatorio.diarios, y);
    } else {
        y = adicionarSecaoPDF(doc, getTipoNome(tipo), dadosRelatorio, y);
    }
    
    doc.save(`relatorio_${tipo}_${Date.now()}.pdf`);
}

function adicionarSecaoPDF(doc, titulo, dados, y) {
    if (!dados || dados.length === 0) return y;
    
    if (y > 250) {
        doc.addPage();
        y = 20;
    }
    
    doc.setFontSize(14);
    doc.text(titulo, 14, y);
    y += 10;
    
    doc.setFontSize(10);
    dados.forEach(item => {
        if (y > 280) {
            doc.addPage();
            y = 20;
        }
        
        let texto = '';
        if (titulo === 'Anotações') {
            texto = `${item.titulo}: ${item.conteudo.substring(0, 80)}...`;
        } else if (titulo === 'Lembretes') {
            texto = `${item.descricao} - ${item.concluido ? 'Concluído' : 'Pendente'}`;
        } else if (titulo === 'Contas') {
            texto = `${item.instituicao} - ${item.tipo_conta}: R$ ${parseFloat(item.saldo).toFixed(2)}`;
        } else if (titulo === 'Despesas') {
            texto = `${item.descricao} - ${item.categoria}: R$ ${parseFloat(item.valor).toFixed(2)}`;
        } else if (titulo === 'Diário') {
            texto = `${item.titulo}: ${item.conteudo.substring(0, 80)}...`;
        }
        
        doc.text(texto, 14, y);
        y += 7;
    });
    
    return y + 5;
}

