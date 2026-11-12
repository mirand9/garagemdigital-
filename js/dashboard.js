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

atualizarDashboard();
