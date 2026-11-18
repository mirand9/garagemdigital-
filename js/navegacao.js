

const PAGINA_PADRAO = "inicio";

const paginas = Array.from(document.querySelectorAll("main > section"));
const linksMenu = Array.from(document.querySelectorAll(".menu-list a"));

function paginaDaUrl() {
    return window.location.hash.slice(1);
}

function mostrarPagina(id) {
    if (!paginas.some(pagina => pagina.id === id)) {
        id = PAGINA_PADRAO;
    }

    paginas.forEach(pagina => {
        pagina.hidden = pagina.id !== id;
    });

    linksMenu.forEach(link => {
        const ativo = link.getAttribute("href") === `#${id}`;

        link.classList.toggle("active", ativo);

        if (ativo) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });

    window.scrollTo(0, 0);
}

window.addEventListener("hashchange", () => {
    mostrarPagina(paginaDaUrl());
});


document.getElementById("adicionar-veiculo")
    .addEventListener("click", () => {
        if (paginaDaUrl() !== "garagem") {
            window.location.hash = "#garagem";
        }
    });

mostrarPagina(paginaDaUrl());
