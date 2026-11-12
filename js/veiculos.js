const CHAVE_VEICULOS = "garagem_veiculos";

const formulario = document.getElementById("form-veiculo");
const containerFormulario = document.getElementById("formulario-veiculo");
const listaVeiculos = document.getElementById("lista-veiculos");
const botaoAdicionar = document.getElementById("adicionar-veiculo");
const botaoAdicionarGaragem = document.getElementById("adicionar-veiculo-garagem");
const botaoCancelar = document.getElementById("cancelar-cadastro");

const campos = {
    id: document.getElementById("veiculo-id"),
    marca: document.getElementById("marca"),
    modelo: document.getElementById("modelo"),
    ano: document.getElementById("ano"),
    placa: document.getElementById("placa"),
    motor: document.getElementById("motor"),
    combustivel: document.getElementById("combustivel"),
    quilometragem: document.getElementById("quilometragem"),
    cor: document.getElementById("cor")
};

function gerarId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return window.crypto.randomUUID();
    }
    return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function obterVeiculos() {
    try {
        const dados = JSON.parse(localStorage.getItem(CHAVE_VEICULOS) || "[]");
        return Array.isArray(dados) ? dados : [];
    } catch {
        return [];
    }
}

function salvarVeiculos(veiculos) {
    try {
        localStorage.setItem(CHAVE_VEICULOS, JSON.stringify(veiculos));
        return true;
    } catch {
        alert("Não foi possível salvar os veículos neste navegador.");
        return false;
    }
}

function abrirFormulario() {
    formulario.reset();
    campos.id.value = "";
    document.getElementById("titulo-formulario").textContent = "Cadastrar veículo";
    containerFormulario.classList.remove("hidden");
    campos.marca.focus();
}

function fecharFormulario() {
    containerFormulario.classList.add("hidden");
    formulario.reset();
    campos.id.value = "";
}

botaoAdicionar.addEventListener("click", abrirFormulario);
botaoAdicionarGaragem.addEventListener("click", abrirFormulario);
botaoCancelar.addEventListener("click", fecharFormulario);

formulario.addEventListener("submit", event => {
    event.preventDefault();

    const id = campos.id.value;
    const veiculo = {
        id: id || gerarId(),
        marca: campos.marca.value.trim(),
        modelo: campos.modelo.value.trim(),
        ano: Number(campos.ano.value),
        placa: campos.placa.value.trim().toUpperCase(),
        motor: campos.motor.value.trim(),
        combustivel: campos.combustivel.value,
        quilometragem: Number(campos.quilometragem.value),
        cor: campos.cor.value.trim()
    };

    const anoAtual = new Date().getFullYear();

    if (!veiculo.marca || !veiculo.modelo) {
        alert("Preencha a marca e o modelo do veículo.");
        return;
    }

    if (!Number.isInteger(veiculo.ano) || veiculo.ano < 1900 || veiculo.ano > anoAtual + 1) {
        alert("Informe um ano válido.");
        return;
    }

    if (!Number.isFinite(veiculo.quilometragem) || veiculo.quilometragem < 0) {
        alert("Informe uma quilometragem válida.");
        return;
    }

    const veiculos = obterVeiculos();
    const placaDuplicada = veiculo.placa && veiculos.some(item =>
        item.placa &&
        item.placa.toUpperCase() === veiculo.placa &&
        item.id !== id
    );

    if (placaDuplicada) {
        alert("Já existe um veículo cadastrado com essa placa.");
        return;
    }

    if (id) {
        const indice = veiculos.findIndex(item => item.id === id);
        if (indice === -1) {
            alert("Veículo não encontrado.");
            return;
        }
        veiculos[indice] = veiculo;
    } else {
        veiculos.push(veiculo);
    }

    if (!salvarVeiculos(veiculos)) return;

    fecharFormulario();
    renderizarVeiculos();

    if (typeof carregarVeiculosSelect === "function") carregarVeiculosSelect();
    if (typeof carregarSelectDespesas === "function") carregarSelectDespesas();
    if (typeof atualizarDashboard === "function") atualizarDashboard();
});

