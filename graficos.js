// Inicializar darkmode
document.addEventListener('DOMContentLoaded', function() {
    initDarkMode();
    carregarGraficos();
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
    // Recarregar gráficos para aplicar tema
    carregarGraficos();
}

function updateDarkModeIcon() {
    const icon = document.getElementById('darkmodeIcon');
    if (icon) {
        icon.className = document.body.classList.contains('dark-mode') ? 'fas fa-sun' : 'fas fa-moon';
    }
}

let charts = {};

async function carregarGraficos() {
    try {
        const [despesas, contas] = await Promise.all([
            fetch('api.php?acao=listar_despesas').then(r => r.json()),
            fetch('api.php?acao=listar_contas').then(r => r.json())
        ]);
        
        criarGraficoDespesas(despesas);
        criarGraficoStatusPagamento(despesas);
        criarGraficoContas(contas);
        criarGraficoTemporal(despesas);
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

function criarGraficoDespesas(despesas) {
    const ctx = document.getElementById('chartDespesas');
    if (!ctx) return;
    
    // Destruir gráfico anterior se existir
    if (charts.despesas) {
        charts.despesas.destroy();
    }
    
    // Agrupar por categoria
    const categorias = {};
    despesas.forEach(d => {
        if (!categorias[d.categoria]) {
            categorias[d.categoria] = 0;
        }
        categorias[d.categoria] += parseFloat(d.valor);
    });
    
    const isDark = document.body.classList.contains('dark-mode');
    const textColor = isDark ? '#e5e7eb' : '#1a1a2e';
    
    charts.despesas = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categorias),
            datasets: [{
                data: Object.values(categorias),
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#f59e0b',
                    '#10b981',
                    '#ef4444',
                    '#8b5cf6',
                    '#ec4899',
                    '#06b6d4'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: textColor
                    }
                }
            }
        }
    });
}

function criarGraficoStatusPagamento(despesas) {
    const ctx = document.getElementById('chartStatusPagamento');
    if (!ctx) return;
    
    if (charts.statusPagamento) {
        charts.statusPagamento.destroy();
    }
    
    const pago = despesas.filter(d => d.pago == 1).reduce((sum, d) => sum + parseFloat(d.valor), 0);
    const pendente = despesas.filter(d => d.pago == 0).reduce((sum, d) => sum + parseFloat(d.valor), 0);
    
    const isDark = document.body.classList.contains('dark-mode');
    const textColor = isDark ? '#e5e7eb' : '#1a1a2e';
    
    charts.statusPagamento = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Pago', 'Pendente'],
            datasets: [{
                data: [pago, pendente],
                backgroundColor: ['#10b981', '#f59e0b']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: textColor
                    }
                }
            }
        }
    });
}

function criarGraficoContas(contas) {
    const ctx = document.getElementById('chartContas');
    if (!ctx) return;
    
    if (charts.contas) {
        charts.contas.destroy();
    }
    
    const tipos = {};
    contas.forEach(c => {
        if (!tipos[c.tipo_conta]) {
            tipos[c.tipo_conta] = 0;
        }
        tipos[c.tipo_conta] += parseFloat(c.saldo);
    });
    
    const isDark = document.body.classList.contains('dark-mode');
    const textColor = isDark ? '#e5e7eb' : '#1a1a2e';
    const gridColor = isDark ? '#374151' : '#e5e7eb';
    
    charts.contas = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(tipos),
            datasets: [{
                label: 'Saldo Total (R$)',
                data: Object.values(tipos),
                backgroundColor: '#667eea'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        color: gridColor
                    }
                },
                x: {
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        color: gridColor
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            }
        }
    });
}

function criarGraficoTemporal(despesas) {
    const ctx = document.getElementById('chartTemporal');
    if (!ctx) return;
    
    if (charts.temporal) {
        charts.temporal.destroy();
    }
    
    // Agrupar por mês
    const meses = {};
    despesas.forEach(d => {
        if (d.data_vencimento) {
            const data = new Date(d.data_vencimento);
            const mesAno = `${data.getMonth() + 1}/${data.getFullYear()}`;
            if (!meses[mesAno]) {
                meses[mesAno] = 0;
            }
            meses[mesAno] += parseFloat(d.valor);
        }
    });
    
    const labels = Object.keys(meses).sort();
    const valores = labels.map(l => meses[l]);
    
    const isDark = document.body.classList.contains('dark-mode');
    const textColor = isDark ? '#e5e7eb' : '#1a1a2e';
    const gridColor = isDark ? '#374151' : '#e5e7eb';
    
    charts.temporal = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Despesas (R$)',
                data: valores,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        color: gridColor
                    }
                },
                x: {
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        color: gridColor
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            }
        }
    });
}

