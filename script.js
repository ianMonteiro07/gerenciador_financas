const USERS = [
    { login: 'admin', password: '123', role: 'admin' },
    { login: 'user', password: '123', role: 'user' }
];

let currentUser = null;
let categories = [];
let transactions = [];

function initApp() {
    const storedUser = localStorage.getItem('finance_user');
    const storedCategories = localStorage.getItem('finance_categories');
    const storedTransactions = localStorage.getItem('finance_transactions');

    if (storedCategories) {
        categories = JSON.parse(storedCategories);
    } else {
        categories = [
            { id: 1, name: 'Alimentação', limit: 1000 },
            { id: 2, name: 'Transporte', limit: 500 },
            { id: 3, name: 'Lazer', limit: 300 }
        ];
        saveData();
    }

    if (storedTransactions) transactions = JSON.parse(storedTransactions);

    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        showDashboard();
    }
}

function saveData() {
    localStorage.setItem('finance_categories', JSON.stringify(categories));
    localStorage.setItem('finance_transactions', JSON.stringify(transactions));
}

document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const userIp = document.getElementById('username').value.trim();
    const passIp = document.getElementById('password').value.trim();

    const user = USERS.find(u => u.login === userIp && u.password === passIp);

    if (user) {
        currentUser = user;
        localStorage.setItem('finance_user', JSON.stringify(user));
        document.getElementById('login-error').classList.add('hidden');
        showDashboard();
    } else {
        document.getElementById('login-error').classList.remove('hidden');
    }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem('finance_user');
    document.getElementById('dashboard-container').classList.add('hidden');
    document.getElementById('login-container').classList.remove('hidden');
    document.getElementById('login-form').reset();
});

function showDashboard() {
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('dashboard-container').classList.remove('hidden');
    
    document.getElementById('logged-user-name').textContent = currentUser.login;
    document.getElementById('logged-user-role').textContent = currentUser.role === 'admin' ? 'Administrador' : 'Usuário Padrão';

    const addCatBtn = document.getElementById('add-category-btn');
    addCatBtn.classList.remove('hidden'); 
    
    if (currentUser.role === 'admin') {
        addCatBtn.disabled = false;
        addCatBtn.innerHTML = 'Nova Categoria';
        addCatBtn.title = '';
    } else {
        addCatBtn.disabled = true;
        addCatBtn.innerHTML = '🔒 Nova Categoria';
        addCatBtn.title = 'Apenas Administradores podem criar categorias';
    }

    renderCategoriesSelect();
    renderDashboard();
    renderTransactions();
}

function renderDashboard() {
    const grid = document.getElementById('categories-grid');
    grid.innerHTML = '';

    categories.forEach(cat => {
        const totalSpent = transactions
            .filter(t => parseInt(t.categoryId) === cat.id)
            .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

        const percentage = cat.limit > 0 ? (totalSpent / cat.limit) * 100 : 0;
        let progressClass = 'progress-ok';
        
        if (percentage > 100) progressClass = 'progress-danger';
        else if (percentage > 80) progressClass = 'progress-warning';

        const configBtnHtml = currentUser.role === 'admin' 
            ? `<button class="btn outline-btn config-limit-btn" onclick="editCategoryName(${cat.id})" style="margin-right: 0.5rem;">Editar Nome</button>
               <button class="btn outline-btn config-limit-btn" onclick="setLimit(${cat.id})">Configurar Limite</button>` 
            : `<span style="font-size: 0.85rem; color: var(--text-muted);" title="Acesso restrito">🔒 Edição restrita ao Admin</span>`;

        grid.innerHTML += `
            <div class="card">
                <div class="card-header">
                    <h3>${cat.name}</h3>
                </div>
                <div class="card-stats">
                    <span>Gasto: R$ ${totalSpent.toFixed(2)}</span>
                    <span>Limite: R$ ${cat.limit.toFixed(2)}</span>
                </div>
                <div class="progress-container">
                    <div class="progress-bar ${progressClass}" style="width: ${Math.min(percentage, 100)}%"></div>
                </div>
                <div class="card-actions">
                    ${configBtnHtml}
                </div>
            </div>
        `;
    });
}

function renderCategoriesSelect() {
    const select = document.getElementById('trans-category');
    select.innerHTML = '<option value="">Selecione uma categoria...</option>';
    categories.forEach(cat => {
        select.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
    });
}

document.getElementById('transaction-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('trans-id').value;
    const desc = document.getElementById('trans-desc').value;
    const amount = parseFloat(document.getElementById('trans-amount').value);
    const categoryId = document.getElementById('trans-category').value;
    const date = new Date().toLocaleDateString('pt-BR');

    if (id) {
        const index = transactions.findIndex(t => t.id == id);
        if(index !== -1) {
            transactions[index].desc = desc;
            transactions[index].amount = amount;
            transactions[index].categoryId = categoryId;
            alert('Transação atualizada com sucesso!');
        }
        document.getElementById('trans-id').value = '';
        document.getElementById('cancel-edit-btn').classList.add('hidden');
        document.getElementById('form-title').textContent = 'Adicionar Nova Transação';
    } else {
        const novaTransacao = {
            id: Date.now(),
            desc,
            amount,
            categoryId,
            user: currentUser.login,
            date
        };
        transactions.push(novaTransacao);
        alert('Transação adicionada com sucesso!');
    }

    saveData();
    renderDashboard();
    renderTransactions();
    this.reset();
});

