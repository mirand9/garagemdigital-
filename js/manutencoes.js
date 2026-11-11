
const CHAVE_MANUTENCOES = "garagem_manutencoes";

const formularioManutencao =
    document.getElementById("form-manutencao");

const containerFormManutencao =
    document.getElementById("formulario-manutencao");

const corpoTabelaManutencoes =
    document.getElementById("corpo-tabela-manutencoes");

const alertasManutencao =
    document.getElementById("alertas-manutencao");

const moedaManutencao = valor =>
    Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

const obterManutencoes = () => {
    try {
        const dados = JSON.parse(
            localStorage.getItem(CHAVE_MANUTENCOES) || "[]"
        );

        return Array.isArray(dados) ? dados : [];
    } catch {
        return [];
    }
};

function salvarManutencoes(manutencoes) {
    try {
        localStorage.setItem(
            CHAVE_MANUTENCOES,
            JSON.stringify(manutencoes)
        );

        return true;
    } catch {
        alert("Não foi possível salvar a manutenção.");
        return false;
    }
}

function obterVeiculosManutencao() {
    return typeof obterVeiculos === "function"
        ? obterVeiculos()
        : [];
}

function dataLocalISO(data = new Date()) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

function formatarData(data) {
    if (!data) return "Não definida";

    const partes = data.split("-");

    if (partes.length !== 3) return "Data inválida";

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function obterNomeVeiculo(id) {
    const veiculo = obterVeiculosManutencao()
        .find(item => item.id === id);

    return veiculo
        ? `${veiculo.marca} ${veiculo.modelo}`
        : "Veículo não encontrado";
}

// ========================================
// VEÍCULOS NO SELECT
// ========================================

function carregarVeiculosSelect() {
    const select = document.getElementById("manutencao-veiculo");
    const veiculos = obterVeiculosManutencao();

    const selecionado = select.value;

    select.innerHTML = "";

    const opcaoInicial = document.createElement("option");
    opcaoInicial.value = "";
    opcaoInicial.textContent = "Selecione um veículo";

    select.appendChild(opcaoInicial);

    veiculos.forEach(veiculo => {
        const opcao = document.createElement("option");

        opcao.value = veiculo.id;
        opcao.textContent =
            `${veiculo.marca} ${veiculo.modelo} - ${veiculo.ano}`;

        select.appendChild(opcao);
    });

    if (veiculos.some(item => item.id === selecionado)) {
        select.value = selecionado;
    }
}

// ========================================
// FORMULÁRIO
// ========================================

function abrirFormularioManutencao() {
    formularioManutencao.reset();

    document.getElementById("manutencao-id").value = "";
    document.getElementById("titulo-form-manutencao").textContent =
        "Registrar manutenção";

    carregarVeiculosSelect();

    containerFormManutencao.classList.remove("hidden");

    document.getElementById("manutencao-veiculo").focus();
}

function fecharFormularioManutencao() {
    containerFormManutencao.classList.add("hidden");
    formularioManutencao.reset();
    document.getElementById("manutencao-id").value = "";
}

document.getElementById("abrir-form-manutencao")
    .addEventListener("click", () => {
        carregarVeiculosSelect();

        if (obterVeiculosManutencao().length === 0) {
            alert("Cadastre um veículo antes de registrar uma manutenção.");
            return;
        }

        abrirFormularioManutencao();
    });

document.getElementById("cancelar-manutencao")
    .addEventListener("click", fecharFormularioManutencao);

// ========================================
// CADASTRAR / EDITAR
// ========================================

formularioManutencao.addEventListener("submit", event => {
    event.preventDefault();

    const id = document.getElementById("manutencao-id").value;

    const veiculoId =
        document.getElementById("manutencao-veiculo").value;

    const veiculos = obterVeiculosManutencao();

    const veiculo = veiculos.find(item => item.id === veiculoId);

    if (!veiculo) {
        alert("Selecione um veículo válido.");
        return;
    }

    const quilometragem = Number(
        document.getElementById("km-manutencao").value
    );

    const valor = Number(
        document.getElementById("valor-manutencao").value
    );

    const proximaKmValor =
        document.getElementById("proxima-km").value;

    const proximaKm = proximaKmValor === ""
        ? null
        : Number(proximaKmValor);

    const data = document.getElementById("data-manutencao").value;

    const proximaData =
        document.getElementById("proxima-data").value;

    if (!data || data > dataLocalISO()) {
        alert("Informe uma data de manutenção válida.");
        return;
    }

    if (!Number.isFinite(quilometragem) ||
        quilometragem < 0 ||
        !Number.isFinite(valor) ||
        valor < 0) {
        alert("Verifique a quilometragem e o valor informado.");
        return;
    }

    if (quilometragem > Number(veiculo.quilometragem || 0)) {
    alert("A quilometragem da manutenção não pode ser maior que a quilometragem atual do veículo. Atualize a quilometragem do veículo, se necessário.");
    return;
}
    

    if (proximaKm !== null &&
        (!Number.isFinite(proximaKm) || proximaKm <= quilometragem)) {
        alert("A próxima quilometragem deve ser maior que a quilometragem da manutenção.");
        return;
    }

    if (proximaData && proximaData < data) {
        alert("A próxima revisão não pode ser anterior à manutenção.");
        return;
    }

    const manutencao = {
        id: id || crypto.randomUUID(),
        veiculoId,
        tipo: document.getElementById("tipo-servico").value,
        data,
        quilometragem,
        valor,
        oficina: document.getElementById("oficina-manutencao").value.trim(),
        descricao: document.getElementById("descricao-manutencao").value.trim(),
        proximaData: proximaData || "",
        proximaKm
    };

    if (!manutencao.tipo) {
        alert("Selecione o tipo de serviço.");
        return;
    }

    const manutencoes = obterManutencoes();

    if (id) {
        const indice = manutencoes.findIndex(item => item.id === id);

        if (indice === -1) {
            alert("Manutenção não encontrada.");
            return;
        }

        manutencoes[indice] = manutencao;
    } else {
        manutencoes.push(manutencao);
    }

    if (!salvarManutencoes(manutencoes)) return;

    fecharFormularioManutencao();
    renderizarManutencoes();

    if (typeof atualizarDashboard === "function") {
        atualizarDashboard();
    }
});

// ========================================
// EDITAR
// ========================================

function editarManutencao(id) {
    const manutencao = obterManutencoes()
        .find(item => item.id === id);

    if (!manutencao) return;

    carregarVeiculosSelect();

    document.getElementById("manutencao-id").value = manutencao.id;
    document.getElementById("manutencao-veiculo").value =
        manutencao.veiculoId;

    document.getElementById("tipo-servico").value = manutencao.tipo;
    document.getElementById("data-manutencao").value = manutencao.data;
    document.getElementById("km-manutencao").value =
        manutencao.quilometragem;

    document.getElementById("valor-manutencao").value =
        manutencao.valor;

    document.getElementById("oficina-manutencao").value =
        manutencao.oficina || "";

    document.getElementById("descricao-manutencao").value =
        manutencao.descricao || "";

    document.getElementById("proxima-data").value =
        manutencao.proximaData || "";

    document.getElementById("proxima-km").value =
        manutencao.proximaKm ?? "";

    document.getElementById("titulo-form-manutencao").textContent =
        "Editar manutenção";

    containerFormManutencao.classList.remove("hidden");
}

// ========================================
// EXCLUIR
// ========================================

function excluirManutencao(id) {
    if (!confirm("Deseja excluir esta manutenção?")) return;

    const manutencoes = obterManutencoes()
        .filter(item => item.id !== id);

    if (!salvarManutencoes(manutencoes)) return;

    renderizarManutencoes();

    if (typeof atualizarDashboard === "function") {
        atualizarDashboard();
    }
}

// ========================================
// ALERTAS DE REVISÃO
// ========================================

function obterStatusRevisao(manutencao) {
    const veiculo = obterVeiculosManutencao()
        .find(item => item.id === manutencao.veiculoId);

    if (!veiculo) return null;

    const hoje = dataLocalISO();
    const kmAtual = Number(veiculo.quilometragem || 0);

    const dataVencida =
        manutencao.proximaData &&
        manutencao.proximaData < hoje;

    const dataProxima = (() => {
        if (!manutencao.proximaData) return false;

        const diferenca =
            (new Date(manutencao.proximaData + "T12:00:00") -
             new Date(hoje + "T12:00:00")) / 86400000;

        return diferenca >= 0 && diferenca <= 30;
    })();

    const kmVencido =
        manutencao.proximaKm !== null &&
        manutencao.proximaKm !== "" &&
        manutencao.proximaKm !== undefined &&
        kmAtual >= Number(manutencao.proximaKm);

    const kmProximo =
        manutencao.proximaKm !== null &&
        manutencao.proximaKm !== "" &&
        manutencao.proximaKm !== undefined &&
        Number(manutencao.proximaKm) - kmAtual <= 1000 &&
        Number(manutencao.proximaKm) - kmAtual > 0;

    if (dataVencida || kmVencido) {
        return {
            classe: "atrasada",
            texto: "Revisão atrasada"
        };
    }

    if (dataProxima || kmProximo) {
        return {
            classe: "proxima",
            texto: "Revisão próxima"
        };
    }

    return {
        classe: "em-dia",
        texto: "Em dia"
    };
}

function renderizarAlertasManutencao() {
    alertasManutencao.innerHTML = "";

    const manutencoes = obterManutencoes();

    const alertas = manutencoes
        .map(manutencao => ({
            manutencao,
            status: obterStatusRevisao(manutencao)
        }))
        .filter(item =>
            item.status &&
            item.status.classe !== "em-dia"
        );

    if (alertas.length === 0) {
        const mensagem = document.createElement("p");
        mensagem.className = "alerta-vazio";
        mensagem.textContent = "Nenhuma revisão próxima ou atrasada.";

        alertasManutencao.appendChild(mensagem);
        return;
    }

    alertas.forEach(({ manutencao, status }) => {
        const alerta = document.createElement("div");

        alerta.className = `alerta-item ${status.classe}`;

        const titulo = document.createElement("strong");
        titulo.textContent =
            `${status.texto}: ${obterNomeVeiculo(manutencao.veiculoId)}`;

        const detalhes = document.createElement("p");

        const partes = [];

        if (manutencao.proximaData) {
            partes.push(
                `Data: ${formatarData(manutencao.proximaData)}`
            );
        }

        if (manutencao.proximaKm !== null &&
            manutencao.proximaKm !== "") {
            partes.push(
                `Quilometragem: ${Number(manutencao.proximaKm).toLocaleString("pt-BR")} km`
            );
        }

        detalhes.textContent = partes.join(" · ");

        alerta.append(titulo, detalhes);
        alertasManutencao.appendChild(alerta);
    });
}

// ========================================
// TABELA
// ========================================

function criarCelula(texto) {
    const td = document.createElement("td");
    td.textContent = texto;
    return td;
}

function renderizarManutencoes() {
    const manutencoes = obterManutencoes();

    corpoTabelaManutencoes.innerHTML = "";

    const vazio =
        document.getElementById("mensagem-tabela-vazia");

    vazio.classList.toggle("hidden", manutencoes.length > 0);

    const ordenadas = [...manutencoes].sort((a, b) =>
        b.data.localeCompare(a.data)
    );

    ordenadas.forEach(manutencao => {
        const tr = document.createElement("tr");

        const veiculo = criarCelula(
            obterNomeVeiculo(manutencao.veiculoId)
        );

        const servico = criarCelula(manutencao.tipo);

        const data = criarCelula(
            formatarData(manutencao.data)
        );

        const km = criarCelula(
            `${Number(manutencao.quilometragem).toLocaleString("pt-BR")} km`
        );

        const valor = criarCelula(
            moedaManutencao(manutencao.valor)
        );

        const proxima = criarCelula(
            [
                manutencao.proximaData
                    ? formatarData(manutencao.proximaData)
                    : "",
                manutencao.proximaKm
                    ? `${Number(manutencao.proximaKm).toLocaleString("pt-BR")} km`
                    : ""
            ].filter(Boolean).join(" / ") || "Não definida"
        );

        const acoes = document.createElement("td");
        acoes.className = "acoes-tabela";

        const editar = document.createElement("button");
        editar.type = "button";
        editar.textContent = "Editar";
        editar.addEventListener("click", () =>
            editarManutencao(manutencao.id)
        );

        const excluir = document.createElement("button");
        excluir.type = "button";
        excluir.textContent = "Excluir";
        excluir.className = "btn-excluir";
        excluir.addEventListener("click", () =>
            excluirManutencao(manutencao.id)
        );

        acoes.append(editar, excluir);

        tr.append(veiculo, servico, data, km, valor, proxima, acoes);

        corpoTabelaManutencoes.appendChild(tr);
    });

    renderizarAlertasManutencao();
}

// ========================================
// INICIALIZAÇÃO
// ========================================

carregarVeiculosSelect();
renderizarManutencoes();
