# Sistema de Gestão Pessoal

Sistema completo de gestão pessoal com anotações, lembretes, contas, despesas e diário pessoal.

## Funcionalidades

- ✅ CSS aplicado em todas as páginas
- ✅ Suporte para upload de fotos (anotações, despesas e diário)
- ✅ Navegação entre páginas (Início, Relatórios, Gráficos)
- ✅ Cabeçalho com título da página e darkmode obrigatório
- ✅ Rodapé com links para redes sociais
- ✅ Geração de relatórios na tela e exportação em PDF
- ✅ Gráficos estatísticos baseados em dados do banco

## Instalação

1. Importe o arquivo `database.sql` no seu MySQL/MariaDB
2. Se você já tem um banco de dados, execute `update_database.sql` para adicionar os campos de foto
3. Configure o arquivo `config.php` com suas credenciais do banco de dados
4. Certifique-se de que a pasta `uploads` existe e tem permissões de escrita (chmod 777)

## Estrutura de Arquivos

- `index.html` - Página principal com todas as funcionalidades
- `relatorios.html` - Página de relatórios
- `graficos.html` - Página de gráficos estatísticos
- `style.css` - Estilos CSS completos com darkmode
- `script.js` - JavaScript principal
- `relatorios.js` - JavaScript para relatórios
- `graficos.js` - JavaScript para gráficos
- `api.php` - API backend
- `config.php` - Configuração do banco de dados
- `database.sql` - Script de criação do banco
- `update_database.sql` - Script para atualizar banco existente

## Uso

1. Acesse `index.html` no seu navegador
2. Use o botão de darkmode no cabeçalho para alternar entre tema claro e escuro
3. Navegue entre as páginas usando o menu superior
4. Adicione fotos aos seus registros usando o campo de upload
5. Gere relatórios na página de Relatórios
6. Visualize gráficos estatísticos na página de Gráficos

## Personalização

### Redes Sociais

Edite os links no rodapé de cada página HTML:
- GitHub
- LinkedIn
- Instagram
- Twitter

### Nome do Criador

Edite o texto "Seu Nome" no rodapé de cada página HTML.

## Requisitos

- PHP 7.4 ou superior
- MySQL/MariaDB
- Servidor web (Apache/Nginx) ou XAMPP/WAMP

## Bibliotecas Utilizadas

- Chart.js - Para gráficos
- jsPDF - Para geração de PDFs

## Notas

- As fotos são salvas na pasta `uploads/`
- O darkmode é salvo no localStorage do navegador
- Os relatórios podem ser exportados em PDF

