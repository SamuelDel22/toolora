(() => {
  'use strict';

  const config = window.TOOLORA_SUPABASE || {};
  const page = document.querySelector('[data-auth-page]');
  const mode = page?.dataset.authPage || 'login';
  const $ = (selector) => document.querySelector(selector);
  const form = $('#authForm');
  const submit = $('#authSubmit');
  const email = $('#authEmail');
  const password = $('#authPassword');
  const message = $('#authMessage');
  const googleButton = $('#googleAuth');
  const divider = document.querySelector('.auth-divider');
  let client = null;
  let currentUser = null;
  let initPromise = null;

  function say(text, error = false) {
    if (!message) return;
    message.textContent = text;
    message.classList.toggle('error', Boolean(error));
    message.setAttribute('role', error ? 'alert' : 'status');
  }

  function setBusy(button, busy, label) {
    if (!button) return;
    button.disabled = busy;
    button.setAttribute('aria-busy', String(busy));
    if (busy) button.dataset.originalLabel = button.innerHTML;
    button.innerHTML = busy ? label : (button.dataset.originalLabel || button.innerHTML);
  }

  function validConfig() {
    const url = String(config.url || '').trim();
    const key = String(config.anonKey || config.publishableKey || '').trim();
    if (!url || !key || /TU-PROYECTO|TU_SUPABASE|YOUR-|YOUR_/i.test(url + key)) {
      throw new Error('Falta configurar Supabase. Revisa supabase-config.js: debe contener la URL del proyecto y la clave pública (anon/publishable).');
    }
    if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)) {
      throw new Error('La URL de Supabase no parece válida. Copia la Project URL exacta desde Project Settings → API.');
    }
    return { url, key };
  }

  function loadSdk() {
    if (window.supabase?.createClient) return Promise.resolve(window.supabase);
    if (initPromise) return initPromise;
    initPromise = new Promise((resolve, reject) => {
      const urls = [
        'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
        'https://unpkg.com/@supabase/supabase-js@2'
      ];
      let index = 0;
      const next = () => {
        if (window.supabase?.createClient) return resolve(window.supabase);
        if (index >= urls.length) return reject(new Error('No se pudo cargar la librería de Supabase. Comprueba tu conexión o bloqueadores de contenido e inténtalo otra vez.'));
        const script = document.createElement('script');
        script.src = urls[index++];
        script.async = true;
        script.onload = () => window.supabase?.createClient ? resolve(window.supabase) : next();
        script.onerror = next;
        document.head.appendChild(script);
      };
      next();
    });
    return initPromise;
  }

  async function getClient() {
    if (client) return client;
    const { url, key } = validConfig();
    const sdk = await loadSdk();
    client = sdk.createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    });
    return client;
  }

  function paintUser(user) {
    currentUser = user || null;
    const label = $('#accountButtonLabel');
    if (label) label.textContent = user ? (user.user_metadata?.full_name || user.email || 'Mi cuenta') : 'Entrar';
    const avatar = $('.account-avatar');
    if (avatar) avatar.textContent = user ? ((user.user_metadata?.full_name || user.email || 'T').trim()[0] || 'T').toUpperCase() : '◌';
    const logout = $('#authLogout');
    if (logout) logout.hidden = !user;
    if (page && user) {
      if (form) form.hidden = true;
      if (googleButton) googleButton.hidden = true;
      if (divider) divider.hidden = true;
      const title = $('#authTitle');
      if (title) title.textContent = 'Tu cuenta está activa.';
      const intro = document.querySelector('.auth-intro');
      if (intro) intro.textContent = 'Tu espacio está conectado. Tus herramientas favoritas te acompañan.';
      say(`Sesión iniciada como ${user.email || 'usuario'}.`);
    }
    if (user) {
      try {
        const meta = user.user_metadata || {};
        if (Array.isArray(meta.toolora_favorites)) localStorage.setItem('toolora-favorites-v1', JSON.stringify(meta.toolora_favorites));
        if (Array.isArray(meta.toolora_recent)) localStorage.setItem('toolora-recent-v1', JSON.stringify(meta.toolora_recent));
      } catch (_) {}
      window.renderTooloraPersonalSpace?.();
      const workspace = document.querySelector('#workspaceStatus');
      if (workspace) workspace.textContent = 'Sincronización con tu cuenta';
      const personalTitle = document.querySelector('#personalTitle');
      if (personalTitle) personalTitle.innerHTML = 'Tu espacio, <span>contigo.</span>';
    }
  }

  window.TooloraAuth = {
    getUser: () => currentUser,
    async syncData(data) {
      const sb = await getClient();
      if (!currentUser) return;
      const update = {};
      if (Array.isArray(data.favorites)) update.toolora_favorites = data.favorites;
      if (Array.isArray(data.recent)) update.toolora_recent = data.recent;
      if (Object.keys(update).length) {
        const { data: result, error } = await sb.auth.updateUser({ data: update });
        if (error) throw error;
        if (result.user) currentUser = result.user;
      }
    }
  };

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const address = email?.value.trim() || '';
      const secret = password?.value || '';
      if (!address || !email.checkValidity()) {
        say('Escribe una dirección de correo válida.', true);
        email?.focus();
        return;
      }
      if (secret.length < 8) {
        say('La contraseña debe tener al menos 8 caracteres.', true);
        password?.focus();
        return;
      }

      setBusy(submit, true, mode === 'signup' ? 'Creando tu cuenta…' : 'Comprobando acceso…');
      say('Conectando con Supabase…');
      try {
        const sb = await getClient();
        if (mode === 'signup') {
          const { data, error } = await sb.auth.signUp({
            email: address,
            password: secret,
            options: { emailRedirectTo: `${location.origin}/entrar.html` }
          });
          if (error) throw error;
          if (data.session && data.user) {
            paintUser(data.user);
            say('¡Cuenta creada! Ya puedes entrar a Toolora.');
            setTimeout(() => { location.href = 'index.html'; }, 1000);
          } else {
            form.hidden = true;
            if (googleButton) googleButton.hidden = true;
            if (divider) divider.hidden = true;
            say('¡Registro recibido! Te enviamos un correo para confirmar tu cuenta. Revisa también Spam o Correo no deseado.');
          }
        } else {
          const { data, error } = await sb.auth.signInWithPassword({ email: address, password: secret });
          if (error) throw error;
          paintUser(data.user);
          say('¡Bienvenido! Iniciaste sesión correctamente.');
          setTimeout(() => { location.href = 'index.html'; }, 700);
        }
      } catch (err) {
        const raw = err?.message || '';
        let friendly = raw || 'No se pudo completar la solicitud.';
        if (/invalid login credentials/i.test(raw)) friendly = 'El correo o la contraseña no coinciden.';
        else if (/email not confirmed/i.test(raw)) friendly = 'Confirma tu correo desde el enlace que te enviamos antes de iniciar sesión.';
        else if (/user already registered/i.test(raw)) friendly = 'Ese correo ya tiene una cuenta. Ve a Iniciar sesión.';
        else if (/password should be at least/i.test(raw)) friendly = 'La contraseña no cumple el mínimo requerido.';
        else if (/failed to fetch|networkerror|load failed/i.test(raw)) friendly = 'No se pudo conectar con Supabase. Revisa la URL del proyecto, tu conexión y la configuración de red.';
        say(friendly, true);
      } finally {
        setBusy(submit, false);
        if (submit && !form.hidden) submit.innerHTML = (mode === 'signup' ? 'Crear mi cuenta' : 'Entrar a mi cuenta') + ' <span>↗</span>';
      }
    });
  }

  if (googleButton) {
    googleButton.addEventListener('click', async () => {
      setBusy(googleButton, true, 'Abriendo Google…');
      say('Preparando el acceso con Google…');
      try {
        const sb = await getClient();
        const { error } = await sb.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${location.origin}/index.html` }
        });
        if (error) throw error;
        // OAuth redirects away; keep the button busy until navigation begins.
        say('Redirigiendo a Google…');
      } catch (err) {
        say(err?.message || 'No se pudo iniciar el acceso con Google.', true);
        setBusy(googleButton, false);
      }
    });
  }

  const logout = $('#authLogout');
  if (logout) {
    logout.addEventListener('click', async () => {
      try {
        const sb = await getClient();
        const { error } = await sb.auth.signOut();
        if (error) throw error;
        currentUser = null;
        location.href = 'entrar.html';
      } catch (err) { say(err?.message || 'No se pudo cerrar la sesión.', true); }
    });
  }

  // Initialize the session and surface configuration/SDK failures immediately.
  (async () => {
    try {
      const sb = await getClient();
      const { data, error } = await sb.auth.getSession();
      if (error) throw error;
      if (data.session?.user) paintUser(data.session.user);
    } catch (err) {
      say(err?.message || 'No se pudo inicializar el acceso.', true);
    }
  })();
})();
