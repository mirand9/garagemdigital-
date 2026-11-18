// ========================================
// MOTORISTAS
// Cadastro de motoristas com dados pessoais e CNH.
// A atribuição ao veículo é feita no formulário do veículo
// (campo "Motorista responsável").
// ========================================

const CHAVE_MOTORISTAS = "garagem_motoristas";

const formMotorista = document.getElementById("form-motorista");
const containerMotorista = document.getElementById("formulario-motorista");
const listaMotoristas = document.getElementById("lista-motoristas");
const alertasMotoristas = document.getElementById("alertas-motoristas");

const camposMotorista = {
    id: document.getElementById("motorista-id"),
    nome: document.getElementById("motorista-nome"),
    cpf: document.getElementById("motorista-cpf"),
    nascimento: document.getElementById("motorista-nascimento"),
    telefone: document.getElementById("motorista-telefone"),
    email: document.getElementById("motorista-email"),
    cnh: document.getElementById("motorista-cnh"),
    categoria: document.getElementById("motorista-categoria"),
    validadeCnh: document.getElementById("motorista-validade-cnh"),
    emergenciaNome: document.getElementById("motorista-emergencia-nome"),
    emergenciaTelefone: document.getElementById("motorista-emergencia-telefone"),
    observacoes: document.getElementById("motorista-observacoes")
};

// ========================================
// ARMAZENAMENTO
// ========================================

function obterMotoristas() {
    try {
        const dados = JSON.parse(
            localStorage.getItem(CHAVE_MOTORISTAS) || "[]"
        );

        return Array.isArray(dados) ? dados : [];
    } catch {
        return [];
    }
}

function salvarMotoristas(motoristas) {
    try {
        localStorage.setItem(
            CHAVE_MOTORISTAS,
            JSON.stringify(motoristas)
        );

        return true;
    } catch {
        alert("Não foi possível salvar o motorista neste navegador.");
        return false;
    }
}

// ========================================
// UTILITÁRIOS
// ========================================

function apenasDigitos(valor) {
    return String(valor || "").replace(/\D/g, "");
}

function dataHojeMotorista() {
    const hoje = new Date();

    return [
        hoje.getFullYear(),
        String(hoje.getMonth() + 1).padStart(2, "0"),
        String(hoje.getDate()).padStart(2, "0")
    ].join("-");
}

