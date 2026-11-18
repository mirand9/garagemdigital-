function renderizarEstatisticas(despesas, manutencoes) { 
    console.log("Estatisticas:", despesas.length, "despesas e", manutencoes.length, "manutenções");
}

renderizarEstatisticas(
    lerLista("garagem_despesas"),
    lerLista("garagem_manutencoes") 
);