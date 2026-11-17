/* Jogos Enzola — configurações, senha e recuperação, instalar app, recorte de imagem, PDF da lista de desejos */

/* ---------- preferências do aparelho (tema, animações) ---------- */
const themePref = () => { try { return localStorage.getItem("theme") || "dark" } catch (e) { return "dark" } };
const sysLight = () => matchMedia("(prefers-color-scheme: light)").matches;
function applyLocalPrefs() {
  const t = themePref(), light = t === "light" || (t === "auto" && sysLight());
  if (light) document.documentElement.dataset.theme = "light"; else delete document.documentElement.dataset.theme;
  document.documentElement.classList.toggle("calm", !!lsGet("pref-calm"));
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = light ? "#EDF0F8" : "#0B1129";
  const b = $("#theme-btn"); if (b) b.innerHTML = `${ic(light ? "moon" : "sun")}<span>${light ? "Usar tema escuro" : "Usar tema claro"}</span>`;
}
function setTheme(t) { try { localStorage.setItem("theme", t) } catch (e) { } applyLocalPrefs(); if (tab === "config") renderConfig() }
const curTheme = () => document.documentElement.dataset.theme === "light" ? "light" : "dark";
matchMedia("(prefers-color-scheme: light)").addEventListener?.("change", () => { if (themePref() === "auto") applyLocalPrefs() });

