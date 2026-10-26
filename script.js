
const CHAVE = "solicitacoesPortalComunitario";

let solicitacoes = carregarSolicitacoes();

function carregarSolicitacoes() {
    try {
        const dados = JSON.parse(localStorage.getItem(CHAVE) || "[]");
        return Array.isArray(dados) ? dados : [];
    } catch {
        return [];
    }
}

function salvarSolicitacoes() {
    try {
        localStorage.setItem(CHAVE, JSON.stringify(solicitacoes));
        return true;
    } catch {
        alert("Não foi possível salvar os dados neste navegador.");
        return false;
    }
}

function escapar(texto) {
    return String(texto).replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caractere]);
}

// Filtro do catálogo de serviços
document.getElementById("filtro").addEventListener("change", function () {
    const filtro = this.value;

    document.querySelectorAll("#listaServicos .card").forEach(card => {
        card.style.display =
            filtro === "todos" || card.dataset.categoria === filtro
                ? "block"
                : "none";
    });
});

// Cadastro de solicitações
document.getElementById("formSolicitacao").addEventListener("submit", function (event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const categoria = document.getElementById("categoria").value;
    const descricao = document.getElementById("descricao").value.trim();

    if (!nome || !categoria || !descricao) {
        alert("Preencha todos os campos.");
        return;
    }

    const solicitacao = {
        protocolo: "SOL-" + Date.now().toString().slice(-8),
        nome,
        categoria,
        descricao,
        status: "Pendente",
        data: new Date().toLocaleDateString("pt-BR")
    };

    solicitacoes.push(solicitacao);

    if (!salvarSolicitacoes()) {
        solicitacoes.pop();
        return;
    }

    const mensagem = document.getElementById("mensagem");

    mensagem.innerHTML =
        "<strong>Solicitação enviada!</strong><br>" +
        "Seu protocolo é: <strong>" +
        escapar(solicitacao.protocolo) +
        "</strong>";

    mensagem.classList.remove("oculto");

    this.reset();
    renderizarSolicitacoes();
});

// Exibe as solicitações no painel administrativo
function renderizarSolicitacoes() {
    const lista = document.getElementById("listaSolicitacoes");

    if (solicitacoes.length === 0) {
        lista.innerHTML = "<p>Nenhuma solicitação cadastrada.</p>";
        return;
    }

    lista.innerHTML = solicitacoes.map((item, indice) => `
        <article class="solicitacao">
            <h3>${escapar(item.categoria)}</h3>

            <p><strong>Protocolo:</strong> ${escapar(item.protocolo)}</p>
            <p><strong>Morador:</strong> ${escapar(item.nome)}</p>
            <p><strong>Descrição:</strong> ${escapar(item.descricao)}</p>
            <p><strong>Data:</strong> ${escapar(item.data)}</p>

            <p>
                <strong>Status:</strong>
                <span class="status ${item.status === "Concluída" ? "concluida" : ""}">
                    ${escapar(item.status)}
                </span>
            </p>

            <label for="status-${indice}">Atualizar status</label>

            <select id="status-${indice}">
                <option ${item.status === "Pendente" ? "selected" : ""}>Pendente</option>
                <option ${item.status === "Em andamento" ? "selected" : ""}>Em andamento</option>
                <option ${item.status === "Concluída" ? "selected" : ""}>Concluída</option>
            </select>

            <button data-indice="${indice}" class="btn-status">
                Salvar status
            </button>
        </article>
    `).join("");
}

// Atualiza o status selecionado
document.getElementById("listaSolicitacoes").addEventListener("click", function (event) {
    const botao = event.target.closest(".btn-status");

    if (!botao) return;

    const indice = Number(botao.dataset.indice);
    const select = document.getElementById("status-" + indice);

    if (!solicitacoes[indice] || !select) return;

    const statusAnterior = solicitacoes[indice].status;
    solicitacoes[indice].status = select.value;

    if (!salvarSolicitacoes()) {
        solicitacoes[indice].status = statusAnterior;
    }

    renderizarSolicitacoes();
});

// Inicialização
renderizarSolicitacoes();
