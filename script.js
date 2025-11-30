// Variável global para controlar edição
let contaEditandoId = null;

// Carregar dados ao iniciar
document.addEventListener('DOMContentLoaded', function() {
    // Verificar sessão primeiro (função em auth.js)
    if (typeof verificarSessao === 'function') {
        verificarSessao();
    }
    
    // Inicializar darkmode
    initDarkMode();
    
    // Carregar dados apenas se estiver na página principal
    if (document.getElementById('formAnotacao')) {
        carregarTodosDados();
        
        // Event listeners para formulários
        document.getElementById('formAnotacao').addEventListener('submit', adicionarAnotacao);
        document.getElementById('formLembrete').addEventListener('submit', adicionarLembrete);
        document.getElementById('formConta').addEventListener('submit', adicionarConta);
        document.getElementById('formDespesa').addEventListener('submit', adicionarDespesa);
        document.getElementById('formDiario').addEventListener('submit', adicionarDiario);
        
        // Set data padrão para diário
        document.getElementById('dataDiario').valueAsDate = new Date();
        
        // Preview de imagens
        setupImagePreview('fotoAnotacao', 'previewAnotacao');
        setupImagePreview('fotoDespesa', 'previewDespesa');
        setupImagePreview('fotoDiario', 'previewDiario');
    }
});

// ========== AUTENTICAÇÃO ==========
// Funções movidas para auth.js - mantidas aqui para compatibilidade

// ========== DARK MODE ==========

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

// ========== IMAGE PREVIEW ==========

function setupImagePreview(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    
    if (input && preview) {
        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                    preview.classList.add('active');
                };
                reader.readAsDataURL(file);
            } else {
                preview.classList.remove('active');
                preview.innerHTML = '';
            }
        });
    }
}

// ========== SISTEMA DE TABS ==========

function mostrarTab(nomeTab) {
    // Esconder todas as tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Mostrar tab selecionada
    document.getElementById(nomeTab).classList.add('active');
    
    // Atualizar botões
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Carregar dados específicos quando mudar de tab
    if (nomeTab === 'despesas') {
        carregarEstatisticas();
    }
}

// ========== CARREGAMENTO INICIAL ==========

function carregarTodosDados() {
    carregarAnotacoes();
    carregarLembretes();
    carregarContas();
    carregarDespesas();
    carregarDiarios();
}

// ========== ANOTAÇÕES ==========

function carregarAnotacoes() {
    fetch('api.php?acao=listar_anotacoes')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na resposta do servidor');
            }
            return response.json();
        })
        .then(data => {
            const lista = document.getElementById('listaAnotacoes');
            
            // Verificar se é um erro
            if (data.error) {
                lista.innerHTML = '<p class="vazio" style="color: red;">Erro: ' + data.error + '</p>';
                return;
            }
            
            if (data.length === 0) {
                lista.innerHTML = '<p class="vazio">Nenhuma anotação ainda. Adicione uma!</p>';
                return;
            }
            
            lista.innerHTML = data.map(item => `
                <div class="card anotacao-card">
                    <div class="card-header">
                        <h3>${item.titulo}</h3>
                        <span class="icon-anotacao"><i class="fas fa-sticky-note"></i></span>
                    </div>
                    <div class="card-body">
                        <p>${item.conteudo}</p>
                        ${item.foto ? `<img src="uploads/${item.foto}" alt="Foto" style="max-width: 100%; border-radius: 8px; margin-top: 15px;">` : ''}
                    </div>
                    <div class="card-footer">
                        <span class="data">${formatarData(item.data_criacao)}</span>
                        <button onclick="deletarAnotacao(${item.id})"><i class="fas fa-trash"></i> Excluir</button>
                    </div>
                </div>
            `).join('');
        })
        .catch(error => {
            console.error('Erro ao carregar anotações:', error);
            document.getElementById('listaAnotacoes').innerHTML = '<p class="vazio" style="color: red;">Erro ao carregar anotações. Verifique se o banco está configurado.</p>';
        });
}

