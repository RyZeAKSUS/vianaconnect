// Funcoes que desenham os ecras

// Mostra um ecra e esconde os outros
function mostrarEcra(id) {
  document.querySelectorAll(".ecra").forEach((e) => e.classList.add("oculto"));
  document.getElementById(id).classList.remove("oculto");  
  window.scrollTo(0, 0);

}

function atualizarSementes() {
  document.getElementById("sementes").textContent = estado.sementes + " Sementes";
}

// TODO: desenharFormulario(), desenharResultado(), desenharProgresso()