/* ---------- configurações ---------- */
async function saveSettings(patch) {
  const settings = { ...((profile && profile.settings) || {}), ...patch };
  if (!caps.v3) { profile.settings = settings; render(); toast("Salvo só neste aparelho. Rode a migracao.sql para guardar na conta."); return }
  if (await saveProfile({ settings })) toast("Configuração salva.");
}
const sw = (attr, on, label) => `<label class="sw"><input type="checkbox" ${attr}${on ? " checked" : ""} aria-label="${esc(label)}"><span></span></label>`;
const row = (t, d, ctrl, id = "") => `<div class="cfg-row"${id ? ` id="${id}"` : ""}><div class="cfg-t"><b>${t}</b>${d ? `<span>${d}</span>` : ""}</div><div class="cfg-c">${ctrl}</div></div>`;
function renderConfig() {
  const el = $("#config"); if (!el || tab !== "config") return;
  if (!loaded) { el.innerHTML = `<div class="sk" style="height:400px;border-radius:20px"></div>`; return }
  const p = profile || {}, t = themePref(), v3 = caps.v3;
  const standaloneNow = standalone();
  const keep = ["pw-cur", "pw-new", "pw-new2", "em-new"].map(id => [id, $("#" + id) ? $("#" + id).value : ""]), act = document.activeElement && document.activeElement.id;
  el.innerHTML = `<div class="sec-head"><div><h2 class="h">Configurações</h2><p class="muted">Conta, aparência, privacidade e dados.</p></div></div>
  <div class="cfg">
    <nav class="cfg-nav" aria-label="Seções das configurações">${[["conta", "user", "Conta e segurança"], ["convite", "userplus", "Convidar amigos"], ["aparencia", "sun", "Aparência"], ["privacidade", "shield", "Privacidade"], ["notificacoes", "bell", "Notificações"], ["precos", "tag", "Preços e lojas"], ["dados", "file", "Seus dados"], ["app", "phone", "App"]].map(([id, i, l]) => `<a href="#config" data-cfg-jump="${id}">${ic(i)}${l}</a>`).join("")}</nav>
    <div class="cfg-body">
    <section class="panel cfg-sec" id="cfg-conta"><h3>${ic("user")}Conta e segurança</h3>
      ${row("Seu usuário", "Seus amigos podem te achar pelo usuário ou pelo ID.", `<span class="idtag big">@${esc(uname())}${p.tag ? " #" + esc(p.tag) : ""}</span>${p.tag ? `<button class="btn ghost sm" data-act="copy-id">Copiar</button>` : ""}`)}
      <form class="cfg-pw" id="em-form" novalidate><b>E-mail da conta</b>
        ${isLegacy() ? `<p class="cfg-warn">${ic("shield")}<span>Sua conta foi criada só com usuário e ainda não tem e-mail. Cadastre um para entrar com ele e conseguir recuperar a senha se esquecer.</span></p>` : `<span class="hint">Atual: <b>${esc(user.email)}</b>${user.new_email ? ` · aguardando confirmação de <b>${esc(user.new_email)}</b>` : ""}</span>`}
        <div class="f2"><label>${isLegacy() ? "Seu e-mail" : "Novo e-mail"}<span class="inp">${ic("mail")}<input type="email" id="em-new" autocomplete="email" autocapitalize="none" spellcheck="false" placeholder="voce@email.com"></span></label><span></span></div>
        <div><button class="btn${isLegacy() ? "" : " ghost"}" id="em-save">Salvar e-mail</button></div></form>
      <form class="cfg-pw" id="pw-form" autocomplete="on"><b>Alterar senha</b>
        <input type="text" autocomplete="username" value="${esc(user.email)}" hidden>
        <div class="f2"><label>Senha atual<span class="inp">${ic("lock")}<input type="password" id="pw-cur" autocomplete="current-password"></span></label><span></span></div>
        <div class="f2"><label>Nova senha<span class="inp">${ic("key")}<input type="password" id="pw-new" autocomplete="new-password" minlength="6"></span><span class="pwmeter" id="pw-meter"><i></i></span><span class="hint" id="pw-hint">Use 8 ou mais caracteres, misturando letras e números.</span></label>
          <label>Repita a nova senha<span class="inp">${ic("key")}<input type="password" id="pw-new2" autocomplete="new-password"></span></label></div>
        <div><button class="btn" id="pw-save">Salvar nova senha</button></div></form>
      ${row("Sair de todos os aparelhos", "Encerra a sessão no celular, no computador e onde mais você tiver entrado.", `<button class="btn ghost sm" data-cfg-act="logout-all">${ic("logout")}Sair de todos</button>`)}
      ${FN() ? row("Excluir conta", "Apaga para sempre sua biblioteca, amigos, mensagens e o seu usuário.", `<button class="btn danger sm" data-cfg-act="delete">${ic("trash")}Excluir minha conta</button>`) : ""}
    </section>
    <section class="panel cfg-sec" id="cfg-convite"><h3>${ic("userplus")}Convidar amigos</h3>
      <p class="hint" style="margin:0 0 10px">Mande este link para quem você quer por aqui. Quando a pessoa criar a conta (ou entrar), ela já envia um pedido de amizade para você.</p>
      <span class="bar" style="margin:0"><input type="text" readonly value="${esc(inviteUrl(uname()))}" class="grow" id="inv-link" aria-label="Link de convite"><button class="btn sm" data-cfg-act="inv-copy">${ic("file")}Copiar link</button></span>
      <div class="inv-acts"><button class="btn ghost sm" data-cfg-act="inv-share">${ic("share")}Compartilhar</button><a class="btn ghost sm" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent("Vem pro Jogos Enzola! Monte seu catálogo de jogos e me adicione como amigo: " + inviteUrl(uname()))}">WhatsApp</a></div>
    </section>
    <section class="panel cfg-sec" id="cfg-aparencia"><h3>${ic("sun")}Aparência</h3>
      ${row("Tema", "“Automático” segue o tema do seu celular ou computador.", `<div class="seg sm" role="radiogroup">${[["auto", "Automático"], ["light", "Claro"], ["dark", "Escuro"]].map(([v, l]) => `<button role="radio" aria-checked="${t === v}" data-cfg-theme="${v}">${l}</button>`).join("")}</div>`)}
      ${row("Música de fundo", "“A Pipa do Vovô” tocando baixinho enquanto você usa o site.", `<input type="range" id="music-vol" min="5" max="80" step="5" value="${Math.round(musicVol() * 100)}" aria-label="Volume da música"${musicOn() ? "" : " disabled"}>` + sw(`data-cfg-local="pref-music" data-default="1"`, musicOn(), "Música de fundo"))}
      ${row("Reduzir animações", "Desliga brilhos, flutuações e transições. Bom para aparelhos mais simples.", sw(`data-cfg-local="pref-calm"`, !!lsGet("pref-calm"), "Reduzir animações"))}
      ${row("Confete ao zerar um jogo", "", sw(`data-cfg="confetti"`, setting("confetti", true), "Confete ao zerar um jogo"))}
    </section>
    <section class="panel cfg-sec" id="cfg-privacidade"><h3>${ic("shield")}Privacidade</h3>
      ${caps.pub ? row("Perfil público", `Qualquer pessoa com o link vê seu perfil, favoritos, tier list e zerados. Lista de desejos e observações nunca aparecem.${p.is_public ? `<br><button class="link" data-act="share-profile">Copiar link do perfil</button>` : ""}`, sw(`data-cfg-pub`, !!p.is_public, "Perfil público")) : ""}
      ${v3 ? row("Receber cutucadas", "Amigos podem te cutucar (no máximo uma vez por minuto).", sw(`data-cfg="allow_poke"`, setting("allow_poke", true), "Receber cutucadas")) +
        row("Receber sugestões de jogos", "", sw(`data-cfg="allow_suggest"`, setting("allow_suggest", true), "Receber sugestões")) +
        row("Receber mensagens", "Só amigos podem te mandar mensagem.", sw(`data-cfg="allow_message"`, setting("allow_message", true), "Receber mensagens")) : `<p class="hint">Rode a migracao.sql para ativar mensagens, cutucadas e sugestões.</p>`}
    </section>
    <section class="panel cfg-sec" id="cfg-notificacoes"><h3>${ic("bell")}Notificações</h3>
      ${row("Notificações no celular", pushHint(), pushSupported() || "Notification" in window ? sw(`data-cfg-push`, pushOn(), "Notificações no celular") : `<span class="hint">Este navegador não permite.</span>`, "cfg-push-row")}
      ${row("Vibrar ao ser cutucado", "Só em celulares.", sw(`data-cfg-local="pref-vibrate" data-default="1"`, lsGet("pref-vibrate") !== false, "Vibrar ao ser cutucado"))}
    </section>
    <section class="panel cfg-sec" id="cfg-precos"><h3>${ic("tag")}Preços e lojas</h3>
      ${row("Plataforma principal", "Usada como padrão na busca e na página dos jogos.", `<select data-cfg-select="platform" aria-label="Plataforma principal">${["PC", "PlayStation", "Xbox", "Switch"].map(x => `<option${setting("platform", "PC") === x ? " selected" : ""}>${x}</option>`).join("")}</select>`)}
      ${row("Incluir revendas autorizadas", "Nuuvem, Humble, Fanatical, Green Man Gaming, Gamesplanet e GamersGate. Desligado, só aparecem lojas oficiais (Steam, Epic, GOG, Microsoft, Ubisoft, EA, Battle.net).", sw(`data-cfg="resellers"`, setting("resellers", true), "Incluir revendas autorizadas"))}
      <p class="hint">Valores em dólar são convertidos para reais pela cotação do dia${usdRate ? ` (hoje: US$ 1 = ${money(usdRate, "BRL")})` : ""}. O preço final pode variar com IOF e impostos.</p>
    </section>
    <section class="panel cfg-sec" id="cfg-dados"><h3>${ic("file")}Seus dados</h3>
      ${row("Biblioteca em planilha", "Baixe tudo em CSV (abre no Excel e no Google Planilhas) ou importe jogos de uma planilha.", `<button class="btn ghost sm" data-cfg-act="csv-out">${ic("download")}Exportar</button><button class="btn ghost sm" data-cfg-act="csv-in">${ic("upload")}Importar</button>`)}
      ${row("Lista de desejos em PDF", "Com capas, preços e links para comprar.", `<button class="btn ghost sm" data-cfg-act="pdf">${ic("pdf")}Exportar PDF</button>`)}
      ${row("Limpar dados deste aparelho", "Apaga o cache de preços e da cotação. Sua conta não é afetada.", `<button class="btn ghost sm" data-cfg-act="clear">Limpar</button>`)}
    </section>
    <section class="panel cfg-sec" id="cfg-app"><h3>${ic("phone")}App</h3>
      ${row("Instalar o app Jogos Enzola", standaloneNow ? "Você já está usando o app instalado." : "Abre em tela cheia, com ícone na tela inicial do celular ou do computador.", standaloneNow ? `<span class="kchip oficial">Instalado</span>` : `<button class="btn sm" data-act="install">${ic("phone")}Instalar</button>`)}
      ${row("Sobre", `Jogos Enzola ${VERSION} · Movimento Enzola. Dados de jogos: RAWG e Steam. Preços: CheapShark e IsThereAnyDeal.`, `<a class="btn ghost sm" href="https://www.instagram.com/movimento.enzola/" target="_blank" rel="noopener">${ic("insta")}Instagram</a>`)}
    </section>
    </div>
  </div>`;
  for (const [id, v] of keep) if (v && $("#" + id)) $("#" + id).value = v;
  if ($("#pw-new") && $("#pw-new").value) $("#pw-meter").className = "pwmeter s" + pwScore($("#pw-new").value);
  if (act && $("#" + act) && /^(pw|em)-/.test(act)) $("#" + act).focus();
}
function pwScore(s) { let n = 0; if (s.length >= 8) n++; if (s.length >= 12) n++; if (/[a-z]/.test(s) && /[A-Z]/.test(s)) n++; if (/\d/.test(s)) n++; if (/[^A-Za-z0-9]/.test(s)) n++; return Math.min(4, n) }
async function changePassword() {
  const cur = $("#pw-cur").value, n1 = $("#pw-new").value, n2 = $("#pw-new2").value;
  if (!cur) return toast("Digite sua senha atual.");
  if (n1.length < 6) return toast("A nova senha precisa ter pelo menos 6 caracteres.");
  if (n1 !== n2) return toast("As duas senhas novas não são iguais.");
  if (n1 === cur) return toast("A nova senha precisa ser diferente da atual.");
  const b = $("#pw-save"); b.disabled = true; b.textContent = "Salvando…";
  try {
    const chk = await sb.auth.signInWithPassword({ email: user.email, password: cur });
    if (chk.error) return toast("Senha atual incorreta.");
    const r = await sb.auth.updateUser({ password: n1 });
    if (r.error) return toast("Não foi possível trocar a senha: " + r.error.message);
    $("#pw-form").reset(); $("#pw-meter").className = "pwmeter"; toast("Senha alterada.");
  } finally { b.disabled = false; b.textContent = "Salvar nova senha" }
}