function adicionarAnotacao(e) {
    e.preventDefault();
    
    const titulo = document.getElementById('tituloAnotacao').value;
    const conteudo = document.getElementById('conteudoAnotacao').value;
    const fotoInput = document.getElementById('fotoAnotacao');
    const foto = fotoInput.files[0];
    
    const formData = new FormData();
    formData.append('acao', 'adicionar_anotacao');
    formData.append('titulo', titulo);
    formData.append('conteudo', conteudo);
    if (foto) {
        formData.append('foto', foto);
    }
    
    fetch('api.php', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na resposta do servidor');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                document.getElementById('formAnotacao').reset();
                document.getElementById('previewAnotacao').classList.remove('active');
                document.getElementById('previewAnotacao').innerHTML = '';
                carregarAnotacoes();
            } else {
                alert('Erro ao adicionar anotação: ' + (data.error || 'Erro desconhecido'));
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao adicionar anotação. Verifique se o banco de dados está configurado.');
        });
}

function deletarAnotacao(id) {
    if (!confirm('Tem certeza que deseja excluir esta anotação?')) {
        return;
    }
    
    fetch('api.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `acao=deletar_anotacao&id=${id}`
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                carregarAnotacoes();
            } else {
                alert('Erro ao excluir anotação');
            }
        })
        .catch(error => console.error('Erro:', error));
}

// ========== LEMBRETES ==========

function carregarLembretes() {
    fetch('api.php?acao=listar_lembretes')
        .then(response => response.json())
        .then(data => {
            const lista = document.getElementById('listaLembretes');
            if (data.length === 0) {
                lista.innerHTML = '<p class="vazio">Nenhum lembrete ainda. Adicione um!</p>';
                return;
            }
            
            lista.innerHTML = data.map(item => `
                <div class="card lembrete-card ${item.concluido ? 'concluido' : ''}">
                    <div class="card-header">
                        <div class="checkbox-container">
                            <input type="checkbox" id="lembrete_${item.id}" 
                                   ${item.concluido ? 'checked' : ''} 
                                   onchange="toggleLembrete(${item.id})">
                            <label for="lembrete_${item.id}">${item.descricao}</label>
                        </div>
                        <span class="icon-lembrete"><i class="fas fa-bell"></i></span>
                    </div>
                    <div class="card-footer">
                        <span class="data">${formatarData(item.data_criacao)}</span>
                        <button onclick="deletarLembrete(${item.id})"><i class="fas fa-trash"></i> Excluir</button>
                    </div>
                </div>
            `).join('');
        })
        .catch(error => console.error('Erro ao carregar lembretes:', error));
}

function adicionarLembrete(e) {
    e.preventDefault();
    
    const descricao = document.getElementById('descricaoLembrete').value;
    
    fetch('api.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `acao=adicionar_lembrete&descricao=${encodeURIComponent(descricao)}`
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('formLembrete').reset();
                carregarLembretes();
            } else {
                alert('Erro ao adicionar lembrete');
            }
        })
        .catch(error => console.error('Erro:', error));
}

function toggleLembrete(id) {
    const checkbox = document.getElementById(`lembrete_${id}`);
    const concluido = checkbox.checked ? 1 : 0;
    
    fetch('api.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `acao=toggle_lembrete&id=${id}&concluido=${concluido}`
    })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                alert('Erro ao atualizar lembrete');
                checkbox.checked = !checkbox.checked;
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            checkbox.checked = !checkbox.checked;
        });
}

function deletarLembrete(id) {
    if (!confirm('Tem certeza que deseja excluir este lembrete?')) {
        return;
    }
    
    fetch('api.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `acao=deletar_lembrete&id=${id}`
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                carregarLembretes();
            } else {
                alert('Erro ao excluir lembrete');
            }
        })
        .catch(error => console.error('Erro:', error));
}

