
const CHAVE_DESPESAS = "garagem_despesas";

const formDespesa = document.getElementById("form-despesa");
const containerDespesa = document.getElementById("formulario-despesa");

const corpoTabelaDespesas =
    document.getElementById("corpo-tabela-despesas");

const obterDespesas = () => {
    try {
        const dados = JSON.parse(
            localStorage.getItem(CHAVE_DESPESAS) || "[]"
        );

        return Array.isArray(dados) ? dados : [];
    } catch {
        return [];
    }
};

function salvarDespesas(despesas) {
    try {
        localStorage.setItem(
            CHAVE_DESPESAS,
            JSON.stringify(despesas)
        );

        return true;
    } catch {
        alert("Não foi possível salvar a despesa.");
        return false;
    }
}

function veiculosDespesa() {
    return typeof obterVeiculos === "function"
        ? obterVeiculos()
        : [];
}

function nomeVeiculoDespesa(id) {
    const veiculo = veiculosDespesa()
        .find(item => item.id === id);

    return veiculo
        ? `${veiculo.marca} ${veiculo.modelo}`
        : "Veículo não encontrado";
}

function dataHojeDespesa() {
    const hoje = new Date();

    return [
        hoje.getFullYear(),
        String(hoje.getMonth() + 1).padStart(2, "0"),
        String(hoje.getDate()).padStart(2, "0")
    ].join("-");
}

function formatarDataDespesa(data) {
    if (!data) return "Não informada";

    const partes = data.split("-");

    if (partes.length !== 3) return "Data inválida";

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatarMoedaDespesa(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// ========================================
// CARREGAR VEÍCULOS
// ========================================

function carregarSelectDespesas() {
    const select = document.getElementById("despesa-veiculo");

    select.innerHTML = "";

    const inicial = document.createElement("option");
    inicial.value = "";
    inicial.textContent = "Selecione um veículo";

    select.appendChild(inicial);

    veiculosDespesa().forEach(veiculo => {
        const opcao = document.createElement("option");

        opcao.value = veiculo.id;
        opcao.textContent =
            `${veiculo.marca} ${veiculo.modelo}`;

        select.appendChild(opcao);
    });
}

// ========================================
// FORMULÁRIO
// ========================================

function abrirFormularioDespesa() {
    formDespesa.reset();

    document.getElementById("despesa-id").value = "";

    document.getElementById("titulo-form-despesa").textContent =
        "Registrar despesa";

    containerDespesa.classList.remove("hidden");
}

function fecharFormularioDespesa() {
    containerDespesa.classList.add("hidden");
    formDespesa.reset();
    document.getElementById("despesa-id").value = "";
}

document.getElementById("abrir-form-despesa")
    .addEventListener("click", () => {

        if (veiculosDespesa().length === 0) {
            alert("Cadastre um veículo antes de registrar despesas.");
            return;
        }

        carregarSelectDespesas();
        abrirFormularioDespesa();
    });

document.getElementById("cancelar-despesa")
    .addEventListener("click", fecharFormularioDespesa);

// ========================================
// CADASTRAR / EDITAR
// ========================================

formDespesa.addEventListener("submit", event => {
    event.preventDefault();

    const id = document.getElementById("despesa-id").value;

    const veiculoId =
        document.getElementById("despesa-veiculo").value;

    const veiculo = veiculosDespesa()
        .find(item => item.id === veiculoId);

    if (!veiculo) {
        alert("Selecione um veículo válido.");
        return;
    }

    const data = document.getElementById("data-despesa").value;
    const valor = Number(
        document.getElementById("valor-despesa").value
    );

    if (!data || data > dataHojeDespesa()) {
        alert("Informe uma data válida para a despesa.");
        return;
    }

    if (!Number.isFinite(valor) || valor <= 0) {
        alert("Informe um valor maior que zero.");
        return;
    }

    const despesa = {
        id: id || crypto.randomUUID(),
        veiculoId,
        categoria: document.getElementById("categoria-despesa").value,
        data,
        valor,
        pagamento: document.getElementById("pagamento-despesa").value,
        descricao: document.getElementById("descricao-despesa").value.trim()
    };

    if (!despesa.categoria) {
        alert("Selecione uma categoria.");
        return;
    }

    const despesas = obterDespesas();

    if (id) {
        const indice = despesas.findIndex(item => item.id === id);

        if (indice === -1) {
            alert("Despesa não encontrada.");
            return;
        }

        despesas[indice] = despesa;
    } else {
        despesas.push(despesa);
    }

    if (!salvarDespesas(despesas)) return;

    fecharFormularioDespesa();
    renderizarDespesas();

    if (typeof atualizarDashboard === "function") {
        atualizarDashboard();
    }
});

// ========================================
// EDITAR
// ========================================

function editarDespesa(id) {
    const despesa = obterDespesas()
        .find(item => item.id === id);

    if (!despesa) return;

    carregarSelectDespesas();

    document.getElementById("despesa-id").value = despesa.id;
    document.getElementById("despesa-veiculo").value = despesa.veiculoId;
    document.getElementById("categoria-despesa").value = despesa.categoria;
    document.getElementById("data-despesa").value = despesa.data;
    document.getElementById("valor-despesa").value = despesa.valor;
    document.getElementById("pagamento-despesa").value = despesa.pagamento || "";
    document.getElementById("descricao-despesa").value = despesa.descricao || "";

    document.getElementById("titulo-form-despesa").textContent =
        "Editar despesa";

    containerDespesa.classList.remove("hidden");
}

// ========================================
// EXCLUIR
// ========================================

function excluirDespesa(id) {
    if (!confirm("Deseja excluir esta despesa?")) return;

    const despesas = obterDespesas()
        .filter(item => item.id !== id);

    if (!salvarDespesas(despesas)) return;

    renderizarDespesas();

    if (typeof atualizarDashboard === "function") {
        atualizarDashboard();
    }
}

// ========================================
// RENDERIZAR TABELA
// ========================================

function renderizarDespesas() {
    const despesas = obterDespesas();

    corpoTabelaDespesas.innerHTML = "";

    const vazio = document.getElementById(
        "mensagem-despesas-vazias"
    );

    vazio.classList.toggle("hidden", despesas.length > 0);

    despesas.sort((a, b) => b.data.localeCompare(a.data));

    despesas.forEach(despesa => {
        const linha = document.createElement("tr");

        const dados = [
            nomeVeiculoDespesa(despesa.veiculoId),
            despesa.categoria,
            despesa.descricao || "Sem descrição",
            formatarDataDespesa(despesa.data),
            despesa.pagamento || "Não informado",
            formatarMoedaDespesa(despesa.valor)
        ];

        dados.forEach(valor => {
            const celula = document.createElement("td");
            celula.textContent = valor;
            linha.appendChild(celula);
        });

        const acoes = document.createElement("td");
        acoes.className = "acoes-tabela";

        const editar = document.createElement("button");
        editar.type = "button";
        editar.textContent = "Editar";
        editar.addEventListener("click", () =>
            editarDespesa(despesa.id)
        );

        const excluir = document.createElement("button");
        excluir.type = "button";
        excluir.textContent = "Excluir";
        excluir.className = "btn-excluir";
        excluir.addEventListener("click", () =>
            excluirDespesa(despesa.id)
        );

        acoes.append(editar, excluir);
        linha.appendChild(acoes);

        corpoTabelaDespesas.appendChild(linha);
    });
}

// ========================================
// INICIALIZAÇÃO
// ========================================

carregarSelectDespesas();
renderizarDespesas();