function formatarDataMotorista(data) {
    if (!data) return "Não informada";

    const partes = data.split("-");

    if (partes.length !== 3) return "Data inválida";

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function calcularIdade(nascimento) {
    const [ano, mes, dia] = nascimento.split("-").map(Number);
    const hoje = new Date();

    let idade = hoje.getFullYear() - ano;

    const aindaNaoFezAniversario =
        hoje.getMonth() + 1 < mes ||
        (hoje.getMonth() + 1 === mes && hoje.getDate() < dia);

    if (aindaNaoFezAniversario) idade--;

    return idade;
}

function mascararCpf(valor) {
    const digitos = apenasDigitos(valor).slice(0, 11);

    return digitos
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function mascararTelefone(valor) {
    const d = apenasDigitos(valor).slice(0, 11);

    if (d.length === 0) return "";
    if (d.length <= 2) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;

    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function cpfValido(cpf) {
    const numeros = apenasDigitos(cpf);

    if (numeros.length !== 11 || /^(\d)\1+$/.test(numeros)) {
        return false;
    }

    for (const tamanho of [9, 10]) {
        let soma = 0;

        for (let i = 0; i < tamanho; i++) {
            soma += Number(numeros[i]) * (tamanho + 1 - i);
        }

        const digito = (soma * 10) % 11 % 10;

        if (digito !== Number(numeros[tamanho])) return false;
    }

    return true;
}

function telefoneValido(telefone) {
    const tamanho = apenasDigitos(telefone).length;
    return tamanho === 10 || tamanho === 11;
}

// ========================================
// MÁSCARAS NOS CAMPOS
// ========================================

camposMotorista.cpf.addEventListener("input", () => {
    camposMotorista.cpf.value = mascararCpf(camposMotorista.cpf.value);
});

camposMotorista.telefone.addEventListener("input", () => {
    camposMotorista.telefone.value =
        mascararTelefone(camposMotorista.telefone.value);
});

camposMotorista.emergenciaTelefone.addEventListener("input", () => {
    camposMotorista.emergenciaTelefone.value =
        mascararTelefone(camposMotorista.emergenciaTelefone.value);
});

camposMotorista.cnh.addEventListener("input", () => {
    camposMotorista.cnh.value =
        apenasDigitos(camposMotorista.cnh.value).slice(0, 11);
});

// ========================================
// STATUS DA CNH
// ========================================

function statusCnh(validade) {
    if (!validade) {
        return { classe: "neutro", texto: "CNH não informada" };
    }

    const hoje = dataHojeMotorista();

    const dias = Math.round(
        (new Date(`${validade}T12:00:00`) - new Date(`${hoje}T12:00:00`)) /
        86400000
    );

    if (dias < 0) {
        return { classe: "vencida", texto: "CNH vencida" };
    }

    if (dias === 0) {
        return { classe: "vencendo", texto: "CNH vence hoje" };
    }

    if (dias <= 30) {
        return {
            classe: "vencendo",
            texto: `CNH vence em ${dias} dia${dias > 1 ? "s" : ""}`
        };
    }

    return { classe: "valida", texto: "CNH válida" };
}

// Usada pelo cadastro de veículos ao atribuir um motorista.
function avisoCnhMotorista(motoristaId) {
    const motorista = obterMotoristas()
        .find(item => item.id === motoristaId);

    if (!motorista) return "";

    if (statusCnh(motorista.validadeCnh).classe === "vencida") {
        return `A CNH de ${motorista.nome} está vencida. ` +
            "Deseja atribuir este motorista mesmo assim?";
    }

    return "";
}

// ========================================
// FORMULÁRIO
// ========================================

function abrirFormularioMotorista() {
    formMotorista.reset();

    camposMotorista.id.value = "";

    document.getElementById("titulo-form-motorista").textContent =
        "Cadastrar motorista";

    containerMotorista.classList.remove("hidden");
    camposMotorista.nome.focus();
}

function fecharFormularioMotorista() {
    containerMotorista.classList.add("hidden");
    formMotorista.reset();
    camposMotorista.id.value = "";
}

document.getElementById("abrir-form-motorista")
    .addEventListener("click", abrirFormularioMotorista);

document.getElementById("cancelar-motorista")
    .addEventListener("click", fecharFormularioMotorista);

// ========================================
// CADASTRAR / EDITAR
// ========================================

formMotorista.addEventListener("submit", event => {
    event.preventDefault();

    const id = camposMotorista.id.value;

    const motorista = {
        id: id || gerarId(),
        nome: camposMotorista.nome.value.trim(),
        cpf: camposMotorista.cpf.value.trim(),
        nascimento: camposMotorista.nascimento.value,
        telefone: camposMotorista.telefone.value.trim(),
        email: camposMotorista.email.value.trim(),
        cnh: apenasDigitos(camposMotorista.cnh.value),
        categoriaCnh: camposMotorista.categoria.value,
        validadeCnh: camposMotorista.validadeCnh.value,
        emergenciaNome: camposMotorista.emergenciaNome.value.trim(),
        emergenciaTelefone: camposMotorista.emergenciaTelefone.value.trim(),
        observacoes: camposMotorista.observacoes.value.trim()
    };

    if (!motorista.nome) {
        alert("Informe o nome do motorista.");
        return;
    }

    if (motorista.cpf && !cpfValido(motorista.cpf)) {
        alert("Informe um CPF válido.");
        return;
    }

    if (motorista.nascimento) {
        const idade = calcularIdade(motorista.nascimento);

        if (motorista.nascimento > dataHojeMotorista() || idade > 120) {
            alert("Informe uma data de nascimento válida.");
            return;
        }
    }

    if (motorista.telefone && !telefoneValido(motorista.telefone)) {
        alert("Informe um telefone válido, com DDD.");
        return;
    }

    if (motorista.emergenciaTelefone &&
        !telefoneValido(motorista.emergenciaTelefone)) {
        alert("Informe um telefone de emergência válido, com DDD.");
        return;
    }

    if (motorista.cnh && motorista.cnh.length !== 11) {
        alert("O número da CNH deve ter 11 dígitos.");
        return;
    }

    const motoristas = obterMotoristas();

    const cpfDuplicado = motorista.cpf && motoristas.some(item =>
        item.cpf &&
        apenasDigitos(item.cpf) === apenasDigitos(motorista.cpf) &&
        item.id !== id
    );

    if (cpfDuplicado) {
        alert("Já existe um motorista cadastrado com esse CPF.");
        return;
    }

    if (id) {
        const indice = motoristas.findIndex(item => item.id === id);

        if (indice === -1) {
            alert("Motorista não encontrado.");
            return;
        }

        motoristas[indice] = motorista;
    } else {
        motoristas.push(motorista);
    }

    if (!salvarMotoristas(motoristas)) return;

    fecharFormularioMotorista();

    // renderizarVeiculos também atualiza a lista de motoristas
    // e o seletor de motorista no formulário do veículo.
    renderizarVeiculos();
});

// ========================================
// EDITAR
// ========================================

function editarMotorista(id) {
    const motorista = obterMotoristas().find(item => item.id === id);

    if (!motorista) return;

    camposMotorista.id.value = motorista.id;
    camposMotorista.nome.value = motorista.nome || "";
    camposMotorista.cpf.value = motorista.cpf || "";
    camposMotorista.nascimento.value = motorista.nascimento || "";
    camposMotorista.telefone.value = motorista.telefone || "";
    camposMotorista.email.value = motorista.email || "";
    camposMotorista.cnh.value = motorista.cnh || "";
    camposMotorista.categoria.value = motorista.categoriaCnh || "";
    camposMotorista.validadeCnh.value = motorista.validadeCnh || "";
    camposMotorista.emergenciaNome.value = motorista.emergenciaNome || "";
    camposMotorista.emergenciaTelefone.value = motorista.emergenciaTelefone || "";
    camposMotorista.observacoes.value = motorista.observacoes || "";

    document.getElementById("titulo-form-motorista").textContent =
        "Editar motorista";

    containerMotorista.classList.remove("hidden");
    camposMotorista.nome.focus();
}

// ========================================
// EXCLUIR
// ========================================

function excluirMotorista(id) {
    const motorista = obterMotoristas().find(item => item.id === id);

    if (!motorista) return;

    const confirmar = confirm(
        `Deseja excluir ${motorista.nome}?\n\n` +
        "Os veículos atribuídos a ele ficarão sem motorista."
    );

    if (!confirmar) return;

    const motoristas = obterMotoristas().filter(item => item.id !== id);

    if (!salvarMotoristas(motoristas)) return;

    const veiculos = obterVeiculos().map(veiculo =>
        veiculo.motoristaId === id
            ? { ...veiculo, motoristaId: "" }
            : veiculo
    );

    salvarVeiculos(veiculos);
    renderizarVeiculos();
}

// ========================================
// ALERTAS DE CNH
// ========================================

function renderizarAlertasMotoristas(motoristas) {
    alertasMotoristas.innerHTML = "";

    const alertas = motoristas
        .map(motorista => ({
            motorista,
            status: statusCnh(motorista.validadeCnh)
        }))
        .filter(item =>
            item.status.classe === "vencida" ||
            item.status.classe === "vencendo"
        );

    alertas.forEach(({ motorista, status }) => {
        const alerta = document.createElement("div");

        alerta.className = `alerta-item ${
            status.classe === "vencida" ? "atrasada" : "proxima"
        }`;

        const titulo = document.createElement("strong");
        titulo.textContent = `${status.texto}: ${motorista.nome}`;

        const detalhes = document.createElement("p");
        detalhes.textContent =
            `Validade: ${formatarDataMotorista(motorista.validadeCnh)}`;

        alerta.append(titulo, detalhes);
        alertasMotoristas.appendChild(alerta);
    });
}

// ========================================
// CARDS
// ========================================

function criarInfoMotorista(rotulo, valor, larga = false) {
    const bloco = document.createElement("div");

    if (larga) bloco.className = "info-larga";

    const legenda = document.createElement("span");
    const dado = document.createElement("strong");

    legenda.textContent = rotulo;
    dado.textContent = valor;

    bloco.append(legenda, dado);

    return bloco;
}

function renderizarMotoristas() {
    if (!listaMotoristas) return;

    const motoristas = obterMotoristas()
        .slice()
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

    const veiculos = obterVeiculos();

    listaMotoristas.innerHTML = "";

    renderizarAlertasMotoristas(motoristas);

    if (motoristas.length === 0) {
        const vazio = document.createElement("div");
        vazio.className = "garagem-vazia";
        vazio.textContent =
            "Nenhum motorista cadastrado. Cadastre o primeiro motorista!";

        listaMotoristas.appendChild(vazio);
        return;
    }

    motoristas.forEach(motorista => {
        const card = document.createElement("article");
        card.className = "veiculo-card";

        const titulo = document.createElement("h3");
        titulo.textContent = motorista.nome;

        const descricao = document.createElement("p");
        descricao.className = "veiculo-descricao";
        descricao.textContent = motorista.categoriaCnh
            ? `Categoria ${motorista.categoriaCnh}`
            : "Motorista";

        const status = statusCnh(motorista.validadeCnh);

        const selo = document.createElement("span");
        selo.className = `selo ${status.classe}`;
        selo.textContent = status.texto;

        const atribuidos = veiculos
            .filter(veiculo => veiculo.motoristaId === motorista.id)
            .map(veiculo =>
                `${veiculo.marca} ${veiculo.modelo}` +
                (veiculo.placa ? ` (${veiculo.placa})` : "")
            );

        const nascimento = motorista.nascimento
            ? `${formatarDataMotorista(motorista.nascimento)} · ` +
              `${calcularIdade(motorista.nascimento)} anos`
            : "Não informado";

        const emergencia = [
            motorista.emergenciaNome,
            motorista.emergenciaTelefone
        ].filter(Boolean).join(" · ") || "Não informado";

        const informacoes = document.createElement("div");
        informacoes.className = "veiculo-info";

        informacoes.append(
            criarInfoMotorista("CPF", motorista.cpf || "Não informado"),
            criarInfoMotorista("Nascimento", nascimento),
            criarInfoMotorista("Telefone", motorista.telefone || "Não informado"),
            criarInfoMotorista("E-mail", motorista.email || "Não informado"),
            criarInfoMotorista("CNH", motorista.cnh || "Não informada"),
            criarInfoMotorista(
                "Validade da CNH",
                formatarDataMotorista(motorista.validadeCnh)
            ),
            criarInfoMotorista("Contato de emergência", emergencia, true),
            criarInfoMotorista(
                "Veículos atribuídos",
                atribuidos.length > 0
                    ? atribuidos.join(", ")
                    : "Nenhum veículo atribuído",
                true
            )
        );

        if (motorista.observacoes) {
            informacoes.appendChild(
                criarInfoMotorista("Observações", motorista.observacoes, true)
            );
        }

        const acoes = document.createElement("div");
        acoes.className = "veiculo-acoes";

        const editar = document.createElement("button");
        editar.type = "button";
        editar.textContent = "Editar";
        editar.addEventListener("click", () => editarMotorista(motorista.id));

        const excluir = document.createElement("button");
        excluir.type = "button";
        excluir.className = "btn-excluir";
        excluir.textContent = "Excluir";
        excluir.addEventListener("click", () => excluirMotorista(motorista.id));

        acoes.append(editar, excluir);

        card.append(titulo, descricao, selo, informacoes, acoes);
        listaMotoristas.appendChild(card);
    });
}

// ========================================
// INICIALIZAÇÃO
// ========================================

// Atualiza veículos (nome do motorista e seletor) e a lista de motoristas.
renderizarVeiculos();
