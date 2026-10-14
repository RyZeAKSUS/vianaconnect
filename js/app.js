// Arranque da app e navegacao entre ecras
document.querySelectorAll("[data-ir]").forEach((botao) => {
  botao.addEventListener("click", () => mostrarEcra(botao.dataset.ir));
});

atualizarSementes();

// Nota: fetch("data/catalogo.json") so funciona com servidor (local ou Pages),
// nao ao abrir o index.html diretamente do disco.
