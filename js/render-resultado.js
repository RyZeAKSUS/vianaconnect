// Ecra do resultado (dono: B)
(function () {

  // Perfil por defeito enquanto o formulario (A) nao guarda o verdadeiro
  const PERFIL_EXEMPLO = {
    pais: "França",
    ligacao: "família",
    situacao: "remoto",
    interesses: { mar: 5, natureza: 4, desporto: 3, cultura: 2, tradicao: 2, gastronomia: 4, social: 3, tranquilidade: 4 },
    hobbies: ["surf", "fotografia"],
    travoes: ["conhecer-ninguem", "casa"],
  };

  // Usada se data/semana-tipo.json (D) ainda nao existir
  const SEMANA_TIPO_DEFEITO = [
    { dia: "segunda", momento: "manhã", categoria: "natureza" },
    { dia: "terça", momento: "tarde", categoria: "desporto" },
    { dia: "quarta", momento: "noite", categoria: "gastronomia" },
    { dia: "quinta", momento: "tarde", categoria: "comunidade" },
    { dia: "sábado", momento: "manhã", categoria: "cultura" },
  ];

  const TOP_N = 5;
  let dadosResultado = null;           // cache: os JSON so se pedem uma vez
  const jaExperimentados = new Set();  // evita ganhar sementes repetidas na mesma sessao
  const jaLidos = new Set();
  const jaContactados = new Set();

  // Um ficheiro em falta nao pode partir o ecra: devolve o valor por defeito
  async function carregarJSON(url, defeito) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(r.status);
      return await r.json();
    } catch (e) {
      return defeito;
    }
  }

  async function carregarDadosResultado() {
    if (!dadosResultado) {
      const [catalogo, travoes, semana] = await Promise.all([
        carregarJSON("data/catalogo.json", []),
        carregarJSON("data/travoes.json", []),
        carregarJSON("data/semana-tipo.json", SEMANA_TIPO_DEFEITO),
      ]);
      dadosResultado = { catalogo, travoes, semana };
    }
    return dadosResultado;
  }

  // Passa o id do item como ref: sem ele cada acao so contaria uma vez no total
  function dar(acao, ref) {
    if (typeof ganharSementes === "function") ganharSementes(acao, ref);
  }

  // Cria elementos com textContent, nunca innerHTML
  function el(tag, texto, classe) {
    const e = document.createElement(tag);
    if (texto) e.textContent = texto;
    if (classe) e.className = classe;
    return e;
  }

  function fraseIndice(indice) {
    if (indice >= 75) return "Viana parece feita à tua medida.";
    if (indice >= 50) return "Há muito do teu dia a dia que já cabe aqui.";
    if (indice > 0) return "Há pontos de partida, e o resto constrói-se com pessoas.";
    return "Ainda não temos dados suficientes para te conhecer.";
  }

  // Cada slot recebe o melhor item da sua categoria que ainda nao foi usado
  function montarSemana(slots, ranking) {
    const usados = new Set();
    return (slots || []).map((slot) => {
      const escolhido = ranking.find((r) => r.item.categoria === slot.categoria && !usados.has(r.item.id));
      if (escolhido) usados.add(escolhido.item.id);
      return { slot, item: escolhido ? escolhido.item : null };
    }).filter((s) => s.item);
  }

  function desenharIndice(indice) {
    const bloco = el("div", null, "indice");
    bloco.append(el("p", indice + "/100", "indice-valor"), el("p", fraseIndice(indice)));
    return bloco;
  }

  function desenharCartao(r, perfil) {
    const { item } = r;
    const cartao = el("article", null, "cartao");
    cartao.append(
      el("h4", item.titulo),
      el("p", item.descricao),
      el("p", explicarMatch(perfil, item), "porque-combina"),
      el("p", "Porque cria relações duradouras: " + item.porqueRelacoes, "porque-relacoes")
    );

    const guardar = el("button", estado.guardados.includes(item.id) ? "Guardado" : "Guardar");
    guardar.disabled = estado.guardados.includes(item.id);
    guardar.addEventListener("click", () => {
      if (estado.guardados.includes(item.id)) return;
      estado.guardados.push(item.id);
      guardarEstado(estado);
      dar("guardar", item.id);
      guardar.textContent = "Guardado";
      guardar.disabled = true;
    });

    const experimentar = el("button", "Quero experimentar");
    experimentar.addEventListener("click", () => {
      if (jaExperimentados.has(item.id)) return;
      jaExperimentados.add(item.id);
      dar("experimentar", item.id);
      experimentar.textContent = "Boa! Anotado";
      experimentar.disabled = true;
    });

    // Gancho humano: o resultado so cria raizes se levar a uma pessoa real
    const contacto = el("button", "Falar com alguém de cá");
    contacto.addEventListener("click", () => {
      if (jaContactados.has(item.id)) return;
      jaContactados.add(item.id);
      dar("experimentar", "contacto-" + item.id);
      contacto.textContent = "Pedido enviado. Respondem em breve.";
      contacto.disabled = true;
    });

    cartao.append(guardar, experimentar, contacto);
    return cartao;
  }

  function desenharTravoes(travoes, ids) {
    const seccao = el("section");
    seccao.append(el("h3", "O que te trava, e o que há a dizer sobre isso"));
    const lista = travoes.filter((t) => ids.includes(t.id));
    if (!lista.length) {
      seccao.append(el("p", "Não indicaste receios. Se surgirem, estamos cá para responder."));
      return seccao;
    }
    for (const t of lista) {
      const d = el("details");
      d.append(el("summary", t.medo), el("p", t.resposta));
      // Ler a resposta conta uma vez por travao
      d.addEventListener("toggle", () => {
        if (d.open && !jaLidos.has(t.id)) {
          jaLidos.add(t.id);
          dar("travao", t.id);
        }
      });
      seccao.append(d);
    }
    return seccao;
  }

  function desenharSemana(semana) {
    const seccao = el("section");
    seccao.append(el("h3", "Uma semana tipo em Viana"));
    if (!semana.length) {
      seccao.append(el("p", "Ainda não há itens suficientes para montar a tua semana."));
      return seccao;
    }
    const lista = el("ul", null, "semana");
    for (const { slot, item } of semana) {
      lista.append(el("li", slot.dia + " (" + slot.momento + "): " + item.titulo));
    }
    seccao.append(lista);
    return seccao;
  }

  async function desenharResultado() {
    const alvo = document.getElementById("resultado-conteudo");
    if (!alvo) return;

    const perfil = estado.perfil || PERFIL_EXEMPLO;
    const { catalogo, travoes, semana } = await carregarDadosResultado();
    const ranking = rankear(perfil, catalogo);

    alvo.replaceChildren(desenharIndice(calcularIndice(perfil, catalogo)));

    const top = el("section");
    top.append(el("h3", "O que mais combina contigo"));
    if (!ranking.length) top.append(el("p", "O catálogo está vazio de momento."));
    ranking.slice(0, TOP_N).forEach((r) => top.append(desenharCartao(r, perfil)));

    alvo.append(top, desenharTravoes(travoes, perfil.travoes || []), desenharSemana(montarSemana(semana, ranking)));
  }

  // Exposto para o fluxo do formulario (mostrarEcra + desenharResultado)
  window.desenharResultado = desenharResultado;

  // Redesenha quando o perfil muda (evento do formulario)
  document.addEventListener("vianaconnect:perfilAtualizado", () => desenharResultado());

  // Sem formulario (A) o ecra mostra o perfil de exemplo logo ao abrir
  desenharResultado();
})();
