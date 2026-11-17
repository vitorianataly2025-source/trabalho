
// ==========================================
// CONFIGURAÇÕES
// ==========================================

const CHAVE_EVENTOS = "agenda_escolar_eventos";
const CHAVE_PERFIL = "agenda_escolar_perfil";
const CHAVE_ACESSIBILIDADE = "agenda_escolar_acessibilidade";
const anoAtual = new Date().getFullYear();
const URL_CALENDARIO_SEDUC =`https://midiasstoragesec.blob.core.windows.net/001/2025/09/calendrio-escolar-${anoAtual}.pdf`;
let eventos = carregarEventos();


// ==========================================
// ARMAZENAMENTO
// ==========================================

function carregarEventos() {
    try {
        return JSON.parse(localStorage.getItem(CHAVE_EVENTOS)) || [];
    } catch {
        return [];
    }
}

function salvarEventos() {
    localStorage.setItem(CHAVE_EVENTOS, JSON.stringify(eventos));
}

function mostrarMensagem(mensagem) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = mensagem;
    toast.classList.add("show");

    setTimeout(function () {
        toast.classList.remove("show");
    }, 3000);
}


// ==========================================
// ACESSIBILIDADE
// ==========================================

function carregarAcessibilidade() {
    try {
        const dados = JSON.parse(localStorage.getItem(CHAVE_ACESSIBILIDADE));
        if (!dados) return;

        const conteudo = document.querySelector("main");

        if (conteudo) {
            conteudo.style.fontSize = dados.tamanhoFonte || "100%";
        }

        document.body.style.fontFamily = dados.fonte || "";

        document.body.classList.toggle("dark-mode", dados.escuro === true);
        document.body.classList.toggle("high-contrast", dados.contraste === true);

        const seletor = document.getElementById("change-font");
        if (seletor && dados.nomeFonte) {
            seletor.value = dados.nomeFonte;
        }

        atualizarBotoesAcessibilidade();
    } catch {
        localStorage.removeItem(CHAVE_ACESSIBILIDADE);
    }
}

function salvarAcessibilidade() {
    const conteudo = document.querySelector("main");
    const seletor = document.getElementById("change-font");

    const configuracao = {
        tamanhoFonte: conteudo ? conteudo.style.fontSize || "100%" : "100%",
        fonte: document.body.style.fontFamily,
        nomeFonte: seletor ? seletor.value : "default",
        escuro: document.body.classList.contains("dark-mode"),
        contraste: document.body.classList.contains("high-contrast")
    };

    localStorage.setItem(CHAVE_ACESSIBILIDADE, JSON.stringify(configuracao));
}

function alterarTamanhoFonte(valor) {
    const conteudo = document.querySelector("main");
    if (!conteudo) return;

    let tamanho = parseFloat(conteudo.style.fontSize || "100%");
    tamanho += valor;

    tamanho = Math.max(80, Math.min(150, tamanho));

    conteudo.style.fontSize = tamanho + "%";
    salvarAcessibilidade();
}

function restaurarFonte() {
    const conteudo = document.querySelector("main");
    if (conteudo) conteudo.style.fontSize = "100%";

    salvarAcessibilidade();
}

function alterarTipoFonte() {
    const seletor = document.getElementById("change-font");
    if (!seletor) return;

    document.body.style.fontFamily =
        seletor.value === "default" ? "" : seletor.value + ", sans-serif";

    salvarAcessibilidade();
}

function alternarModoEscuro() {
    document.body.classList.toggle("dark-mode");
    atualizarBotoesAcessibilidade();
    salvarAcessibilidade();
}

function alternarAltoContraste() {
    document.body.classList.toggle("high-contrast");
    atualizarBotoesAcessibilidade();
    salvarAcessibilidade();
}

function atualizarBotoesAcessibilidade() {
    const escuro = document.getElementById("dark-mode");
    const contraste = document.getElementById("high-contrast");

    if (escuro) {
        const ativo = document.body.classList.contains("dark-mode");
        escuro.textContent = ativo ? "☀" : "☾";
        escuro.setAttribute("aria-pressed", ativo);
        escuro.title = ativo ? "Ativar modo claro" : "Ativar modo escuro";
    }

    if (contraste) {
        const ativo = document.body.classList.contains("high-contrast");
        contraste.setAttribute("aria-pressed", ativo);
        contraste.textContent = ativo ? "Contraste: ligado" : "Contraste";
    }
}

function alternarMenuAcessibilidade() {
    const menu = document.getElementById("accessibility-menu");
    const botao = document.getElementById("accessibility-toggle");

    if (!menu || !botao) return;

    menu.hidden = !menu.hidden;
    botao.setAttribute("aria-expanded", !menu.hidden);
}

function lerConteudo() {
    pararLeitura();

    const principal = document.querySelector("main");

    if (!principal) return;

    const texto = principal.innerText;

    if (!texto.trim()) return;

    const leitura = new SpeechSynthesisUtterance(texto);

    leitura.lang = "pt-BR";
    leitura.rate = 0.9;
    leitura.pitch = 1;

    speechSynthesis.speak(leitura);
}