/* ---------- e-mail da conta, esqueci a senha e nova senha ---------- */
function openForgot() {
  const v = $("#a-id") ? $("#a-id").value.trim() : "";
  modalShell(`<h2>Esqueci minha senha</h2>
    <p class="sub">Digite o e-mail da sua conta. Vamos mandar um link para você criar uma senha nova.</p>
    <form class="f" id="fg-form" novalidate>
      <label>E-mail<span class="inp">${ic("mail")}<input type="email" id="fg-email" value="${esc(v.includes("@") ? v : "")}" autocomplete="email" autocapitalize="none" spellcheck="false" placeholder="voce@email.com"></span></label>
      <div class="auth-msg" id="fg-msg" role="status" aria-live="polite"></div>
      <div class="acts" style="margin-top:4px"><button type="button" class="btn ghost" data-close>Cancelar</button><button class="btn" id="fg-go">${ic("send")}Enviar link</button></div>
    </form>
    <div class="fg-help">${ic("insta")}<p><b>Sua conta é antiga e não tem e-mail?</b> Mande uma mensagem para <a href="https://www.instagram.com/movimento.enzola/" target="_blank" rel="noopener">@movimento.enzola</a> no Instagram com o seu usuário para redefinir a senha. Depois, cadastre seu e-mail em Configurações.</p></div>`);
  setTimeout(() => $("#fg-email") && $("#fg-email").focus(), 50);
}
async function doForgot() {
  const email = $("#fg-email").value.trim().toLowerCase(), m = $("#fg-msg");
  if (!EMAIL_RE.test(email)) { m.className = "auth-msg"; m.textContent = "Digite o e-mail da sua conta, como voce@email.com."; return }
  const b = $("#fg-go"); b.disabled = true; m.className = "auth-msg"; m.textContent = "Enviando…";
  try {
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: siteUrl() });
    if (error) { m.textContent = authError(error) || "Não foi possível enviar agora. Tente de novo em alguns minutos."; return }
    m.className = "auth-msg ok"; m.innerHTML = `Pronto! Se existir uma conta com <b>${esc(email)}</b>, o link chega em alguns minutos. Confira também a caixa de spam.`;
    b.hidden = true;
  } finally { b.disabled = false }
}
function openNewPassword() {
  modal2(`<h2>Crie uma nova senha</h2><p class="sub">Você entrou pelo link de recuperação. Escolha a senha nova da sua conta.</p>
    <form class="f" id="np-form" novalidate>
      <input type="text" autocomplete="username" value="${esc(user ? user.email : "")}" hidden>
      <label>Nova senha<span class="inp">${ic("lock")}<input type="password" id="np-pass" autocomplete="new-password"></span><span class="pwmeter" id="np-meter"><i></i></span></label>
      <label>Repita a nova senha<span class="inp">${ic("lock")}<input type="password" id="np-pass2" autocomplete="new-password"></span></label>
      <div class="auth-msg" id="np-msg" role="status" aria-live="polite"></div>
      <div class="acts"><button class="btn" id="np-go">Salvar nova senha</button></div>
    </form>`);
  setTimeout(() => $("#np-pass") && $("#np-pass").focus(), 50);
}
async function doNewPassword() {
  const a = $("#np-pass").value, b2 = $("#np-pass2").value, m = $("#np-msg");
  if (a.length < 6) return m.textContent = "A senha precisa ter pelo menos 6 caracteres.";
  if (a !== b2) return m.textContent = "As duas senhas não são iguais.";
  const b = $("#np-go"); b.disabled = true;
  const r = await sb.auth.updateUser({ password: a }); b.disabled = false;
  if (r.error) { m.textContent = authError(r.error) || "Não foi possível salvar: " + r.error.message; return }
  closeModal2(); history.replaceState(null, "", siteUrl() + "#perfil"); toast("Senha nova salva. Pronto!");
}
async function changeEmail() {
  const email = $("#em-new").value.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return toast("Digite um e-mail válido, como voce@email.com.");
  if (email === (user.email || "").toLowerCase()) return toast("Esse já é o e-mail da sua conta.");
  const b = $("#em-save"); b.disabled = true; b.textContent = "Salvando…";
  try {
    const r = await sb.auth.updateUser({ email, data: { username: uname() } }, { emailRedirectTo: siteUrl() + "#config" });
    if (r.error) return toast(authError(r.error) || "Não foi possível trocar o e-mail: " + r.error.message);
    const u = r.data && r.data.user;
    if (u && (u.email || "").toLowerCase() === email) {
      await sb.auth.updateUser({ data: { real_email: true, username: uname() } });
      user = { ...user, ...u, user_metadata: { ...(u.user_metadata || {}), real_email: true, username: uname() } };
      toast("E-mail salvo. Agora você entra com ele e pode recuperar a senha.");
    } else toast(`Enviamos um link de confirmação para ${email}. A troca vale depois do clique.`);
    renderConfig();
  } finally { const b2 = $("#em-save"); if (b2) { b2.disabled = false; b2.textContent = "Salvar e-mail" } }
}
document.addEventListener("submit", e => {
  if (e.target.id === "fg-form") { e.preventDefault(); doForgot() }
  if (e.target.id === "np-form") { e.preventDefault(); doNewPassword() }
  if (e.target.id === "pw-form") { e.preventDefault(); changePassword() }
  if (e.target.id === "em-form") { e.preventDefault(); changeEmail() }
});

/* ---------- instalar o app ---------- */
let deferredPrompt = null;
const standalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isAndroid = () => /android/i.test(navigator.userAgent);
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferredPrompt = e; updateInstallUI() });
window.addEventListener("appinstalled", () => { deferredPrompt = null; $("#install-bar").hidden = true; updateInstallUI(); toast("App instalado! Procure o ícone Jogos Enzola.") });
function updateInstallUI() { const show = !standalone(); $$('[data-act="install"]').forEach(b => b.hidden = !show) }
async function installApp() {
  $("#install-bar").hidden = true;
  if (standalone()) return toast("Você já está usando o app.");
  if (deferredPrompt) { deferredPrompt.prompt(); const { outcome } = await deferredPrompt.userChoice; deferredPrompt = null; if (outcome === "accepted") toast("Instalando o Jogos Enzola…"); return }
  showInstallHelp();
}
function showInstallHelp() {
  const dev = isIOS() ? "ios" : isAndroid() ? "android" : "pc";
  const shareIc = `<svg class="ic" viewBox="0 0 24 24"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M5 11v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9"/></svg>`;
  const steps = {
    ios: [`Abra este site no <b>Safari</b> (no iPhone, só o Safari instala apps).`, `Toque em <b>Compartilhar</b> ${shareIc} na barra de baixo.`, `Role e toque em <b>Adicionar à Tela de Início</b>.`, `Confirme em <b>Adicionar</b>. O ícone Jogos Enzola aparece na tela inicial.`],
    android: [`Abra este site no <b>Chrome</b>.`, `Toque no menu <b>⋮</b> no canto de cima.`, `Toque em <b>Instalar app</b> (ou <b>Adicionar à tela inicial</b>).`, `Confirme. O ícone Jogos Enzola aparece com seus apps.`],
    pc: [`Use o <b>Chrome</b> ou o <b>Edge</b>.`, `Clique no ícone de instalar ${ic("download")} no fim da barra de endereço, ou abra o menu do navegador.`, `Escolha <b>Instalar Jogos Enzola</b>.`, `O app abre em uma janela própria e fica no menu Iniciar ou no Dock.`],
  };
  modal2(`<div class="inst-head"><img src="icons/icon-192.png" alt="" width="64" height="64"><div><h2>Instalar o Jogos Enzola</h2><p class="sub" style="margin:0">Ícone na tela inicial, tela cheia e abertura rápida.</p></div></div>
    <div class="seg sm inst-tabs" role="tablist">${[["ios", "iPhone e iPad"], ["android", "Android"], ["pc", "Computador"]].map(([k, l]) => `<button role="tab" aria-checked="${k === dev}" data-inst="${k}">${l}</button>`).join("")}</div>
    ${Object.entries(steps).map(([k, s]) => `<ol class="inst-steps" data-inst-panel="${k}"${k === dev ? "" : " hidden"}>${s.map(x => `<li>${x}</li>`).join("")}</ol>`).join("")}
    <div class="acts"><button class="btn" data-close2>Entendi</button></div>`);
}
function maybeShowInstallBar() {
  if (standalone() || lsGet("install-dismissed") || !matchMedia("(max-width: 860px)").matches) return;
  setTimeout(() => {
    if (standalone() || !user) return;
    const b = $("#install-bar");
    b.innerHTML = `<img src="icons/icon-192.png" alt="" width="40" height="40"><div><b>Instale o app Jogos Enzola</b><span>Abre em tela cheia, direto da tela inicial.</span></div><button class="btn sm" data-act="install">Instalar</button><button class="iconbtn" data-ib="close" aria-label="Agora não">${ic("x")}</button>`;
    b.hidden = false;
  }, 4000);
}

