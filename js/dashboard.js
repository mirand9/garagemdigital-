
function atualizarDashboard() {

    const veiculos = JSON.parse(
        localStorage.getItem("garagem_veiculos") || "[]"
    );

    document.getElementById("total-veiculos").textContent =
        veiculos.length;

    // Os outros indicadores serão conectados
    // quando desenvolvermos despesas e manutenções.

    const despesas = JSON.parse(
        localStorage.getItem("garagem_despesas") || "[]"
    );

    const manutencoes = JSON.parse(
        localStorage.getItem("garagem_manutencoes") || "[]"
    );

    const agora = new Date();

    const gastosMes = despesas
        .filter(item => {
            const data = new Date(item.data + "T12:00:00");

            return (
                data.getMonth() === agora.getMonth() &&
                data.getFullYear() === agora.getFullYear()
            );
        })
        .reduce((total, item) => total + Number(item.valor || 0), 0);

    const totalInvestido = despesas.reduce(
        (total, item) => total + Number(item.valor || 0), 0
    );

    const moeda = valor => valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    document.getElementById("gastos-mes").textContent =
        moeda(gastosMes);

    document.getElementById("total-investido").textContent =
        moeda(totalInvestido);

    document.getElementById("total-manutencoes").textContent =
        manutencoes.length;
}

document.addEventListener("DOMContentLoaded", atualizarDashboard);