function pararLeitura() {
    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }
}

function iniciarAcessibilidade() {
    const toggle = document.getElementById("accessibility-toggle");

    if (toggle) toggle.addEventListener("click", alternarMenuAcessibilidade);

    const diminuir = document.getElementById("decrease-font");
    const aumentar = document.getElementById("increase-font");
    const restaurar = document.getElementById("reset-font");
    const fonte = document.getElementById("change-font");
    const escuro = document.getElementById("dark-mode");
    const contraste = document.getElementById("high-contrast");
    const ler = document.getElementById("read-events");
    const parar = document.getElementById("stop-reading");

    if (diminuir) diminuir.addEventListener("click", () => alterarTamanhoFonte(-10));
    if (aumentar) aumentar.addEventListener("click", () => alterarTamanhoFonte(10));
    if (restaurar) restaurar.addEventListener("click", restaurarFonte);
    if (fonte) fonte.addEventListener("change", alterarTipoFonte);
    if (escuro) escuro.addEventListener("click", alternarModoEscuro);
    if (contraste) contraste.addEventListener("click", alternarAltoContraste);
    if (ler) ler.addEventListener("click", lerConteudo);
    if (parar) parar.addEventListener("click", pararLeitura);

    carregarAcessibilidade();
}


// ==========================================
// PERFIL
// ==========================================

function carregarPerfil() {
    const campo = document.getElementById("profile-name");
    if (!campo) return;

    campo.value = localStorage.getItem(CHAVE_PERFIL) || "";
}

function salvarPerfil() {
    const campo = document.getElementById("profile-name");
    const mensagem = document.getElementById("profile-message");

    if (!campo) return;

    const nome = campo.value.trim();

    if (!nome) {
        if (mensagem) mensagem.textContent = "Digite seu nome antes de salvar.";
        return;
    }

    localStorage.setItem(CHAVE_PERFIL, nome);

    if (mensagem) mensagem.textContent = "Nome salvo com sucesso!";
}


// ==========================================
// FORMULÁRIO DE EVENTOS
// ==========================================

function abrirFormulario() {
    const dialogo = document.getElementById("event-dialog");
    const formulario = document.getElementById("event-form");

    if (!dialogo || !formulario) return;

    formulario.reset();
    document.getElementById("event-id").value = "";
    document.getElementById("dialog-title").textContent = "Novo evento";

    dialogo.showModal();
}

function fecharFormulario() {
    const dialogo = document.getElementById("event-dialog");
    if (dialogo) dialogo.close();
}

function salvarEvento(eventoFormulario) {
    eventoFormulario.preventDefault();

    const id = document.getElementById("event-id").value;

    const novoEvento = {
        id: id || String(Date.now()),
        titulo: document.getElementById("event-title").value.trim(),
        data: document.getElementById("event-date").value,
        horario: document.getElementById("event-time").value,
        categoria: document.getElementById("event-category").value,
        descricao: document.getElementById("event-description").value.trim()
    };

    if (!novoEvento.titulo || !novoEvento.data) {
        mostrarMensagem("Preencha o nome e a data do evento.");
        return;
    }

    if (id) {
        eventos = eventos.map(function (evento) {
            return evento.id === id ? novoEvento : evento;
        });

        mostrarMensagem("Evento atualizado!");
    } else {
        eventos.push(novoEvento);
        mostrarMensagem("Evento cadastrado!");
    }

    salvarEventos();
    atualizarAgenda();
    fecharFormulario();
}

function editarEvento(id) {
    const evento = eventos.find(item => item.id === id);
    if (!evento) return;

    document.getElementById("event-id").value = evento.id;
    document.getElementById("event-title").value = evento.titulo;
    document.getElementById("event-date").value = evento.data;
    document.getElementById("event-time").value = evento.horario;
    document.getElementById("event-category").value = evento.categoria;
    document.getElementById("event-description").value = evento.descricao;

    document.getElementById("dialog-title").textContent = "Editar evento";
    document.getElementById("event-dialog").showModal();
}

function excluirEvento(id) {
    if (!confirm("Deseja realmente excluir este evento?")) return;

    eventos = eventos.filter(evento => evento.id !== id);

    salvarEventos();
    atualizarAgenda();
    mostrarMensagem("Evento excluído.");
}


// ==========================================
// EXIBIÇÃO DOS EVENTOS
// ==========================================

function formatarData(data) {
    const partes = data.split("-");
    return partes[2] + "/" + partes[1] + "/" + partes[0];
}

