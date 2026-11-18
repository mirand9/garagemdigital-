function lerLista(chave) {
    try {
        const dados = JSON.parse(localStorage.getItem(chave) || "[]");
        return Array.isArray(dados) ? dados : [];
    } catch {
        return [];
    }
}

function atualizarDashboard() {
    const veiculos = lerLista("garagem_veiculos");
    const despesas = lerLista("garagem_despesas");
    const manutencoes = lerLista("garagem_manutencoes");

    const hoje = new Date();
    const gastosMes = despesas
        .filter(item => {
            if (!item.data) return false;
            const data = new Date(`${item.data}T12:00:00`);
            return data.getMonth() === hoje.getMonth() &&
                   data.getFullYear() === hoje.getFullYear();
        })
        .reduce((total, item) => total + Number(item.valor || 0), 0);

    const totalDespesas = despesas.reduce(
        (total, item) => total + Number(item.valor || 0), 0
    );
    const totalManutencoes = manutencoes.reduce(
        (total, item) => total + Number(item.valor || 0), 0
    );
    const totalInvestido = totalDespesas + totalManutencoes;

    const moeda = valor => Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    const atualizarTexto = (id, valor) => {
        const elemento = document.getElementById(id);
        if (elemento) elemento.textContent = valor;
    };

    atualizarTexto("total-veiculos", veiculos.length);
    atualizarTexto("gastos-mes", moeda(gastosMes));
    atualizarTexto("total-manutencoes", manutencoes.length);
    atualizarTexto("total-investido", moeda(totalInvestido));

    atualizarTexto("estatistica-veiculos", veiculos.length);
    atualizarTexto("estatistica-despesas", despesas.length);
    atualizarTexto("estatistica-manutencoes", manutencoes.length);
    atualizarTexto("estatistica-investimento", moeda(totalInvestido));

    renderizarUltimasMovimentacoes(despesas, manutencoes);
    renderizarGrafico(despesas, manutencoes);
}

// ========================================
// GRÁFICO DE PIZZA (gastos)
// ========================================

const CORES_GRAFICO = [
    "#f01e2c", "#ffb020", "#e5e7eb", "#3b82f6", "#22c55e",
    "#a855f7", "#14b8a6", "#ec4899", "#f97316", "#6b7280"
];

const SVG_NS = "http://www.w3.org/2000/svg";