// ========== CONTAS ==========

function carregarContas() {
    fetch('api.php?acao=listar_contas')
        .then(response => response.json())
        .then(data => {
            const lista = document.getElementById('listaContas');
            const selectDespesa = document.getElementById('contaDespesa');
            
            if (data.length === 0) {
                lista.innerHTML = '<p class="vazio">Nenhuma conta cadastrada. Adicione uma!</p>';
                selectDespesa.innerHTML = '<option value="">Nenhuma conta cadastrada</option>';
                return;
            }
            
            // Popular lista de contas
            lista.innerHTML = data.map(item => `
                <div class="card conta-card">
                    <div class="card-header">
                        <div>
                            <h3>${item.instituicao}</h3>
                            <span class="tipo-badge">${item.tipo_conta}</span>
                        </div>
                        <span class="icon-conta"><i class="fas fa-credit-card"></i></span>
                    </div>
                    <div class="card-body">
                        ${item.numero_conta ? `<p><strong>Número:</strong> ${item.numero_conta}</p>` : ''}
                        <div class="saldo-destaque">
                            <span class="saldo-label">Saldo Atual</span>
                            <span class="saldo">R$ ${parseFloat(item.saldo).toFixed(2).replace('.', ',')}</span>
                        </div>
                        ${item.descricao ? `<p>${item.descricao}</p>` : ''}
                    </div>
                    <div class="card-footer">
                        <span class="data">${formatarData(item.data_criacao)}</span>
                        <div class="card-actions">
                            <button onclick="editarConta(${item.id})"><i class="fas fa-edit"></i> Editar</button>
                            <button onclick="deletarConta(${item.id})"><i class="fas fa-trash"></i> Excluir</button>
                        </div>
                    </div>
                </div>
            `).join('');
            
            // Popular select de despesas
            selectDespesa.innerHTML = '<option value="">Conta (opcional)</option>' + 
                data.map(item => `<option value="${item.id}">${item.instituicao} - ${item.tipo_conta}</option>`).join('');
        })
        .catch(error => console.error('Erro ao carregar contas:', error));
}

function adicionarConta(e) {
    e.preventDefault();
    
    const instituicao = document.getElementById('instituicaoConta').value;
    const tipoConta = document.getElementById('tipoConta').value;
    const numeroConta = document.getElementById('numeroConta').value;
    const saldo = document.getElementById('saldoConta').value;
    const descricao = document.getElementById('descricaoConta').value;
    
    // Verificar se está editando
    const acao = contaEditandoId ? 'atualizar_conta' : 'adicionar_conta';
    const bodyData = contaEditandoId 
        ? `acao=${acao}&id=${contaEditandoId}&instituicao=${encodeURIComponent(instituicao)}&tipo_conta=${encodeURIComponent(tipoConta)}&numero_conta=${encodeURIComponent(numeroConta)}&saldo=${saldo}&descricao=${encodeURIComponent(descricao)}`
        : `acao=${acao}&instituicao=${encodeURIComponent(instituicao)}&tipo_conta=${encodeURIComponent(tipoConta)}&numero_conta=${encodeURIComponent(numeroConta)}&saldo=${saldo}&descricao=${encodeURIComponent(descricao)}`;
    
    fetch('api.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyData
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('formConta').reset();
                
                // Resetar botão se estava editando
                if (contaEditandoId) {
                    const button = document.getElementById('formConta').querySelector('button[type="submit"]');
                    button.textContent = 'Adicionar Conta';
                    contaEditandoId = null;
                }
                
                carregarContas();
            } else {
                alert('Erro ao ' + (contaEditandoId ? 'atualizar' : 'adicionar') + ' conta');
            }
        })
        .catch(error => console.error('Erro:', error));
}