/* ---------- escolher imagem da galeria e recortar ---------- */
function pickImage() {
  return new Promise(res => {
    const i = document.createElement("input"); i.type = "file"; i.accept = "image/*"; i.hidden = true; i.id = "pick-image";
    i.addEventListener("change", () => { res(i.files[0] || null); i.remove() });
    i.addEventListener("cancel", () => { res(null); i.remove() });
    document.body.append(i); i.click();
  });
}
async function loadFileImage(file) {
  if (window.createImageBitmap) { try { return await createImageBitmap(file, { imageOrientation: "from-image" }) } catch (e) { } }
  return new Promise((res, rej) => { const u = URL.createObjectURL(file), im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = u });
}
const CROP = { avatar: [320, 320, "Ajustar foto", true], banner: [1400, 460, "Ajustar banner", false], cover: [480, 720, "Ajustar capa", false] };
function openCropper(file, kind) {
  return new Promise(async res => {
    if (file.size > 25 * 1024 * 1024) { toast("Imagem muito grande. Escolha uma de até 25 MB."); return res(null) }
    let img; try { img = await loadFileImage(file) } catch (e) { toast("Não consegui abrir essa imagem. Use JPG, PNG, WebP ou HEIC."); return res(null) }
    const [W, H, title, round] = CROP[kind], iw = img.width, ih = img.height;
    const maxW = Math.min(kind === "banner" ? 600 : kind === "cover" ? 260 : 300, innerWidth - 72);
    const fw = Math.round(maxW), fh = Math.round(fw * H / W), dpr = Math.min(2, devicePixelRatio || 1);
    modal2(`<h2>${title}</h2><p class="sub">Arraste para posicionar. Use o controle ou a roda do mouse para aproximar.</p>
      <div class="crop${round ? " round" : ""}" style="width:${fw}px;height:${fh}px"><canvas id="cr-c" width="${fw * dpr}" height="${fh * dpr}" style="width:${fw}px;height:${fh}px"></canvas></div>
      <label class="zoom">${ic("image")}<input type="range" id="cr-z" min="1" max="4" step="0.01" value="1" aria-label="Aproximar"></label>
      <div class="acts"><button class="btn ghost" data-cr="cancel">Cancelar</button><button class="btn" data-cr="ok">${ic("check")}Usar imagem</button></div>`, "crop-modal");
    const cv = $("#cr-c"), x = cv.getContext("2d"), base = Math.max(fw / iw, fh / ih);
    let z = 1, ox = 0, oy = 0, drag = null, done = false;
    const clamp = () => { const s = base * z, mx = Math.max(0, (iw * s - fw) / 2), my = Math.max(0, (ih * s - fh) / 2); ox = Math.max(-mx, Math.min(mx, ox)); oy = Math.max(-my, Math.min(my, oy)) };
    const geo = (k = 1) => { const s = base * z; return [((fw - iw * s) / 2 + ox) * k, ((fh - ih * s) / 2 + oy) * k, iw * s * k, ih * s * k] };
    const draw = () => { x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, fw, fh); x.imageSmoothingQuality = "high"; x.drawImage(img, ...geo()) };
    draw();
    cv.addEventListener("pointerdown", e => { drag = [e.clientX, e.clientY, ox, oy]; cv.setPointerCapture(e.pointerId) });
    cv.addEventListener("pointermove", e => { if (!drag) return; ox = drag[2] + e.clientX - drag[0]; oy = drag[3] + e.clientY - drag[1]; clamp(); draw() });
    cv.addEventListener("pointerup", () => drag = null); cv.addEventListener("pointercancel", () => drag = null);
    cv.addEventListener("wheel", e => { e.preventDefault(); z = Math.max(1, Math.min(4, z * (e.deltaY < 0 ? 1.08 : 0.93))); $("#cr-z").value = z; clamp(); draw() }, { passive: false });
    $("#cr-z").addEventListener("input", e => { z = +e.target.value; clamp(); draw() });
    const finish = v => { if (done) return; done = true; closeModal2(); res(v) };
    $("#modal2").addEventListener("click", function h(e) {
      const b = e.target.closest("[data-cr]"); const out = e.target.hasAttribute && e.target.hasAttribute("data-ovl2");
      if (!b && !out) return;
      $("#modal2").removeEventListener("click", h, true);
      if (out || b.dataset.cr === "cancel") return finish(null);
      const oc = document.createElement("canvas"); oc.width = W; oc.height = H;
      const o = oc.getContext("2d"); o.fillStyle = "#0B1129"; o.fillRect(0, 0, W, H); o.imageSmoothingQuality = "high"; o.drawImage(img, ...geo(W / fw));
      oc.toBlob(bl => finish(bl), "image/jpeg", 0.88);
    }, true);
    new MutationObserver((_, ob) => { if (!$("#cr-c")) { ob.disconnect(); if (!done) { done = true; res(null) } } }).observe($("#modal2"), { childList: true });
  });
}