function moedaGrafico(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function agruparGastos(modo, despesas, manutencoes) {
    const veiculos = lerLista("garagem_veiculos");
    const mapa = new Map();

    const nomeVeiculo = id => {
        const veiculo = veiculos.find(item => item.id === id);
        return veiculo
            ? `${veiculo.marca} ${veiculo.modelo}`
            : "Veículo removido";
    };

    const somar = (chave, valor) => {
        if (!Number.isFinite(valor) || valor <= 0) return;
        mapa.set(chave, (mapa.get(chave) || 0) + valor);
    };

    despesas.forEach(item => {
        somar(
            modo === "veiculo"
                ? nomeVeiculo(item.veiculoId)
                : (item.categoria || "Outros"),
            Number(item.valor || 0)
        );
    });

    manutencoes.forEach(item => {
        somar(
            modo === "veiculo"
                ? nomeVeiculo(item.veiculoId)
                : "Manutenção",
            Number(item.valor || 0)
        );
    });

    return Array.from(mapa, ([nome, valor]) => ({ nome, valor }))
        .sort((a, b) => b.valor - a.valor);
}

function criarFatia(item, indice, inicio, fim, total) {
    const centro = 100;
    const raio = 95;

    const ponto = angulo => [
        centro + raio * Math.cos(angulo),
        centro + raio * Math.sin(angulo)
    ];

    let forma;

    if (fim - inicio >= Math.PI * 2 - 0.0001) {
        forma = document.createElementNS(SVG_NS, "circle");
        forma.setAttribute("cx", centro);
        forma.setAttribute("cy", centro);
        forma.setAttribute("r", raio);
    } else {
        const [x1, y1] = ponto(inicio);
        const [x2, y2] = ponto(fim);
        const arcoGrande = fim - inicio > Math.PI ? 1 : 0;

        forma = document.createElementNS(SVG_NS, "path");
        forma.setAttribute(
            "d",
            `M ${centro} ${centro} L ${x1} ${y1} ` +
            `A ${raio} ${raio} 0 ${arcoGrande} 1 ${x2} ${y2} Z`
        );
    }

    forma.setAttribute("class", "fatia");
    forma.setAttribute("fill", CORES_GRAFICO[indice % CORES_GRAFICO.length]);

    const dica = document.createElementNS(SVG_NS, "title");
    dica.textContent =
        `${item.nome}: ${moedaGrafico(item.valor)} ` +
        `(${((item.valor / total) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%)`;

    forma.appendChild(dica);

    return forma;
}

function renderizarGrafico(despesas, manutencoes) {
    const pizza = document.getElementById("grafico-pizza");
    const legenda = document.getElementById("grafico-legenda");
    const corpo = document.getElementById("grafico-corpo");
    const vazio = document.getElementById("grafico-vazio");
    const textoTotal = document.getElementById("grafico-total");
    const seletor = document.getElementById("grafico-agrupar");

    if (!pizza || !legenda || !corpo || !vazio || !textoTotal || !seletor) return;

    const itens = agruparGastos(seletor.value, despesas, manutencoes);
    const total = itens.reduce((soma, item) => soma + item.valor, 0);

    pizza.innerHTML = "";
    legenda.innerHTML = "";

    corpo.classList.toggle("hidden", itens.length === 0);
    vazio.classList.toggle("hidden", itens.length > 0);

    if (itens.length === 0) {
        pizza.removeAttribute("aria-label");
        textoTotal.textContent = "";
        return;
    }

    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 200 200");
    svg.setAttribute("aria-hidden", "true");

    const fatias = [];
    let angulo = -Math.PI / 2;

    itens.forEach((item, indice) => {
        const fim = angulo + (item.valor / total) * Math.PI * 2;
        const fatia = criarFatia(item, indice, angulo, fim, total);

        fatias.push(fatia);
        svg.appendChild(fatia);

        angulo = fim;

        const cor = CORES_GRAFICO[indice % CORES_GRAFICO.length];
        const porcentagem = (item.valor / total * 100)
            .toLocaleString("pt-BR", { maximumFractionDigits: 1 });

        const linha = document.createElement("li");
        linha.style.setProperty("--cor", cor);

        const amostra = document.createElement("span");
        amostra.className = "legenda-cor";

        const nome = document.createElement("span");
        nome.className = "legenda-nome";
        nome.textContent = item.nome;

        const percentual = document.createElement("strong");
        percentual.className = "legenda-percentual";
        percentual.textContent = `${porcentagem}%`;

        const valor = document.createElement("span");
        valor.className = "legenda-valor";
        valor.textContent = moedaGrafico(item.valor);

        linha.append(amostra, nome, percentual, valor);

        linha.addEventListener("mouseenter", () =>
            fatia.classList.add("destaque")
        );
        linha.addEventListener("mouseleave", () =>
            fatia.classList.remove("destaque")
        );

        legenda.appendChild(linha);
    });

    pizza.appendChild(svg);

    pizza.setAttribute(
        "aria-label",
        "Gráfico de pizza dos gastos: " +
        itens.map(item =>
            `${item.nome} ${moedaGrafico(item.valor)}`
        ).join(", ")
    );

    textoTotal.textContent = `Total: ${moedaGrafico(total)}`;
}

function renderizarUltimasMovimentacoes(despesas, manutencoes) {
    const lista = document.getElementById("ultimas-movimentacoes");
    if (!lista) return;

    const veiculos = lerLista("garagem_veiculos");
    const nomeVeiculo = id => {
        const veiculo = veiculos.find(item => item.id === id);
        return veiculo ? `${veiculo.marca} ${veiculo.modelo}` : "Veículo removido";
    };

    const movimentacoes = [
        ...despesas.map(item => ({
            data: item.data,
            tipo: "Despesa",
            descricao: `${item.categoria || "Despesa"} · ${nomeVeiculo(item.veiculoId)}`,
            valor: Number(item.valor || 0)
        })),
        ...manutencoes.map(item => ({
            data: item.data,
            tipo: "Manutenção",
            descricao: `${item.tipo || "Serviço"} · ${nomeVeiculo(item.veiculoId)}`,
            valor: Number(item.valor || 0)
        }))
    ].filter(item => item.data)
     .sort((a, b) => b.data.localeCompare(a.data))
     .slice(0, 5);

    lista.innerHTML = "";

    if (movimentacoes.length === 0) {
        const vazio = document.createElement("li");
        vazio.textContent = "Nenhuma movimentação registrada.";
        lista.appendChild(vazio);
        return;
    }

    movimentacoes.forEach(item => {
        const linha = document.createElement("li");
        const data = item.data.split("-").reverse().join("/");
        const valor = item.valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
        linha.textContent = `${data} · ${item.tipo}: ${item.descricao} · ${valor}`;
        lista.appendChild(linha);
    });
}

const seletorGrafico = document.getElementById("grafico-agrupar");

if (seletorGrafico) {
    seletorGrafico.addEventListener("change", atualizarDashboard);
}

atualizarDashboard();