function editarConta(id) {
    // Buscar dados da conta
    fetch('api.php?acao=listar_contas')
        .then(response => response.json())
        .then(contas => {
            const conta = contas.find(c => c.id == id);
            
            if (!conta) {
                alert('Conta não encontrada!');
                return;
            }
            
            // Preencher formulário
            document.getElementById('instituicaoConta').value = conta.instituicao;
            document.getElementById('tipoConta').value = conta.tipo_conta;
            document.getElementById('numeroConta').value = conta.numero_conta || '';
            document.getElementById('saldoConta').value = parseFloat(conta.saldo).toFixed(2);
            document.getElementById('descricaoConta').value = conta.descricao || '';
            
            // Marcar que está editando
            contaEditandoId = id;
            
            // Alterar botão
            const formConta = document.getElementById('formConta');
            const button = formConta.querySelector('button[type="submit"]');
            button.textContent = 'Atualizar Conta';
            
            // Scroll até o formulário
            document.getElementById('formConta').scrollIntoView({ behavior: 'smooth', block: 'start' });
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao carregar dados da conta');
        });
}

function deletarConta(id) {
    if (!confirm('Tem certeza que deseja excluir esta conta? Despesas associadas terão o vínculo removido.')) {
        return;
    }
    
    fetch('api.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `acao=deletar_conta&id=${id}`
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                carregarContas();
                carregarDespesas();
            } else {
                alert('Erro ao excluir conta');
            }
        })
        .catch(error => console.error('Erro:', error));
}

// ========== DESPESAS ==========

function carregarDespesas() {
    fetch('api.php?acao=listar_despesas')
        .then(response => response.json())
        .then(data => {
            const lista = document.getElementById('listaDespesas');
            if (data.length === 0) {
                lista.innerHTML = '<p class="vazio">Nenhuma despesa registrada. Adicione uma!</p>';
                return;
            }
            
            const totalGeral = data.reduce((sum, item) => sum + parseFloat(item.valor), 0);
            const totalPago = data.filter(item => item.pago == 1).reduce((sum, item) => sum + parseFloat(item.valor), 0);
            const totalPendente = totalGeral - totalPago;
            
            lista.innerHTML = `
                <div class="resumo-financeiro-wrapper">
                    <div class="resumo-financeiro">
                        <div class="resumo-item">
                            <span class="resumo-label">Total Geral:</span>
                            <span class="resumo-valor">R$ ${totalGeral.toFixed(2).replace('.', ',')}</span>
                        </div>
                        <div class="resumo-item">
                            <span class="resumo-label">Pago:</span>
                            <span class="resumo-valor verde">R$ ${totalPago.toFixed(2).replace('.', ',')}</span>
                        </div>
                        <div class="resumo-item">
                            <span class="resumo-label">Pendente:</span>
                            <span class="resumo-valor vermelho">R$ ${totalPendente.toFixed(2).replace('.', ',')}</span>
                        </div>
                    </div>
                </div>
            ` + data.map(item => `
                <div class="card despesa-card ${item.pago == 1 ? 'pago' : ''}">
                    <div class="card-header">
                        <h3>${item.descricao}</h3>
                        <div>
                            <span class="valor-item">R$ ${parseFloat(item.valor).toFixed(2).replace('.', ',')}</span>
                            <span class="icon-despesa"><i class="fas fa-wallet"></i></span>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="despesa-info-row">
                            <span class="categoria-badge">${item.categoria}</span>
                            ${item.instituicao ? `<span class="conta-info"><i class="fas fa-folder"></i> ${item.instituicao}</span>` : ''}
                            ${item.data_vencimento ? `<span class="data-info"><i class="fas fa-calendar-alt"></i> ${formatarDataCurta(item.data_vencimento)}</span>` : ''}
                        </div>
                        ${item.observacoes ? `<p class="observacoes"><i class="fas fa-comment"></i> ${item.observacoes}</p>` : ''}
                        ${item.foto ? `<img src="uploads/${item.foto}" alt="Foto" style="max-width: 100%; border-radius: 8px; margin-top: 15px;">` : ''}
                    </div>
                    <div class="card-footer">
                        <span class="data">${formatarData(item.data_criacao)}</span>
                        <div class="card-actions">
                            <label class="checkbox-label">
                                <input type="checkbox" ${item.pago == 1 ? 'checked' : ''} 
                                       onchange="toggleDespesa(${item.id}, this.checked)">
                                <span>${item.pago == 1 ? '<i class="fas fa-check"></i> Pago' : 'Marcar'}</span>
                            </label>
                            <button onclick="deletarDespesa(${item.id})"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                </div>
            `).join('');
        })
        .catch(error => console.error('Erro ao carregar despesas:', error));
}

