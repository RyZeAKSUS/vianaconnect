/* pontos.js — Sementes, níveis, desbloqueios e streak diária (papel C)
 *
 * Script normal (sem import/export): expõe window.Pontos.
 * Guarda tudo em localStorage na chave "vianaconnect.progresso", por isso
 * não depende do state.js dos outros. Emite o evento "pontos:mudou" no
 * document sempre que algo muda.
 *
 * API que os outros chamam:
 *   Pontos.adicionar('perfil_completo')          // A, ao concluir o formulário
 *   Pontos.adicionar('ver_resultado')            // B, ao mostrar o resultado
 *   Pontos.adicionar('ler_travao', 'travao-3')   // B, ao abrir uma resposta (ref = id)
 *   Pontos.adicionar('guardar_item', 'item-12')  // B, ao guardar um item do top 5
 *   Pontos.adicionar('pedir_contacto')           // B, no botão "falar com alguém de Viana"
 *   Pontos.registarVisita()                      // app.js, 1x no arranque
 */
(function () {
  'use strict';

  var CHAVE = 'vianaconnect.progresso';

  // Cada ação só dá Sementes uma vez por (ação + ref). Evita fazer farming a clicar.
  var ACOES = {
    perfil_completo: { sementes: 100, texto: 'Perfil concluído' },
    ver_resultado:   { sementes: 20,  texto: 'Viste o teu resultado' },
    ler_travao:      { sementes: 10,  texto: 'Leste uma resposta a um receio' },
    guardar_item:    { sementes: 10,  texto: 'Guardaste uma sugestão' },
    pedir_contacto:  { sementes: 50,  texto: 'Pediste contacto com alguém de Viana' }
  };

  // Valores por defeito. Se data/niveis.json tiver este formato, substitui-os.
  // Formatos aceites no JSON: "sementes" OU "minimo" para o limiar; "nome" (ou "titulo");
  // "desbloqueia" (ou "desbloqueio"/"descricao"); "chave" opcional (ver temAcesso).
  // Aceita um array ou um objeto { "niveis": [...] }.
  var NIVEIS_DEFAULT = [
    { nivel: 1, nome: 'Semente', sementes: 0,   desbloqueia: 'Guia dos primeiros 30 dias',      chave: 'guia_30_dias' },
    { nivel: 2, nome: 'Rebento', sementes: 100, desbloqueia: 'Semana tipo completa',            chave: 'semana_completa' },
    { nivel: 3, nome: 'Arbusto', sementes: 250, desbloqueia: 'Clubes e associações da cidade',  chave: 'clubes' },
    { nivel: 4, nome: 'Árvore',  sementes: 450, desbloqueia: 'Contacto com um residente',       chave: 'contacto_residente' },
    { nivel: 5, nome: 'Floresta', sementes: 700, desbloqueia: 'Convite para um evento local',   chave: 'evento_local' }
  ];

  // Nível mínimo de cada funcionalidade, usado quando o JSON não traz "chave".
  var NIVEL_DA_CHAVE = {
    guia_30_dias: 1, semana_completa: 2, clubes: 3, contacto_residente: 4, evento_local: 5
  };

  var niveis = NIVEIS_DEFAULT.slice();

  function novoEstado() {
    return { sementes: 0, feitas: {}, historico: [], streak: 0, melhorStreak: 0, ultimoDia: null };
  }

  function ler() {
    try {
      var bruto = localStorage.getItem(CHAVE);
      if (!bruto) return novoEstado();
      return Object.assign(novoEstado(), JSON.parse(bruto));
    } catch (e) {
      return novoEstado();
    }
  }

  var estado = ler();

  function guardar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (e) { /* modo privado */ }
  }

  function hojeISO(d) {
    d = d || new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var dia = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + dia; // data local, não UTC
  }

  function diasEntre(a, b) { // a e b em "YYYY-MM-DD"
    var pa = a.split('-'), pb = b.split('-');
    var da = Date.UTC(+pa[0], +pa[1] - 1, +pa[2]);
    var db = Date.UTC(+pb[0], +pb[1] - 1, +pb[2]);
    return Math.round((db - da) / 86400000);
  }

  function nivelPara(sementes) {
    var atual = niveis[0];
    for (var i = 0; i < niveis.length; i++) {
      if (sementes >= niveis[i].sementes) atual = niveis[i];
    }
    return atual;
  }

  function avisar(detalhe) {
    document.dispatchEvent(new CustomEvent('pontos:mudou', { detail: detalhe }));
  }

  // Dá Sementes e trata de subida de nível. Devolve { ganhou, subiuNivel, nivel }.
  function dar(quantidade, texto) {
    var antes = nivelPara(estado.sementes).nivel;
    estado.sementes += quantidade;
    estado.historico.unshift({ texto: texto, sementes: quantidade, quando: Date.now() });
    estado.historico = estado.historico.slice(0, 20);
    var depois = nivelPara(estado.sementes);
    guardar();
    var res = { ganhou: quantidade, subiuNivel: depois.nivel > antes, nivel: depois };
    avisar(res);
    return res;
  }

  var Pontos = {
    ACOES: ACOES,

    /** Tenta carregar data/niveis.json; se falhar ou vier noutro formato, usa os defaults. */
    init: function (url) {
      return fetch(url || 'data/niveis.json')
        .then(function (r) { return r.json(); })
        .then(function (bruto) {
          // Aceita [ ... ] ou { "niveis": [ ... ] }, e "sementes" ou "minimo" como limite.
          var lista = Array.isArray(bruto) ? bruto : ((bruto && (bruto.niveis || bruto.levels)) || []);
          var normalizados = lista.map(function (n, i) {
            var min = n.sementes != null ? n.sementes : n.minimo;
            return {
              nivel: i + 1,
              nome: n.nome || n.titulo || n.name || ('Nível ' + (i + 1)),
              sementes: min,
              desbloqueia: n.desbloqueia || n.desbloqueio || n.descricao || ''
            };
          }).filter(function (n) { return typeof n.sementes === 'number'; });

          if (normalizados.length > 0) {
            normalizados.sort(function (a, b) { return a.sementes - b.sementes; });
            normalizados.forEach(function (n, i) { n.nivel = i + 1; }); // numera pela ordem
            niveis = normalizados;
          }
        })
        .catch(function () { /* mantém defaults */ })
        .then(function () { avisar({ ganhou: 0, subiuNivel: false, nivel: nivelPara(estado.sementes) }); });
    },

    /** Dá Sementes por uma ação (uma vez por ação+ref). Devolve null se já tinha sido feita. */
    adicionar: function (acao, ref) {
      var def = ACOES[acao];
      if (!def) { console.warn('[Pontos] ação desconhecida:', acao); return null; }
      var chave = acao + ':' + (ref == null ? '' : ref);
      if (estado.feitas[chave]) return null;
      estado.feitas[chave] = true;
      return dar(def.sementes, def.texto);
    },

    /** Regista a visita de hoje e atualiza a streak. Passar uma data "YYYY-MM-DD" serve para testar. */
    registarVisita: function (diaISO) {
      var hoje = diaISO || hojeISO();
      if (estado.ultimoDia === hoje) return null; // já contou hoje

      if (estado.ultimoDia && diasEntre(estado.ultimoDia, hoje) === 1) estado.streak += 1;
      else estado.streak = 1;

      estado.ultimoDia = hoje;
      estado.melhorStreak = Math.max(estado.melhorStreak, estado.streak);

      var bonus = 10 + 5 * Math.min(estado.streak, 5); // 15, 20, 25, 30, 35, depois fixo
      return dar(bonus, 'Visita diária (dia ' + estado.streak + ' seguido)');
    },

    estado: function () { return estado; },
    niveis: function () { return niveis.slice(); },
    nivelAtual: function () { return nivelPara(estado.sementes); },

    proximoNivel: function () {
      var atual = nivelPara(estado.sementes);
      return niveis.find(function (n) { return n.sementes > atual.sementes; }) || null;
    },

    /** 0 a 1: quanto falta para o próximo nível (1 se já está no máximo). */
    progressoNivel: function () {
      var atual = nivelPara(estado.sementes), prox = Pontos.proximoNivel();
      if (!prox) return 1;
      return (estado.sementes - atual.sementes) / (prox.sementes - atual.sementes);
    },

    /** Lista de níveis com a flag "desbloqueado", para desenhar os desbloqueios. */
    desbloqueios: function () {
      return niveis.map(function (n) {
        return { nivel: n.nivel, nome: n.nome, sementes: n.sementes, texto: n.desbloqueia, desbloqueado: estado.sementes >= n.sementes };
      });
    },

    /** Nível mínimo de cada recurso bloqueado (liga aos desbloqueios do ecrã de progresso). */
    RECURSOS: { semana_completa: 2, clubes: 3, contacto_residente: 4, evento_local: 5 },

    /** true se a pessoa já tem o nível necessário. Aceita o nome do recurso ou um número de nível. */
    podeUsar: function (recurso) {
      var min = typeof recurso === 'number' ? recurso : Pontos.RECURSOS[recurso];
      if (min == null) return true;
      return nivelPara(estado.sementes).nivel >= min;
    },

    reset: function () {
      estado = novoEstado();
      guardar();
      avisar({ ganhou: 0, subiuNivel: false, nivel: nivelPara(0) });
    }
  };

  window.Pontos = Pontos;
})();

