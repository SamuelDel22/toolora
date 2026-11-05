(() => {
  const config = window.TOOLORA_SUPABASE || {};
  const configured = Boolean(config.url && config.anonKey &&
    !String(config.url).includes('TU-PROYECTO') &&
    !String(config.anonKey).includes('TU_SUPABASE'));
  const $ = (selector) => document.querySelector(selector);
  const page = document.querySelector('[data-auth-page]');
  const mode = page?.dataset.authPage || 'login';
  const form = $('#authForm');
  const submit = $('#authSubmit');
  const email = $('#authEmail');
  const password = $('#authPassword');
  const message = $('#authMessage');
  const accountButton = $('#accountButton');
  const accountLabel = $('#accountButtonLabel');
  let client = null;
  let currentUser = null;

  function say(text, error = false) {
    if (!message) return;
    message.textContent = text;
    message.classList.toggle('error', error);
  }

  function syncWorkspace(user) {
    if (!user) return;
    const meta = user.user_metadata || {};
    try {
      if (Array.isArray(meta.toolora_favorites))
        localStorage.setItem('toolora-favorites-v1', JSON.stringify(meta.toolora_favorites));
      if (Array.isArray(meta.toolora_recent))
        localStorage.setItem('toolora-recent-v1', JSON.stringify(meta.toolora_recent));
      if (typeof window.renderTooloraPersonalSpace === 'function')
        window.renderTooloraPersonalSpace();
    } catch (_) {}
  }

  function paintUser(user) {
    currentUser = user || null;
    if (accountLabel) accountLabel.textContent = user
      ? (user.user_metadata?.full_name || user.email || 'Mi cuenta')
      : 'Entrar';
    const avatar = $('.account-avatar');
    if (avatar) avatar.textContent = user
      ? ((user.user_metadata?.full_name || user.email || 'T').trim()[0] || 'T').toUpperCase()
      : '◌';
    const logout = $('#authLogout');
    if (logout) logout.hidden = !user;
    if (form) form.hidden = Boolean(user);
    const oauth = $('#googleAuth');
    if (oauth) oauth.hidden = Boolean(user);
    const divider = document.querySelector('.auth-divider');
    if (divider) divider.hidden = Boolean(user);
    const intro = document.querySelector('.auth-intro');
    if (intro && user) intro.textContent = 'Tu espacio está conectado. Tus herramientas favoritas te acompañan.';
    if (page && user) {
      $('#authTitle').textContent = 'Tu cuenta está activa.';
      say(`Sesión iniciada como ${user.email || 'usuario'}.`);
    }
    const status = $('#workspaceStatus');
    if (status) status.textContent = user ? 'Cuenta conectada' : 'Solo en este dispositivo';
    syncWorkspace(user);
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

  if (accountButton) {
    accountButton.addEventListener('click', () => {
      location.href = currentUser ? 'entrar.html' : 'entrar.html';
    });
  }

  async function requireClient() {
    if (!configured) {
      say('La conexión con Supabase no está configurada. Revisa supabase-config.js.', true);
      return false;
    }
    if (!window.supabase?.createClient) {
      say('No se pudo cargar el servicio de cuentas. Comprueba tu conexión e inténtalo de nuevo.', true);
      return false;
    }
    if (!client) {
      client = window.supabase.createClient(config.url, config.anonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
    }
    return true;
  }

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!email.value.trim() || !email.checkValidity()) {
        say('Escribe una dirección de correo válida.', true);
        email.focus();
        return;
      }
      if (password.value.length < 8) {
        say('La contraseña debe tener al menos 8 caracteres.', true);
        password.focus();
        return;
      }
      if (!(await requireClient())) return;

      submit.disabled = true;
      submit.innerHTML = mode === 'signup' ? 'Creando tu cuenta…' : 'Iniciando sesión…';
      say('');
      try {
        if (mode === 'signup') {
          const { data, error } = await client.auth.signUp({
            email: email.value.trim(),
            password: password.value,
            options: { emailRedirectTo: `${location.origin}/entrar.html` }
          });
          if (error) throw error;
          if (!data.session) {
            form.hidden = true;
            $('#googleAuth').hidden = true;
            document.querySelector('.auth-divider').hidden = true;
            say('¡Ya casi! Te enviamos un enlace de confirmación. Revisa tu bandeja de entrada y la carpeta de spam.');
          } else {
            paintUser(data.user || data.session.user);
            say('¡Cuenta creada! Ya puedes usar tu espacio personal.');
            setTimeout(() => location.href = 'index.html', 1100);
          }
        } else {
          const { data, error } = await client.auth.signInWithPassword({
            email: email.value.trim(),
            password: password.value
          });
          if (error) throw error;
          paintUser(data.user);
          say('¡Bienvenido de nuevo! Acceso correcto.');
          setTimeout(() => location.href = 'index.html', 700);
        }
      } catch (error) {
        const raw = error?.message || '';
        let friendly = raw || 'No se pudo completar la solicitud. Inténtalo de nuevo.';
        if (/invalid login credentials/i.test(raw)) friendly = 'El correo o la contraseña no coinciden.';
        else if (/email not confirmed/i.test(raw)) friendly = 'Primero confirma tu correo desde el enlace que te enviamos.';
        else if (/user already registered/i.test(raw)) friendly = 'Este correo ya tiene una cuenta. Inicia sesión.';
        else if (/password should be at least/i.test(raw)) friendly = 'La contraseña debe tener al menos 8 caracteres.';
        say(friendly, true);
      } finally {
        submit.disabled = false;
        if (form && !form.hidden) submit.innerHTML = (mode === 'signup' ? 'Crear mi cuenta' : 'Entrar a mi cuenta') + ' <span>↗</span>';
      }
    });
  }

  const googleButton = $('#googleAuth');
  if (googleButton) {
    googleButton.addEventListener('click', async () => {
      if (!(await requireClient())) return;
      googleButton.disabled = true;
      say('Conectando con Google…');
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${location.origin}/index.html` }
      });
      if (error) {
        say(error.message, true);
        googleButton.disabled = false;
      }
    });
  }

  const logout = $('#authLogout');
  if (logout) {
    logout.addEventListener('click', async () => {
      if (client) {
        const { error } = await client.auth.signOut();
        if (error) return say(error.message, true);
      }
      paintUser(null);
      say('Has cerrado sesión.');
    });
  }

  if (configured && window.supabase?.createClient) {
    client = window.supabase.createClient(config.url, config.anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    client.auth.getSession().then(({ data, error }) => {
      if (!error) paintUser(data.session?.user || null);
    });
    client.auth.onAuthStateChange((_event, session) => paintUser(session?.user || null));
  }
})();