function carregarEstatisticas() {
    fetch('api.php?acao=estatisticas_despesas')
        .then(response => response.json())
        .then(data => {
            const stats = document.getElementById('estatisticasDespesas');
            if (data.length === 0) {
                stats.innerHTML = '<p class="vazio">Nenhuma estatística disponível</p>';
                return;
            }
            
            stats.innerHTML = data.map(item => `
                <div class="stat-card">
                    <div class="stat-label">${item.categoria}</div>
                    <div class="stat-valor">R$ ${parseFloat(item.total).toFixed(2).replace('.', ',')}</div>
                    <div class="stat-count">${item.quantidade} despesa(s)</div>
                </div>
            `).join('');
        })
        .catch(error => console.error('Erro ao carregar estatísticas:', error));
}

function adicionarDespesa(e) {
    e.preventDefault();
    
    const descricao = document.getElementById('descricaoDespesa').value;
    const valor = document.getElementById('valorDespesa').value;
    const categoria = document.getElementById('categoriaDespesa').value;
    const contaId = document.getElementById('contaDespesa').value;
    const dataVencimento = document.getElementById('dataVencimento').value;
    const pago = document.getElementById('pagoDespesa').checked ? 1 : 0;
    const observacoes = document.getElementById('observacoesDespesa').value;
    const fotoInput = document.getElementById('fotoDespesa');
    const foto = fotoInput.files[0];
    
    const formData = new FormData();
    formData.append('acao', 'adicionar_despesa');
    formData.append('descricao', descricao);
    formData.append('valor', valor);
    formData.append('categoria', categoria);
    formData.append('conta_id', contaId);
    formData.append('data_vencimento', dataVencimento);
    formData.append('pago', pago);
    formData.append('observacoes', observacoes);
    if (foto) {
        formData.append('foto', foto);
    }
    
    fetch('api.php', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('formDespesa').reset();
                document.getElementById('previewDespesa').classList.remove('active');
                document.getElementById('previewDespesa').innerHTML = '';
                carregarDespesas();
                carregarEstatisticas();
            } else {
                alert('Erro ao adicionar despesa');
            }
        })
        .catch(error => console.error('Erro:', error));
}

function toggleDespesa(id, checked) {
    const pago = checked ? 1 : 0;
    
    fetch('api.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `acao=toggle_despesa&id=${id}&pago=${pago}`
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                carregarDespesas();
                carregarEstatisticas();
            } else {
                alert('Erro ao atualizar despesa');
            }
        })
        .catch(error => console.error('Erro:', error));
}

function deletarDespesa(id) {
    if (!confirm('Tem certeza que deseja excluir esta despesa?')) {
        return;
    }
    
    fetch('api.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `acao=deletar_despesa&id=${id}`
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                carregarDespesas();
                carregarEstatisticas();
            } else {
                alert('Erro ao excluir despesa');
            }
        })
        .catch(error => console.error('Erro:', error));
}

// ========== DIÁRIO PESSOAL ==========