function criarInfoVeiculo(rotulo, valor) {
    const bloco = document.createElement("div");
    const legenda = document.createElement("span");
    const dado = document.createElement("strong");

    legenda.textContent = rotulo;
    dado.textContent = valor;
    bloco.append(legenda, dado);
    return bloco;
}

function renderizarVeiculos() {
    const veiculos = obterVeiculos();
    listaVeiculos.innerHTML = "";

    if (veiculos.length === 0) {
        const vazio = document.createElement("div");
        vazio.className = "garagem-vazia";
        vazio.textContent = "Sua garagem está vazia. Cadastre seu primeiro veículo!";
        listaVeiculos.appendChild(vazio);
    }

    veiculos.forEach(veiculo => {
        const card = document.createElement("article");
        card.className = "veiculo-card";

        const titulo = document.createElement("h3");
        titulo.textContent = `${veiculo.marca} ${veiculo.modelo}`;

        const descricao = document.createElement("p");
        descricao.className = "veiculo-descricao";
        descricao.textContent = [
            veiculo.ano,
            veiculo.placa || "Sem placa"
        ].join(" · ");

        const informacoes = document.createElement("div");
        informacoes.className = "veiculo-info";
        informacoes.append(
            criarInfoVeiculo("Motor", veiculo.motor || "Não informado"),
            criarInfoVeiculo("Combustível", veiculo.combustivel || "Não informado"),
            criarInfoVeiculo("Quilometragem", `${Number(veiculo.quilometragem || 0).toLocaleString("pt-BR")} km`),
            criarInfoVeiculo("Cor", veiculo.cor || "Não informada")
        );

        const acoes = document.createElement("div");
        acoes.className = "veiculo-acoes";

        const editar = document.createElement("button");
        editar.type = "button";
        editar.textContent = "Editar";
        editar.addEventListener("click", () => editarVeiculo(veiculo.id));

        const excluir = document.createElement("button");
        excluir.type = "button";
        excluir.className = "btn-excluir";
        excluir.textContent = "Excluir";
        excluir.addEventListener("click", () => excluirVeiculo(veiculo.id));

        acoes.append(editar, excluir);
        card.append(titulo, descricao, informacoes, acoes);
        listaVeiculos.appendChild(card);
    });

    if (typeof carregarVeiculosSelect === "function") carregarVeiculosSelect();
    if (typeof carregarSelectDespesas === "function") carregarSelectDespesas();
}

function editarVeiculo(id) {
    const veiculo = obterVeiculos().find(item => item.id === id);
    if (!veiculo) return;

    campos.id.value = veiculo.id;
    campos.marca.value = veiculo.marca || "";
    campos.modelo.value = veiculo.modelo || "";
    campos.ano.value = veiculo.ano ?? "";
    campos.placa.value = veiculo.placa || "";
    campos.motor.value = veiculo.motor || "";
    campos.combustivel.value = veiculo.combustivel || "";
    campos.quilometragem.value = veiculo.quilometragem ?? 0;
    campos.cor.value = veiculo.cor || "";

    document.getElementById("titulo-formulario").textContent = "Editar veículo";
    containerFormulario.classList.remove("hidden");
    campos.marca.focus();
}

function excluirVeiculo(id) {
    const veiculo = obterVeiculos().find(item => item.id === id);
    if (!veiculo) return;

    const confirmar = confirm(
        `Deseja excluir ${veiculo.marca} ${veiculo.modelo}?\n\n` +
        "O histórico de despesas e manutenções será preservado, mas ficará sem vínculo com o veículo."
    );
    if (!confirmar) return;

    const veiculos = obterVeiculos().filter(item => item.id !== id);
    if (!salvarVeiculos(veiculos)) return;

    renderizarVeiculos();
    if (typeof atualizarDashboard === "function") atualizarDashboard();
}

renderizarVeiculos();