function criarCartaoEvento(evento) {
    const cartao = document.createElement("article");
    cartao.className = "event-card";

    const titulo = document.createElement("h3");
    titulo.textContent = evento.titulo;

    const categoria = document.createElement("span");
    categoria.className = "event-category";
    categoria.textContent = evento.categoria;

    const data = document.createElement("p");
    data.textContent = "Data: " + formatarData(evento.data);

    const horario = document.createElement("p");
    horario.textContent = evento.horario
        ? "Horário: " + evento.horario
        : "Horário não informado";

    const descricao = document.createElement("p");
    descricao.textContent = evento.descricao || "Sem descrição.";

    const botoes = document.createElement("div");
    botoes.className = "event-actions";

    const editar = document.createElement("button");
    editar.type = "button";
    editar.textContent = "Editar";
    editar.addEventListener("click", () => editarEvento(evento.id));

    const excluir = document.createElement("button");
    excluir.type = "button";
    excluir.textContent = "Excluir";
    excluir.addEventListener("click", () => excluirEvento(evento.id));

    botoes.append(editar, excluir);
    cartao.append(titulo, categoria, data, horario, descricao, botoes);

    return cartao;
}

function exibirEventos(lista) {
    const area = document.getElementById("event-list");
    if (!area) return;

    area.innerHTML = "";

    if (lista.length === 0) {
        const mensagem = document.createElement("p");
        mensagem.className = "empty-message";
        mensagem.textContent = "Nenhum evento encontrado.";
        area.appendChild(mensagem);
        return;
    }

    const eventosOrdenados = [...lista].sort((a, b) =>
        a.data.localeCompare(b.data)
    );

    eventosOrdenados.forEach(function (evento) {
        area.appendChild(criarCartaoEvento(evento));
    });
}


// ==========================================
// PESQUISA E FILTROS
// ==========================================

function filtrarEventos() {
    const busca = document.getElementById("search-events");
    const filtro = document.getElementById("filter-category");

    if (!busca || !filtro) return;

    const pesquisa = busca.value.toLowerCase();
    const categoria = filtro.value;

    const filtrados = eventos.filter(function (evento) {
        const nomeCombina = evento.titulo.toLowerCase().includes(pesquisa);
        const categoriaCombina =
            categoria === "todos" || evento.categoria === categoria;

        return nomeCombina && categoriaCombina;
    });

    exibirEventos(filtrados);
}


// ==========================================
// RESUMO DA AGENDA
// ==========================================

function atualizarResumo() {
    const total = document.getElementById("total-events");
    const proximos = document.getElementById("upcoming-events");
    const mes = document.getElementById("month-events");

    if (!total || !proximos || !mes) return;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const inicioProximoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1);

    const futuros = eventos.filter(function (evento) {
        return new Date(evento.data + "T00:00:00") >= hoje;
    });

    const desteMes = eventos.filter(function (evento) {
        const data = new Date(evento.data + "T00:00:00");
        return data >= inicioMes && data < inicioProximoMes;
    });

    total.textContent = eventos.length;
    proximos.textContent = futuros.length;
    mes.textContent = desteMes.length;
}

function atualizarAgenda() {
    filtrarEventos();
    atualizarResumo();
}

// =========================================
// VISUALIZADOR DO CALENDÁRIO SEDUC
// =========================================

function abrirCalendarioSeduc() {

    const inicio = document.getElementById("inicio");
    const areaSeduc = document.getElementById("area-seduc");
    const visualizador = document.getElementById("visualizador-seduc");

    if (!inicio || !areaSeduc || !visualizador) return;

    visualizador.src = URL_CALENDARIO_SEDUC;

    inicio.hidden = true;
    areaSeduc.hidden = false;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}

function voltarInicio() {

    const inicio = document.getElementById("inicio");
    const areaSeduc = document.getElementById("area-seduc");

    if (!inicio || !areaSeduc) return;

    areaSeduc.hidden = true;
    inicio.hidden = false;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}

// ==========================================
// INICIALIZAÇÃO DA AGENDA
// ==========================================

function iniciarAgenda() {
    const salvar = document.getElementById("save-profile");
    const novo = document.getElementById("new-event");
    const formulario = document.getElementById("event-form");
    const fechar = document.getElementById("close-dialog");
    const cancelar = document.getElementById("cancel-dialog");
    const busca = document.getElementById("search-events");
    const filtro = document.getElementById("filter-category");

    if (salvar) salvar.addEventListener("click", salvarPerfil);
    if (novo) novo.addEventListener("click", abrirFormulario);
    if (formulario) formulario.addEventListener("submit", salvarEvento);
    if (fechar) fechar.addEventListener("click", fecharFormulario);
    if (cancelar) cancelar.addEventListener("click", fecharFormulario);
    if (busca) busca.addEventListener("input", filtrarEventos);
    if (filtro) filtro.addEventListener("change", filtrarEventos);

    carregarPerfil();
    atualizarAgenda();
}




// ==========================================
// INÍCIO DO SISTEMA
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    document.getElementById("seduc-link")
        ?.addEventListener("click", abrirCalendarioSeduc);

    document.getElementById("voltar-inicio")
        ?.addEventListener("click", voltarInicio);

    iniciarAcessibilidade();
    iniciarAgenda();

});