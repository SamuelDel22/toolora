(() => {
  const config = window.TOOLORA_SUPABASE || {};
  const configured = config.url && config.anonKey && !config.url.includes('TU-PROYECTO') && !config.anonKey.includes('TU_SUPABASE');
  const modal = document.getElementById('authModal');
  if (!modal) return;
  const $ = (selector) => document.querySelector(selector);
  const message = $('#authMessage');
  const form = $('#authForm');
  const submit = $('#authSubmit');
  const password = $('#authPassword');
  const email = $('#authEmail');
  const accountButton = $('#accountButton');
  const workspaceStatus = $('#workspaceStatus');
  let mode = 'login';
  let client = null;
  let currentUser = null;
  let previousFocus = null;

  function say(text, error = false) {
    message.textContent = text;
    message.classList.toggle('error', error);
  }
  function openAuth(nextMode = 'login') {
    previousFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    setMode(nextMode);
    setTimeout(() => email.focus(), 30);
  }
  function closeAuth() {
    modal.hidden = true;
    document.body.style.overflow = '';
    say('');
    if (previousFocus && previousFocus.focus) previousFocus.focus();
  }
  function setMode(nextMode) {
    mode = nextMode;
    document.querySelectorAll('[data-auth-mode]').forEach(button => {
      const active = button.dataset.authMode === mode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    $('#authTitle').textContent = mode === 'signup' ? 'Empieza con tu correo.' : 'Qué bueno tenerte aquí.';
    submit.innerHTML = mode === 'signup' ? 'Crear mi cuenta <span>↗</span>' : 'Entrar a mi cuenta <span>↗</span>';
    password.autocomplete = mode === 'signup' ? 'new-password' : 'current-password';
    say('');
  }
  function paintUser(user) {
    currentUser = user || null;
    const label = user ? (user.user_metadata?.full_name || user.email || 'Mi cuenta') : 'Entrar';
    $('#accountButtonLabel').textContent = label;
    $('.account-avatar').textContent = user ? (label.trim()[0] || 'T').toUpperCase() : '◌';
    $('#authLogout').hidden = !user;
    document.querySelectorAll('.oauth-button, #authForm').forEach(el => el.hidden = !!user);
    document.querySelector('.auth-tabs').hidden = !!user;
    document.querySelector('.auth-divider').hidden = !!user;
    $('.auth-intro').textContent = user ? 'Tu espacio está conectado. Tus herramientas favoritas te acompañan.' : 'Entra o crea una cuenta para llevar tus favoritas contigo.';
    $('#authTitle').textContent = user ? 'Tu cuenta Toolora.' : (mode === 'signup' ? 'Empieza con tu correo.' : 'Qué bueno tenerte aquí.');
    if (workspaceStatus) workspaceStatus.textContent = user ? 'Cuenta conectada' : 'Solo en este dispositivo';
    if (user) say(`Sesión iniciada como ${user.email || 'usuario'}.`);
    syncWorkspace(user);
  }
  function syncWorkspace(user) {
    if (!user) return;
    const meta = user.user_metadata || {};
    const favorites = meta.toolora_favorites;
    const recent = meta.toolora_recent;
    try {
      if (Array.isArray(favorites)) localStorage.setItem('toolora-favorites-v1', JSON.stringify(favorites));
      if (Array.isArray(recent)) localStorage.setItem('toolora-recent-v1', JSON.stringify(recent));
      if (typeof window.renderTooloraPersonalSpace === 'function') window.renderTooloraPersonalSpace();
    } catch (_) {}
  }
  window.TooloraAuth = {
    getUser: () => currentUser,
    async syncData(data) {
      if (!client || !currentUser) return;
      const update = {};
      if (Array.isArray(data.favorites)) update.toolora_favorites = data.favorites;
      if (Array.isArray(data.recent)) update.toolora_recent = data.recent;
      if (Object.keys(update).length) {
        const { data: result, error } = await client.auth.updateUser({ data: update });
        if (!error && result.user) currentUser = result.user;
      }
    }
  };

  accountButton.addEventListener('click', () => openAuth(currentUser ? 'login' : 'login'));
  $('#authClose').addEventListener('click', closeAuth);
  modal.addEventListener('click', event => { if (event.target === modal) closeAuth(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !modal.hidden) closeAuth(); });
  document.querySelectorAll('[data-auth-mode]').forEach(button => button.addEventListener('click', () => setMode(button.dataset.authMode)));

  async function requireClient() {
    if (!configured) {
      say('La conexión de cuentas aún no está configurada. Añade la URL y la anon key de Supabase en supabase-config.js.', true);
      return false;
    }
    if (!window.supabase?.createClient) {
      say('No se pudo cargar el servicio de cuentas. Comprueba tu conexión e inténtalo de nuevo.', true);
      return false;
    }
    if (!client) client = window.supabase.createClient(config.url, config.anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    return true;
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!email.value.trim() || !email.checkValidity()) return say('Escribe un correo electrónico válido.', true);
    if (password.value.length < 8) return say('La contraseña debe tener al menos 8 caracteres.', true);
    if (!(await requireClient())) return;
    submit.disabled = true;
    submit.textContent = mode === 'signup' ? 'Creando cuenta…' : 'Entrando…';
    try {
      const result = mode === 'signup'
        ? await client.auth.signUp({ email: email.value.trim(), password: password.value, options: { emailRedirectTo: location.origin } })
        : await client.auth.signInWithPassword({ email: email.value.trim(), password: password.value });
      if (result.error) throw result.error;
      if (mode === 'signup' && !result.data.session) {
        say('Revisa tu correo. Te enviamos un enlace para confirmar la cuenta.');
      } else {
        paintUser(result.data.user || result.data.session?.user);
        say('¡Listo! Tu cuenta está activa.');
        setTimeout(closeAuth, 900);
      }
    } catch (error) {
      const msg = error?.message || 'No se pudo completar el acceso.';
      say(msg.includes('Invalid login') ? 'El correo o la contraseña no coinciden.' : msg, true);
    } finally {
      submit.disabled = false;
      submit.innerHTML = mode === 'signup' ? 'Crear mi cuenta <span>↗</span>' : 'Entrar a mi cuenta <span>↗</span>'; 
    }
  });
  async function oauth(provider) {
    if (!(await requireClient())) return;
    say('Conectando con ' + (provider === 'google' ? 'Google' : 'Apple') + '…');
    const { error } = await client.auth.signInWithOAuth({ provider, options: { redirectTo: location.origin } });
    if (error) say(error.message, true);
  }
  $('#googleAuth').addEventListener('click', () => oauth('google'));
  $('#appleAuth').addEventListener('click', () => oauth('apple'));
  $('#authLogout').addEventListener('click', async () => {
    if (client) await client.auth.signOut();
    paintUser(null);
    say('Has cerrado sesión.');
  });

  if (configured && window.supabase?.createClient) {
    client = window.supabase.createClient(config.url, config.anonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
    client.auth.getSession().then(({ data }) => paintUser(data.session?.user || null));
    client.auth.onAuthStateChange((_event, session) => paintUser(session?.user || null));
  }
})();