/* ---------- PDF da lista de desejos (gerador próprio, sem bibliotecas) ---------- */
const WIN = { "€": 128, "‚": 130, "„": 132, "…": 133, "‘": 145, "’": 146, "“": 147, "”": 148, "•": 149, "–": 150, "—": 151, "™": 153 };
function pdfStr(s) {
  let o = "";
  for (const ch of String(s)) {
    let c = ch.charCodeAt(0);
    if (WIN[ch]) c = WIN[ch]; else if (c > 255 || (c >= 128 && c < 160)) c = 63;
    const k = String.fromCharCode(c);
    o += k === "(" || k === ")" || k === "\\" ? "\\" + k : k;
  }
  return "(" + o + ")";
}
const bin = s => { const a = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i) & 255; return a };
const hex2rgb = h => [1, 3, 5].map(i => (parseInt(h.slice(i, i + 2), 16) / 255).toFixed(3)).join(" ");
async function jpegOf(draw, w, h) {
  const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d"); await draw(x);
  const b = await new Promise(r => c.toBlob(r, "image/jpeg", 0.85)); return { w, h, bytes: new Uint8Array(await b.arrayBuffer()) };
}
function makePDF(pages, images) {
  // pages: [{ops:string, links:[{x,y,w,h,url}]}]  images: [{w,h,bytes}]
  const objs = []; const add = o => (objs.push(o), objs.length);
  const catalog = add(null), pagesId = add(null);
  const f1 = add(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`);
  const f2 = add(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`);
  const imIds = images.map(im => add({ head: `<< /Type /XObject /Subtype /Image /Width ${im.w} /Height ${im.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${im.bytes.length} >>`, data: im.bytes }));
  const xo = imIds.map((id, i) => `/Im${i} ${id} 0 R`).join(" ");
  const pageIds = pages.map(pg => {
    const content = add({ head: `<< /Length ${pg.ops.length} >>`, data: bin(pg.ops) });
    const annots = pg.links.map(l => add(`<< /Type /Annot /Subtype /Link /Rect [${l.x.toFixed(1)} ${(842 - l.y - l.h).toFixed(1)} ${(l.x + l.w).toFixed(1)} ${(842 - l.y).toFixed(1)}] /Border [0 0 0] /A << /S /URI /URI ${pdfStr(l.url)} >> >>`));
    return add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> /XObject << ${xo} >> >> /Contents ${content} 0 R${annots.length ? ` /Annots [${annots.map(a => a + " 0 R").join(" ")}]` : ""} >>`);
  });
  objs[catalog - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R /Lang (pt-BR) >>`;
  objs[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map(i => i + " 0 R").join(" ")}] /Count ${pageIds.length} >>`;
  const info = add(`<< /Title ${pdfStr("Lista de desejos - Jogos Enzola")} /Producer (Jogos Enzola) /CreationDate (D:${new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14)}) >>`);
  const parts = [bin("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n")]; let off = parts[0].length; const offsets = [];
  objs.forEach((o, i) => {
    offsets.push(off);
    const chunk = typeof o === "string" ? [bin(`${i + 1} 0 obj\n${o}\nendobj\n`)] : [bin(`${i + 1} 0 obj\n${o.head}\nstream\n`), o.data, bin(`\nendstream\nendobj\n`)];
    for (const c of chunk) { parts.push(c); off += c.length }
  });
  const xref = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map(o => String(o).padStart(10, "0") + " 00000 n \n").join("")}trailer\n<< /Size ${objs.length + 1} /Root ${catalog} 0 R /Info ${info} 0 R >>\nstartxref\n${off}\n%%EOF`;
  parts.push(bin(xref));
  return new Blob(parts, { type: "application/pdf" });
}
async function exportWishlistPDF() {
  const list = sorted(wishlist(), wlSort === "n" ? "price" : wlSort);
  if (!list.length) return toast("Sua lista de desejos está vazia.");
  const btn = $("#wl-pdf"), old = btn && btn.innerHTML; if (btn) { btn.disabled = true; btn.innerHTML = `${ic("pdf")}Gerando…` }
  try {
    await getRate();
    const mc = document.createElement("canvas").getContext("2d");
    const tw = (t, size, bold) => { mc.font = `${bold ? "bold " : ""}${size}px Helvetica, Arial, sans-serif`; return mc.measureText(t).width };
    const fit = (t, size, bold, w) => { t = String(t); if (tw(t, size, bold) <= w) return t; while (t.length > 1 && tw(t + "...", size, bold) > w) t = t.slice(0, -1); return t.trimEnd() + "..." };
    const logo = await loadImg("logo.png");
    const images = [await jpegOf(x => { x.fillStyle = "#0B1129"; x.fillRect(0, 0, 297, 388); if (logo) x.drawImage(logo, 0, 0, 297, 388) }, 297, 388)];
    const covIdx = [];
    for (const g of list) {
      const im = await loadImg(g.cover_url, true);
      images.push(await jpegOf(x => drawCover(x, im, g, 0, 0, 160, 240, 22), 160, 240)); covIdx.push(images.length - 1);
    }
    const C = { navy: "#0B1129", ink: "#121A33", muted: "#5D6889", card: "#F3F5FB", line: "#DDE3F0", accent: "#3A63E0", green: "#13895D", greenbg: "#DDF4EA", white: "#FFFFFF", soft: "#C3CFEE" };
    const priced = list.filter(bestOf), total = priced.reduce((a, g) => a + (brl(bestOf(g)) || 0), 0);
    const pages = []; let ops = "", links = [], y = 0;
    const rect = (x0, y0, w, h, col) => ops += `${hex2rgb(col)} rg ${x0} ${842 - y0 - h} ${w} ${h} re f\n`;
    const rrect = (x0, y0, w, h, r, col) => { const Y = 842 - y0 - h, k = r * 0.5523; ops += `${hex2rgb(col)} rg ${x0 + r} ${Y} m ${x0 + w - r} ${Y} l ${x0 + w - r + k} ${Y} ${x0 + w} ${Y + r - k} ${x0 + w} ${Y + r} c ${x0 + w} ${Y + h - r} l ${x0 + w} ${Y + h - r + k} ${x0 + w - r + k} ${Y + h} ${x0 + w - r} ${Y + h} c ${x0 + r} ${Y + h} l ${x0 + r - k} ${Y + h} ${x0} ${Y + h - r + k} ${x0} ${Y + h - r} c ${x0} ${Y + r} l ${x0} ${Y + r - k} ${x0 + r - k} ${Y} ${x0 + r} ${Y} c f\n` };
    const text = (t, x0, y0, size, col, bold, align) => { const w = tw(t, size, bold); const X = align === "r" ? x0 - w : x0; ops += `BT /${bold ? "F2" : "F1"} ${size} Tf ${hex2rgb(col)} rg ${X.toFixed(1)} ${(842 - y0).toFixed(1)} Td ${pdfStr(t)} Tj ET\n`; return w };
    const image = (i, x0, y0, w, h) => ops += `q ${w} 0 0 ${h} ${x0} ${842 - y0 - h} cm /Im${i} Do Q\n`;
    const newPage = first => {
      if (ops) pages.push({ ops, links });
      ops = ""; links = [];
      if (first) {
        rect(0, 0, 595, 132, C.navy);
        image(0, 40, 24, 64, 84);
        text("Lista de desejos", 120, 62, 24, C.white, true);
        text(`${nick()} · @${uname()}${myTag() ? " " + myTag() : ""}`, 120, 84, 11, C.soft);
        text(`Gerada em ${new Date().toLocaleDateString("pt-BR")} no Jogos Enzola`, 120, 100, 9, C.soft);
        text(priced.length ? money(total, "BRL") : "-", 555, 64, 20, C.white, true, "r");
        text("total no menor preço", 555, 80, 9, C.soft, false, "r");
        const sum = `${list.length} ${list.length === 1 ? "jogo" : "jogos"} · ${priced.length} com preço · ${priced.filter(g => bestOf(g).cut > 0).length} em promoção${usdRate ? ` · cotação US$ 1 = ${money(usdRate, "BRL")} (${new Date().toLocaleDateString("pt-BR")})` : ""}`;
        text(sum, 40, 156, 9.5, C.muted);
        y = 172;
      } else {
        image(0, 40, 26, 22, 29); text("Lista de desejos", 70, 40, 13, C.ink, true); text(`${nick()} · continuação`, 70, 54, 9, C.muted);
        rect(40, 66, 515, 0.8, C.line); y = 80;
      }
    };
    newPage(true);
    list.forEach((g, i) => {
      const H = 92; if (y + H > 800) newPage(false);
      rrect(40, y, 515, H - 8, 10, C.card);
      image(covIdx[i], 52, y + 8, 46, 69);
      text(fit(g.name, 13, true, 290), 112, y + 26, 13, C.ink, true);
      const b = bestOf(g);
      text([g.platform || "Plataforma não informada", b ? `${b.shop} (${b.kind === "oficial" ? "loja oficial" : "revenda autorizada"})` : ""].filter(Boolean).join(" · "), 112, y + 42, 9.5, C.muted);
      if (g.target_price != null) { const hit = b && brl(b) != null && brl(b) <= g.target_price; text(`Preço-alvo: ${money(g.target_price, "BRL")}${hit ? "  ·  abaixo do alvo!" : ""}`, 112, y + 57, 9, hit ? C.green : C.muted, hit) }
      let url = null, label = "";
      if (isConsole(g.platform)) {
        const [store, u] = g.price && g.price.url ? [g.price.store, g.price.url] : storeSearch(g.name, g.platform);
        text("Preço na loja oficial", 543, y + 30, 11, C.ink, true, "r"); url = u; label = `Abrir ${store}`;
      } else if (b) {
        const v = brl(b);
        text(v != null ? money(v, "BRL") : money(b.amount, b.currency), 543, y + 30, 16, C.ink, true, "r");
        if (b.currency === "USD") text(`(${money(b.amount, "USD")})`, 543, y + 44, 9, C.muted, false, "r");
        if (b.cut > 0) { const t = `-${b.cut}%`, w = tw(t, 9, true) + 10; rrect(543 - w - (b.currency === "USD" ? tw(`(${money(b.amount, "USD")})`, 9) + 8 : 0), y + 35, w, 13, 4, C.greenbg); text(t, 543 - 5 - (b.currency === "USD" ? tw(`(${money(b.amount, "USD")})`, 9) + 8 : 0), y + 45, 9, C.green, true, "r") }
        url = b.url; label = "Comprar";
      } else text("Sem oferta no momento", 543, y + 30, 10, C.muted, false, "r");
      if (url) { const w = text(label, 543, y + 70, 10, C.accent, true, "r"); links.push({ x: 543 - w - 4, y: y + 58, w: w + 8, h: 16, url }); ops += `${hex2rgb(C.accent)} RG 0.6 w ${543 - w} ${842 - y - 72} m 543 ${842 - y - 72} l S\n` }
      if (gameHref(g)) links.push({ x: 112, y: y + 12, w: Math.min(290, tw(g.name, 13, true)), h: 18, url: location.origin + location.pathname + "#" + gameHref(g) });
      y += H;
    });
    pages.push({ ops, links });
    pages.forEach((pg, i) => { const t = `Página ${i + 1} de ${pages.length}`; pg.ops += `BT /F1 8.5 Tf ${hex2rgb(C.muted)} rg 40 22 Td ${pdfStr("Jogos Enzola · Movimento Enzola · Preços de lojas oficiais e revendas autorizadas, sujeitos a mudança.")} Tj ET\nBT /F1 8.5 Tf ${hex2rgb(C.muted)} rg ${(555 - tw(t, 8.5)).toFixed(1)} 22 Td ${pdfStr(t)} Tj ET\n` });
    const blob = makePDF(pages, images);
    if (!(await shareOrDownload(blob, `lista-de-desejos-${uname()}.pdf`, "Minha lista de desejos"))) toast("PDF da lista de desejos salvo.");
  } catch (e) { console.warn(e); toast("Não foi possível gerar o PDF.") }
  finally { if (btn) { btn.disabled = false; btn.innerHTML = old } }
}