/* ---------- Ações combinadas com o grupo ----------
 * Traduz os nomes de ação usados pelos colegas para os do Pontos,
 * para ninguém ter de mudar o código. Uso: ganharSementes('formulario')
 */
const MAPA_ACOES = {
  formulario: "perfil_completo", afinacao: "ver_resultado",
  guardar: "guardar_item", experimentar: "pedir_contacto",
  travao: "ler_travao", primeiroPasso: "ver_resultado", streak: "ver_resultado",
};
window.ganharSementes = function (acao, ref) {
  return Pontos.adicionar(MAPA_ACOES[acao] || acao, ref);
};

/* ---------- Desbloqueios reais ----------
 * Qualquer elemento com data-requer="semana_completa" (ou data-requer-nivel="2")
 * fica bloqueado até a pessoa chegar ao nível necessário. Um clique num elemento
 * bloqueado é travado e mostra uma mensagem. Reaplica-se sozinho quando as Sementes
 * mudam e quando aparecem elementos novos no ecrã.
 */
(function () {
  function nivelNecessario(el) {
    var v = el.getAttribute('data-requer-nivel');
    if (v) return parseInt(v, 10);
    var r = el.getAttribute('data-requer');
    return r ? Pontos.RECURSOS[r] : null;
  }

  function aplicar() {
    document.querySelectorAll('[data-requer],[data-requer-nivel]').forEach(function (el) {
      var min = nivelNecessario(el);
      var bloqueado = min != null && !Pontos.podeUsar(min);
      el.classList.toggle('bloqueado-nivel', bloqueado);
      if (bloqueado) {
        el.setAttribute('aria-disabled', 'true');
        el.dataset.msg = 'Desbloqueia no nível ' + min;
        el.title = el.dataset.msg;
      } else {
        el.removeAttribute('aria-disabled');
        el.removeAttribute('title');
        delete el.dataset.msg;
      }
    });
  }

  function aviso(texto) {
    var t = document.getElementById('toast-nivel');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast-nivel';
      t.setAttribute('role', 'status');
      document.body.appendChild(t);
    }
    t.textContent = texto;
    t.classList.add('visivel');
    clearTimeout(t._h);
    t._h = setTimeout(function () { t.classList.remove('visivel'); }, 2500);
  }

  // Fase de captura: trava o clique antes de chegar aos botões dos colegas
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('.bloqueado-nivel');
    if (!el) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    aviso(el.dataset.msg || 'Ainda bloqueado');
  }, true);

  document.addEventListener('pontos:mudou', aplicar);
  new MutationObserver(aplicar).observe(document.body, { childList: true, subtree: true });
  aplicar();
})();