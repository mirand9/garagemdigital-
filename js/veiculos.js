
// ========================================
// GARAGEM DIGITAL - VEÍCULOS
// ========================================

const CHAVE_VEICULOS = "garagem_veiculos";

// Elementos
const formulario = document.getElementById("form-veiculo");
const containerFormulario = document.getElementById("formulario-veiculo");
const listaVeiculos = document.getElementById("lista-veiculos");

const botaoAdicionar = document.getElementById("adicionar-veiculo");
const botaoCancelar = document.getElementById("cancelar-cadastro");

// Campos
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

// ========================================
// ARMAZENAMENTO
// ========================================

function obterVeiculos() {
    try {
        return JSON.parse(
            localStorage.getItem(CHAVE_VEICULOS) || "[]"
        );
    } catch {
        return [];
    }
}

function salvarVeiculos(veiculos) {
    localStorage.setItem(
        CHAVE_VEICULOS,
        JSON.stringify(veiculos)
    );
}

// ========================================
// FORMULÁRIO
// ========================================

function abrirFormulario() {
    formulario.reset();
    campos.id.value = "";

    document.getElementById("titulo-formulario").textContent =
        "Cadastrar veículo";

    containerFormulario.classList.remove("hidden");

    campos.marca.focus();
}

function fecharFormulario() {
    containerFormulario.classList.add("hidden");
    formulario.reset();
    campos.id.value = "";
}

botaoAdicionar.addEventListener("click", abrirFormulario);

botaoCancelar.addEventListener("click", fecharFormulario);

// ========================================
// CADASTRAR / EDITAR
// ========================================

formulario.addEventListener("submit", function(event) {

    event.preventDefault();

    const veiculos = obterVeiculos();

    const id = campos.id.value;

    const veiculo = {
        id: id || crypto.randomUUID(),
        marca: campos.marca.value.trim(),
        modelo: campos.modelo.value.trim(),
        ano: Number(campos.ano.value),
        placa: campos.placa.value.trim().toUpperCase(),
        motor: campos.motor.value.trim(),
        combustivel: campos.combustivel.value,
        quilometragem: Number(campos.quilometragem.value),
        cor: campos.cor.value.trim()
    };

    if (!veiculo.marca || !veiculo.modelo || !veiculo.ano ||
        veiculo.quilometragem < 0) {
        alert("Verifique os dados informados.");
        return;
    }

    // Verifica placa duplicada
    if (veiculo.placa) {
        const placaDuplicada = veiculos.some(item =>
            item.placa === veiculo.placa && item.id !== id
        );

        if (placaDuplicada) {
            alert("Já existe um veículo com essa placa.");
            return;
        }
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

    salvarVeiculos(veiculos);

    fecharFormulario();
    renderizarVeiculos();

    // Atualiza o dashboard, caso a função exista
    if (typeof atualizarDashboard === "function") {
        atualizarDashboard();
    }

});

// ========================================
// LISTAR VEÍCULOS
// ========================================

function renderizarVeiculos() {

    const veiculos = obterVeiculos();

    listaVeiculos.innerHTML = "";

    if (veiculos.length === 0) {

        const vazio = document.createElement("div");

        vazio.className = "garagem-vazia";
        vazio.textContent =
            "Sua garagem está vazia. Cadastre seu primeiro veículo!";

        listaVeiculos.appendChild(vazio);

        return;
    }

    veiculos.forEach(veiculo => {

        const card = document.createElement("article");

        card.className = "veiculo-card";

        // Usar textContent evita interpretar os dados cadastrados como HTML.
        const titulo = document.createElement("h3");
        titulo.textContent = `${veiculo.marca} ${veiculo.modelo}`;

        const descricao = document.createElement("p");
        descricao.className = "veiculo-descricao";
        descricao.textContent =
            `${veiculo.ano} · ${veiculo.motor || "Motor não informado"}`;

        const informacoes = document.createElement("div");
        informacoes.className = "veiculo-info";

        const dados = [
            ["Quilometragem", `${veiculo.quilometragem.toLocaleString("pt-BR")} km`],
            ["Placa", veiculo.placa || "Não informada"],
            ["Combustível", veiculo.combustivel || "Não informado"],
            ["Cor", veiculo.cor || "Não informada"]
        ];

        dados.forEach(([rotulo, valor]) => {
            const item = document.createElement("div");

            const label = document.createElement("span");
            label.textContent = rotulo;

            const strong = document.createElement("strong");
            strong.textContent = valor;

            item.append(label, strong);
            informacoes.appendChild(item);
        });

        const acoes = document.createElement("div");
        acoes.className = "veiculo-acoes";

        const editar = document.createElement("button");
        editar.type = "button";
        editar.textContent = "Editar";
        editar.addEventListener("click", () => editarVeiculo(veiculo.id));

        const excluir = document.createElement("button");
        excluir.type = "button";
        excluir.textContent = "Excluir";
        excluir.className = "btn-excluir";
        excluir.addEventListener("click", () => excluirVeiculo(veiculo.id));

        acoes.append(editar, excluir);

        card.append(titulo, descricao, informacoes, acoes);

        listaVeiculos.appendChild(card);

    });

}

// ========================================
// EDITAR VEÍCULO
// ========================================

function editarVeiculo(id) {

    const veiculo = obterVeiculos().find(item => item.id === id);

    if (!veiculo) return;

    campos.id.value = veiculo.id;
    campos.marca.value = veiculo.marca;
    campos.modelo.value = veiculo.modelo;
    campos.ano.value = veiculo.ano;
    campos.placa.value = veiculo.placa;
    campos.motor.value = veiculo.motor;
    campos.combustivel.value = veiculo.combustivel;
    campos.quilometragem.value = veiculo.quilometragem;
    campos.cor.value = veiculo.cor;

    document.getElementById("titulo-formulario").textContent =
        "Editar veículo";

    containerFormulario.classList.remove("hidden");

    campos.marca.focus();

}

// ========================================
// EXCLUIR VEÍCULO
// ========================================

function excluirVeiculo(id) {

    const confirmar = confirm(
        "Tem certeza que deseja excluir este veículo?"
    );

    if (!confirmar) return;

    const veiculos = obterVeiculos().filter(
        item => item.id !== id
    );

    salvarVeiculos(veiculos);

    renderizarVeiculos();

    if (typeof atualizarDashboard === "function") {
        atualizarDashboard();
    }

}

// ========================================
// INICIALIZAÇÃO
// ========================================

renderizarVeiculos();
