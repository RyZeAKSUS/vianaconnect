// Arranque da app e navegacao entre ecras (dono: A)
document.querySelectorAll("[data-ir]").forEach((botao) => {
  botao.addEventListener("click", () => mostrarEcra(botao.dataset.ir));
});

atualizarSementes();

// O formulario desenha-se dentro de <div id="formulario"> (ver index.html)
iniciarFormulario("#formulario");

// Nota: fetch("data/catalogo.json") so funciona com servidor (local ou Pages),
// nao ao abrir o index.html diretamente do disco.