/* ---------- eventos ---------- */
document.addEventListener("click", async e => {
  const c = s => e.target.closest(s); let b;
  if (c("#a-forgot")) { openForgot(); return }
  if (c("[data-close2]")) { closeModal2(); return }
  if (b = c("[data-inst]")) { $$("[data-inst]").forEach(x => x.setAttribute("aria-checked", x === b)); $$("[data-inst-panel]").forEach(p => p.hidden = p.dataset.instPanel !== b.dataset.inst); return }
  if (c("[data-ib='close']")) { $("#install-bar").hidden = true; lsSet("install-dismissed", true); return }
  if (b = c("[data-cfg-act=inv-copy]")) { copyText(inviteUrl(uname()), "Link de convite copiado."); return }
  if (b = c("[data-cfg-act=inv-share]")) { const url = inviteUrl(uname()), text = "Vem pro Jogos Enzola! Monte seu catálogo de jogos e me adicione como amigo.";
    if (navigator.share) { try { await navigator.share({ title: "Jogos Enzola", text, url }) } catch (er) { if (er.name !== "AbortError") copyText(url, "Link de convite copiado.") } } else copyText(url, "Link de convite copiado."); return }
  if (b = c("[data-cfg-jump]")) { e.preventDefault(); const s = $("#cfg-" + b.dataset.cfgJump); if (s) s.scrollIntoView({ behavior: "smooth", block: "start" }); return }
  if (b = c("[data-cfg-theme]")) { setTheme(b.dataset.cfgTheme); return }
  if (b = c("[data-cfg-act]")) {
    const a = b.dataset.cfgAct;
    if (a === "logout-all") { if (!b.dataset.sure) { b.dataset.sure = 1; b.textContent = "Confirmar"; return } await sb.auth.signOut({ scope: "global" }); location.hash = "" }
    else if (a === "csv-out") exportCSV();
    else if (a === "csv-in") $("#csv-file").click();
    else if (a === "pdf") exportWishlistPDF();
    else if (a === "clear") { for (const k of ["cs-stores", "usdbrl"]) try { localStorage.removeItem(k) } catch (er) { } try { Object.keys(localStorage).filter(k => k.startsWith("yt-")).forEach(k => localStorage.removeItem(k)) } catch (er) { } toast("Cache deste aparelho limpo.") }
    else if (a === "delete") openDeleteAccount();
    return;
  }
  if (c("#pw-save")) { e.preventDefault(); changePassword(); return }
  if (c("#em-save")) { e.preventDefault(); changeEmail(); return }
  if (c("#del-go")) { doDeleteAccount(); return }
});
document.addEventListener("change", async e => {
  const t = e.target;
  if (t.dataset.cfg) return saveSettings({ [t.dataset.cfg]: t.checked });
  if (t.dataset.cfgSelect) return saveSettings({ [t.dataset.cfgSelect]: t.value });
  if (t.dataset.cfgLocal === "pref-music") { musicToggle(t.checked); const v = $("#music-vol"); if (v) v.disabled = !t.checked; return }
  if (t.dataset.cfgLocal) { lsSet(t.dataset.cfgLocal, t.checked); applyLocalPrefs(); toast("Configuração salva neste aparelho."); return }
  if (t.hasAttribute("data-cfg-pub")) { if (await saveProfile({ is_public: t.checked })) toast(t.checked ? "Seu perfil agora é público." : "Seu perfil agora é privado."); return }
  if (t.hasAttribute("data-cfg-push")) {
    t.disabled = true;
    const ok = t.checked ? await enablePush() : (await disablePush(), false);
    t.disabled = false; t.checked = ok;
  }
});
document.addEventListener("input", e => {
  if (e.target.id === "pw-new") { const s = pwScore(e.target.value); $("#pw-meter").className = "pwmeter s" + s; $("#pw-hint").textContent = ["Muito fraca", "Fraca", "Razoável", "Boa", "Forte"][s] + (s < 3 ? ". Use 8 ou mais caracteres, misturando letras e números." : ".") }
  if (e.target.id === "np-pass") $("#np-meter").className = "pwmeter s" + pwScore(e.target.value);
});
function openDeleteAccount() {
  modalShell(`<h2>Excluir conta</h2><p class="sub">Isso apaga para sempre sua biblioteca, tier list, lista de desejos, amigos, grupos e mensagens. Não dá para desfazer.</p>
    <div class="f"><label>Para confirmar, digite seu usuário (${esc(uname())})<input type="text" id="del-user" autocomplete="off" autocapitalize="none"></label></div>
    <div class="acts"><button class="btn ghost" data-close>Cancelar</button><button class="btn danger" id="del-go">${ic("trash")}Excluir para sempre</button></div>`);
}
async function doDeleteAccount() {
  if ($("#del-user").value.trim().toLowerCase() !== uname()) return toast("O usuário digitado não confere.");
  const b = $("#del-go"); b.disabled = true; b.textContent = "Excluindo…";
  try { await api("excluir_conta"); closeModal(); await sb.auth.signOut(); location.hash = ""; toast("Sua conta foi excluída.") }
  catch (e) { toast("Não foi possível excluir agora. Tente de novo."); b.disabled = false; b.textContent = "Excluir para sempre" }
}