function renderTransactions() {
    const tbody = document.getElementById('transactions-body');
    tbody.innerHTML = '';

    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    const filteredTransactions = transactions.filter(t => 
        t.desc.toLowerCase().includes(searchTerm)
    );

    filteredTransactions.forEach(t => {
        const cat = categories.find(c => c.id == t.categoryId);
        const catName = cat ? cat.name : 'Desconhecida';
        
        const canEdit = currentUser.role === 'admin' || t.user === currentUser.login;
        const canDelete = currentUser.role === 'admin'; 

        let actionsHtml = '';
        
        if (canEdit) {
            actionsHtml += `<button class="btn edit-btn" onclick="editTransaction(${t.id})">Editar</button>`;
        }
        
        if (canDelete) {
            actionsHtml += `<button class="btn danger-btn" onclick="deleteTransaction(${t.id})">Deletar</button>`;
        } else {
            actionsHtml += `<button class="btn danger-btn" disabled title="Apenas Administradores podem deletar registros">🔒 Deletar</button>`;
        }

        tbody.innerHTML += `
            <tr>
                <td>${t.date}</td>
                <td>${t.desc}</td>
                <td>${catName}</td>
                <td>R$ ${parseFloat(t.amount).toFixed(2)}</td>
                <td>${t.user}</td>
                <td>${actionsHtml}</td>
            </tr>
        `;
    });
}

window.editTransaction = function(id) {
    const t = transactions.find(t => t.id == id);
    if (!t) return;

    document.getElementById('trans-id').value = t.id;
    document.getElementById('trans-desc').value = t.desc;
    document.getElementById('trans-amount').value = t.amount;
    document.getElementById('trans-category').value = t.categoryId;
    
    document.getElementById('form-title').textContent = 'Editar Transação';
    document.getElementById('cancel-edit-btn').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.getElementById('cancel-edit-btn').addEventListener('click', () => {
    document.getElementById('transaction-form').reset();
    document.getElementById('trans-id').value = '';
    document.getElementById('form-title').textContent = 'Adicionar Nova Transação';
    document.getElementById('cancel-edit-btn').classList.add('hidden');
});

window.deleteTransaction = function(id) {
    if (confirm('Tem certeza que deseja deletar este registro?')) {
        transactions = transactions.filter(t => t.id != id);
        saveData();
        renderDashboard();
        renderTransactions();
        alert('Registro deletado.');
    }
}

window.setLimit = function(id) {
    const cat = categories.find(c => c.id == id);
    const novoLimite = prompt(`Digite o novo limite para a categoria ${cat.name}:`, cat.limit);
    
    if (novoLimite !== null && !isNaN(novoLimite) && novoLimite > 0) {
        cat.limit = parseFloat(novoLimite);
        saveData();
        renderDashboard();
        alert('Limite atualizado com sucesso!');
    }
}

window.editCategoryName = function(id) {
    const cat = categories.find(c => c.id == id);
    const novoNome = prompt(`Digite o novo nome para a categoria "${cat.name}":`, cat.name);
    
    if (novoNome !== null && novoNome.trim() !== '') {
        cat.name = novoNome.trim();
        saveData(); 
        renderCategoriesSelect(); 
        renderDashboard(); 
        renderTransactions(); 
        alert('Nome da categoria atualizado com sucesso!');
    }
}

document.getElementById('add-category-btn').addEventListener('click', () => {
    const nome = prompt('Nome da nova categoria:');
    if (!nome) return;
    const limite = prompt('Limite para esta categoria:');
    if (!limite || isNaN(limite)) return;

    categories.push({
        id: Date.now(),
        name: nome,
        limit: parseFloat(limite)
    });
    
    saveData();
    renderCategoriesSelect();
    renderDashboard();
    alert('Categoria criada!');
});

// --- LÓGICA DE EXPORTAR PLANILHA ---
const exportBtn = document.getElementById('export-btn');

if (exportBtn) {
    exportBtn.addEventListener('click', () => {
        if (transactions.length === 0) {
            alert('Não tem nenhuma transação para baixar!');
            return;
        }

        let csvContent = "Data,Descricao,Categoria,Valor,Usuario\n";

        transactions.forEach(t => {
            const cat = categories.find(c => c.id == t.categoryId);
            const catName = cat ? cat.name : 'Desconhecida';
            
            csvContent += `${t.date},${t.desc},${catName},${t.amount},${t.user}\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        
        link.setAttribute("href", url);
        link.setAttribute("download", "meus_gastos.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click(); 
        document.body.removeChild(link);
    });
}

initApp();