function carregarDiarios() {
    fetch('api.php?acao=listar_diarios')
        .then(response => response.json())
        .then(data => {
            const lista = document.getElementById('listaDiarios');
            if (data.length === 0) {
                lista.innerHTML = '<p class="vazio">Nenhuma entrada no diário. Comece a registrar seus dias!</p>';
                return;
            }
            
            lista.innerHTML = data.map(item => {
                let humorIcon = '';
                if (item.humor) {
                    const humorMap = {
                        'happy': '<i class="fas fa-smile"></i>',
                        'sad': '<i class="fas fa-frown"></i>',
                        'sleepy': '<i class="fas fa-bed"></i>',
                        'angry': '<i class="fas fa-angry"></i>',
                        'confident': '<i class="fas fa-smile-beam"></i>',
                        'thinking': '<i class="fas fa-meh"></i>',
                        'love': '<i class="fas fa-heart"></i>',
                        'celebrate': '<i class="fas fa-party-horn"></i>'
                    };
                    humorIcon = humorMap[item.humor] || '';
                }
                return `
                <div class="card diario-card">
                    <div class="card-header">
                        <h3>${item.titulo}</h3>
                        ${humorIcon ? `<span class="humor-emoji">${humorIcon}</span>` : '<span class="icon-diario"><i class="fas fa-book"></i></span>'}
                    </div>
                    <div class="card-body">
                        <div class="diario-meta">
                            ${item.tag ? `<span class="tag">${item.tag}</span>` : ''}
                            <span class="data"><i class="fas fa-calendar-alt"></i> ${formatarDataCurta(item.data_diario)}</span>
                        </div>
                        <p>${item.conteudo}</p>
                        ${item.foto ? `<img src="uploads/${item.foto}" alt="Foto" style="max-width: 100%; border-radius: 8px; margin-top: 15px;">` : ''}
                    </div>
                    <div class="card-footer">
                        <span class="data">${formatarData(item.data_criacao)}</span>
                        <button onclick="deletarDiario(${item.id})"><i class="fas fa-trash"></i> Excluir</button>
                    </div>
                </div>
            `;
            }).join('');
        })
        .catch(error => console.error('Erro ao carregar diários:', error));
}

function adicionarDiario(e) {
    e.preventDefault();
    
    const titulo = document.getElementById('tituloDiario').value;
    const conteudo = document.getElementById('conteudoDiario').value;
    const humor = document.getElementById('humorDiario').value;
    const tag = document.getElementById('tagDiario').value;
    const dataDiario = document.getElementById('dataDiario').value;
    const fotoInput = document.getElementById('fotoDiario');
    const foto = fotoInput.files[0];
    
    const formData = new FormData();
    formData.append('acao', 'adicionar_diario');
    formData.append('titulo', titulo);
    formData.append('conteudo', conteudo);
    formData.append('humor', humor);
    formData.append('tag', tag);
    formData.append('data_diario', dataDiario);
    if (foto) {
        formData.append('foto', foto);
    }
    
    fetch('api.php', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('formDiario').reset();
                document.getElementById('dataDiario').valueAsDate = new Date();
                document.getElementById('previewDiario').classList.remove('active');
                document.getElementById('previewDiario').innerHTML = '';
                carregarDiarios();
            } else {
                alert('Erro ao adicionar entrada no diário');
            }
        })
        .catch(error => console.error('Erro:', error));
}

function deletarDiario(id) {
    if (!confirm('Tem certeza que deseja excluir esta entrada do diário?')) {
        return;
    }
    
    fetch('api.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `acao=deletar_diario&id=${id}`
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                carregarDiarios();
            } else {
                alert('Erro ao excluir entrada do diário');
            }
        })
        .catch(error => console.error('Erro:', error));
}

// ========== UTILITÁRIOS ==========

function formatarData(dataString) {
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR');
}

function formatarDataCurta(dataString) {
    const data = new Date(dataString + 'T00:00:00');
    return data.toLocaleDateString('pt-BR');
}