/* ---------- convite por link (?convite=usuario) ---------- */
const inviteUrl = u => location.origin + location.pathname + "?convite=" + encodeURIComponent(u);
(function captureInvite() {
  try {
    const q = new URLSearchParams(location.search), u = (q.get("convite") || "").trim().toLowerCase().replace(/^@/, "");
    if (!/^[a-z0-9._-]{3,30}$/.test(u)) return;
    lsSet("invite", u);
    if (typeof setAuthTab === "function") setAuthTab(true);
    q.delete("convite"); const rest = q.toString();
    history.replaceState(null, "", location.pathname + (rest ? "?" + rest : "") + location.hash);
    const tabs = document.querySelector(".auth-tabs");
    if (tabs && !document.getElementById("invite-note")) {
      const n = document.createElement("div"); n.id = "invite-note"; n.className = "invite-note";
      n.innerHTML = `<b>Você foi convidado por @${esc(u)}</b><span>Crie sua conta ou entre. O pedido de amizade é enviado sozinho.</span>`;
      tabs.after(n);
    }
  } catch (er) { }
})();
async function applyInvite() {
  const u = lsGet("invite"); if (!u || !user) return;
  try { localStorage.removeItem("invite") } catch (er) { }
  if (u === uname()) return;
  let state = "none";
  if (caps.v3) {
    const r = await sb.rpc("find_user2", { q: u }), f = (r.data || []).find(x => x.username === u);
    if (f) {
      if (fr.rows.some(x => other(x) === f.user_id)) state = "already";
      else { const { error } = await sb.from("friendships").insert({ addressee: f.user_id }); if (!error) { state = "sent"; loadFriends() } }
    }
  }
  showWelcome(u, state);
}

/* ---------- boas-vindas de quem entra por convite ---------- */
// true = hipopótamo no centro com os coadjuvantes em bolhas; false = só o hipopótamo (versão anterior)
const WELCOME_CAST = true;
const CAST_FILES = ["c1", "c2", "c3", "c4", "c5", "c6", "c8", "c9", "c10", "c11", "c12", "c13", "c14", "c15", "c16", "c17"];
function showWelcome(inviter, state) {
  if (document.getElementById("welcome")) return;
  const line = state === "sent" ? `<b>@${esc(inviter)}</b> te convidou. Já enviamos seu pedido de amizade.`
    : state === "already" ? `Você e <b>@${esc(inviter)}</b> já estão conectados por aqui.`
    : `<b>@${esc(inviter)}</b> te convidou para jogar junto.`;
  const w = document.createElement("div");
  w.id = "welcome"; w.className = "welcome"; w.setAttribute("role", "dialog"); w.setAttribute("aria-modal", "true"); w.setAttribute("aria-labelledby", "w-title");
  const bubbles = Array.from({ length: 16 }, () => { const s = 8 + Math.random() * 26; return `<i class="bub" style="left:${(Math.random() * 100).toFixed(1)}%;width:${s.toFixed(0)}px;height:${s.toFixed(0)}px;animation-duration:${(7 + Math.random() * 9).toFixed(1)}s;animation-delay:${(-Math.random() * 12).toFixed(1)}s"></i>` }).join("");
  w.innerHTML = `<div class="w-rays" aria-hidden="true"></div><div class="w-bubs" aria-hidden="true">${bubbles}</div>
    <div class="w-card"><span class="logo sm w-logo" role="img" aria-label="Movimento Enzola"></span>
      <div class="w-stage${WELCOME_CAST ? " cast" : ""}">${WELCOME_CAST ? `<div class="w-cast" aria-hidden="true">${CAST_FILES.map((f, i) => `<span class="cb" style="--i:${i};--d:${(4 + Math.random() * 2.6).toFixed(1)}s"><img src="convite/${f}.jpg" alt="" loading="eager" draggable="false"></span>`).join("")}</div>` : ""}
      <img class="w-hippo" src="hipopotamo.webp" alt="Filhote de hipopótamo nadando na sua direção" width="300"></div>
      <h1 id="w-title">Bem-vindo ao Jogos Enzola</h1>
      <p>${line}</p>
      <p class="w-sub">Monte seu catálogo, sua tier list e seu perfil gamer.</p>
      <button class="btn w-go" id="w-go">Começar</button></div>`;
  document.body.append(w);
  const stage = w.querySelector(".w-stage.cast"), relayout = () => stage && layoutCast(stage);
  if (stage) { relayout(); window.addEventListener("resize", relayout) }
  const close = () => { window.removeEventListener("resize", relayout); w.classList.add("out"); setTimeout(() => w.remove(), 350); document.removeEventListener("keydown", onKey) };
  const onKey = ev => { if (ev.key === "Escape") close() };
  document.addEventListener("keydown", onKey);
  w.querySelector("#w-go").addEventListener("click", close); w.querySelector("#w-go").focus({ preventScroll: true });
}

// Espalha as bolhas de forma aleatória ao redor do hipopótamo, sem encostar nele nem umas nas outras
function layoutCast(stage) {
  const W = stage.clientWidth, H = stage.clientHeight; if (!W || !H) return;
  const mob = W < 560, hh = H * (mob ? .72 : .94), hw = hh * .854;
  const cx = W / 2, cy = H / 2, rx = hw / 2 + 10, ry = hh / 2 + 6;
  const sizes = mob ? [42, 48, 54, 60] : [58, 66, 76, 88], minS = mob ? 36 : 44, placed = [];
  const els = [...stage.querySelectorAll(".cb")].sort(() => Math.random() - .5);
  for (const el of els) {
    let s = sizes[Math.floor(Math.random() * sizes.length)], ok = false;
    for (let t = 0; t < 1500 && !ok; t++) {
      if (t % 150 === 149) s = Math.max(minS, s - 6);
      // sorteia num anel em volta do hipopótamo (fica mais equilibrado que no retângulo todo)
      const ang = Math.random() * Math.PI * 2, k = 1.12 + Math.random() * (mob ? .9 : 1.25);
      const x = cx + Math.cos(ang) * (rx + s / 2) * k, y = cy + Math.sin(ang) * (ry + s / 2) * k;
      if (x < s / 2 + 3 || x > W - s / 2 - 3 || y < s / 2 + 3 || y > H - s / 2 - 3) continue;
      if (((x - cx) / (rx + s * .45)) ** 2 + ((y - cy) / (ry + s * .45)) ** 2 < 1) continue;
      if (placed.some(p => Math.hypot(p.x - x, p.y - y) < (p.s + s) / 2 + 6)) continue;
      placed.push({ x, y, s }); ok = true;
      Object.assign(el.style, { left: (x / W * 100).toFixed(2) + "%", top: (y / H * 100).toFixed(2) + "%", width: s + "px", height: s + "px", margin: `${-s / 2}px 0 0 ${-s / 2}px`, display: "" });
    }
    if (!ok) el.style.display = "none";
  }
}

/* ---------- notificações no celular (Web Push) ----------
   Cutucadas, sugestões e mensagens chegam como notificação do sistema, mesmo com o site fechado.
   Android/computador: funciona no navegador. iPhone: só com o app instalado na tela de início (iOS 16.4+). */
const pushSupported = () => "serviceWorker" in navigator && "PushManager" in window && "Notification" in window && /^https:|^http:\/\/localhost/.test(location.href);
const pushOn = () => !!lsGet("pref-push") && "Notification" in window && Notification.permission === "granted";
function pushHint() {
  if (isIOS() && !standalone()) return "Cutucadas, mensagens e sugestões chegam como notificação. No iPhone, primeiro instale o app (Compartilhar → Adicionar à Tela de Início) e ative aqui dentro dele.";
  if ("Notification" in window && Notification.permission === "denied") return "As notificações estão bloqueadas neste navegador. Libere nas configurações do site (cadeado ao lado do endereço) e ative de novo.";
  return "Cutucadas, mensagens e sugestões chegam como notificação do sistema, mesmo com o site fechado.";
}
function u8key(b) { b = b.replace(/-/g, "+").replace(/_/g, "/"); while (b.length % 4) b += "="; return Uint8Array.from(atob(b), c => c.charCodeAt(0)) }
async function savePushSub(sub) {
  const j = sub.toJSON();
  const { error } = await sb.from("push_subscriptions").upsert({ user_id: user.id, endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth }, { onConflict: "endpoint" });
  if (error) throw error;
}
async function enablePush() {
  if (!("Notification" in window)) { toast("Este navegador não mostra notificações."); return false }
  if (isIOS() && !standalone()) { toast("No iPhone, instale o app na tela de início e ative as notificações por lá."); return false }
  const perm = await Notification.requestPermission();
  if (perm !== "granted") { toast("Permissão negada. Libere as notificações nas configurações do navegador."); return false }
  if (!pushSupported() || !FN()) { lsSet("pref-sysnotif", true); toast(FN() ? "Avisos ativados enquanto o site estiver aberto." : "Avisos ativados com o site aberto. Para chegar com o site fechado, publique a função “enzola”."); return true }
  try {
    const { key } = await api("push_key");
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (sub && sub.options && sub.options.applicationServerKey) {
      const cur = btoa(String.fromCharCode(...new Uint8Array(sub.options.applicationServerKey))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      if (cur !== key) { await sub.unsubscribe(); sub = null }
    }
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: u8key(key) });
    await savePushSub(sub);
    lsSet("pref-push", true); lsSet("pref-sysnotif", false);
    toast("Pronto! Cutucadas, mensagens e sugestões vão chegar como notificação neste aparelho.");
    return true;
  } catch (e) {
    console.warn("push", e);
    toast(/push_subscriptions|relation|schema cache/i.test(e.message || "") ? "Rode a migracao.sql nova no Supabase para ativar as notificações." : "Não foi possível ativar as notificações agora. Tente de novo.");
    return false;
  }
}
async function disablePush(silent) {
  lsSet("pref-push", false); lsSet("pref-sysnotif", false);
  try {
    const reg = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : null;
    const sub = reg && reg.pushManager ? await reg.pushManager.getSubscription() : null;
    if (sub) { if (user) await sb.from("push_subscriptions").delete().eq("endpoint", sub.endpoint); await sub.unsubscribe() }
  } catch (e) { }
  if (!silent) toast("Notificações desativadas neste aparelho.");
}
// ao entrar: mantém a assinatura do aparelho em dia (o navegador pode trocá-la)
async function pushSync() {
  if (!user || !pushOn() || !pushSupported() || !FN()) return;
  try { const reg = await navigator.serviceWorker.ready; const sub = await reg.pushManager.getSubscription(); if (sub) await savePushSub(sub); else { lsSet("pref-push", false); await enablePush() } } catch (e) { }
}
// ao sair: este aparelho para de receber as notificações dessa conta
async function pushLogout() {
  if (!lsGet("pref-push")) return;
  try { const reg = await navigator.serviceWorker.getRegistration(); const sub = reg && await reg.pushManager.getSubscription(); if (sub) { await sb.from("push_subscriptions").delete().eq("endpoint", sub.endpoint); await sub.unsubscribe() } } catch (e) { }
  lsSet("pref-push", false);
}

/* ---------- música de fundo (A Pipa do Vovô, em looping) ----------
   Navegadores só deixam tocar som depois do primeiro toque/clique na página, então ela começa aí.
   Volume ambiente controlado por Web Audio (no iPhone o volume do <audio> é ignorado). */
const bgm = { el: null, ctx: null, gain: null, want: false, started: false };
const musicOn = () => lsGet("pref-music") !== false;
const musicVol = () => { const v = lsGet("pref-music-vol"); return typeof v === "number" ? v : 0.3 };
function bgmInit() {
  if (bgm.el) return bgm.el;
  const a = new Audio("musica.mp3"); a.loop = true; a.preload = "auto"; a.setAttribute("playsinline", ""); a.volume = musicVol();
  bgm.el = a;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) { bgm.ctx = new AC(); const src = bgm.ctx.createMediaElementSource(a); bgm.gain = bgm.ctx.createGain(); bgm.gain.gain.value = 0; src.connect(bgm.gain).connect(bgm.ctx.destination); a.volume = 1 }
  } catch (e) { bgm.ctx = null; bgm.gain = null; a.volume = musicVol() }
  a.addEventListener("playing", musicUI); a.addEventListener("pause", musicUI);
  return a;
}
function bgmFade(to, ms = 1200) {
  if (bgm.gain && bgm.ctx) { const g = bgm.gain.gain, t = bgm.ctx.currentTime; g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(to, t + ms / 1000) }
  else if (bgm.el) bgm.el.volume = to;
}
async function musicPlay() {
  if (!musicOn() || document.hidden || bgm.videoPaused) return;
  const a = bgmInit();
  // play() e resume() chamados na mesma hora do toque (o iPhone exige)
  const pr = a.play();
  try { if (bgm.ctx && bgm.ctx.state !== "running") bgm.ctx.resume().catch(() => { }) } catch (e) { }
  try { await pr; bgm.started = true; bgmFade(musicVol()) } catch (e) { /* aguardando o primeiro toque */ }
  musicUI();
}
function musicPause(fade = true) {
  if (!bgm.el || bgm.el.paused) return;
  if (fade && bgm.gain) { bgmFade(0, 400); setTimeout(() => { if (bgm.el && (!musicOn() || document.hidden || bgm.videoPaused)) bgm.el.pause() }, 420) } else bgm.el.pause();
}
function musicUI() {
  const b = $("#music-btn"); if (!b) return;
  const playing = !!(bgm.el && !bgm.el.paused);
  b.setAttribute("aria-pressed", String(musicOn()));
  b.classList.toggle("on", playing); b.classList.toggle("off", !musicOn());
  b.title = musicOn() ? (playing ? "Música tocando — clique para desligar" : "Música ligada — toque em qualquer lugar para começar") : "Música desligada — clique para ligar";
  b.querySelector("use").setAttribute("href", musicOn() ? "#i-music" : "#i-mute");
}
function musicToggle(force) {
  const on = typeof force === "boolean" ? force : !musicOn();
  lsSet("pref-music", on);
  if (on) musicPlay(); else musicPause();
  musicUI();
}
function musicSetVol(v) { lsSet("pref-music-vol", v); if (bgm.el && !bgm.el.paused) bgmFade(v, 150) }
// primeiro toque/clique/tecla em qualquer lugar liberam o som
["pointerdown", "keydown", "touchend"].forEach(ev => document.addEventListener(ev, e => {
  if (e.target && e.target.closest && e.target.closest("#music-btn,[data-cfg-local='pref-music']")) return;
  if (!bgm.started && musicOn()) musicPlay();
}, { capture: true, passive: true }));
document.addEventListener("visibilitychange", () => { if (document.hidden) musicPause(false); else if (bgm.started) musicPlay() });
// pausa a música enquanto um vídeo (trailer) estiver tocando
document.addEventListener("play", e => { if (e.target.tagName === "VIDEO") { bgm.videoPaused = true; musicPause() } }, true);
["pause", "ended"].forEach(ev => document.addEventListener(ev, e => { if (e.target.tagName === "VIDEO") { bgm.videoPaused = false; if (bgm.started) musicPlay() } }, true));
document.addEventListener("click", e => { if (e.target.closest("#music-btn")) { e.preventDefault(); musicToggle() } });
document.addEventListener("input", e => { if (e.target.id === "music-vol") musicSetVol(+e.target.value / 100) });
// notificação tocada com o site aberto: o service worker pede para ir à tela certa
if ("serviceWorker" in navigator) navigator.serviceWorker.addEventListener("message", e => { if (e.data && e.data.go) location.href = e.data.go });
musicUI(); musicPlay();
