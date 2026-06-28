<template>
  <div class="page-wrapper">
    <div class="bg-overlay"></div>
    <div class="film-grain"></div>

    <div class="center-container">
      <div class="form-card">

        <!-- Logo sama persis dengan Login & Register -->
        <div class="brand-logo">
          <span class="logo-mark">A</span>
          <span class="logo-text">MOVIE</span>
        </div>

        <h1 class="form-heading">Lupa Password?</h1>
        <p class="form-subtext">
          Masukkan email akunmu dan kami akan mengirimkan <strong>link reset</strong> untukmu.
        </p>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="text"
            id="email"
            v-model="email"
            :class="{ 'input-error': emailError }"
            placeholder="kamu@email.com"
            autocomplete="email"
            @input="emailError = ''; globalError = ''"
            @keyup.enter="handleForgotPassword"
          />
          <p class="field-error" v-if="emailError">{{ emailError }}</p>
        </div>

        <button
          class="btn-submit"
          :disabled="isLoading || sendSuccess"
          @click="handleForgotPassword"
        >
          <span v-if="!isLoading && !sendSuccess">Kirim Link Reset</span>
          <span v-else-if="isLoading" class="btn-loading">
            <span class="spinner"></span> Mengirim...
          </span>
          <span v-else>✓ Link Terkirim</span>
        </button>

        <div class="alert-error" v-if="globalError">
          ⚠️ {{ globalError }}
        </div>

        <div class="alert-success" v-if="sendSuccess">
          📬 Link reset password telah dikirim ke <strong>{{ sentEmail }}</strong>.<br />
          Cek inbox atau folder spam kamu. Mengalihkan dalam 3 detik...
        </div>

        <div class="nav-links-wrap">
          <p class="nav-link-row">
            Ingat passwordnya?
            <RouterLink to="/login" class="link-accent">Login</RouterLink>
          </p>
          <p class="nav-link-row">
            Belum punya akun?
            <RouterLink to="/register" class="link-accent">Register</RouterLink>
          </p>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'ForgotPassword',
  setup() {
    const router      = useRouter();
    const email       = ref('');
    const emailError  = ref('');
    const globalError = ref('');
    const isLoading   = ref(false);
    const sendSuccess = ref(false);
    const sentEmail   = ref('');

    const emailRule = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const handleForgotPassword = async () => {
      emailError.value  = '';
      globalError.value = '';

      if (!email.value.trim()) {
        emailError.value = 'Email tidak boleh kosong.';
        return;
      }
      if (!emailRule.test(email.value.trim())) {
        emailError.value = 'Format email tidak valid.';
        return;
      }

      isLoading.value = true;
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        sentEmail.value   = email.value.trim();
        sendSuccess.value = true;

        // Teruskan email ke halaman reset-password via query param
        setTimeout(() => {
          router.push({ name: 'reset-password', query: { email: sentEmail.value } });
        }, 3000);
      } catch {
        globalError.value = 'Gagal mengirim link reset. Coba lagi.';
      } finally {
        isLoading.value = false;
      }
    };

    return {
      email, emailError, globalError,
      isLoading, sendSuccess, sentEmail,
      handleForgotPassword,
    };
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@400;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.page-wrapper {
  min-height: 100vh; width: 100vw; background-color: #0a0a0c;
  position: relative; display: flex; align-items: center; justify-content: center;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}
.bg-overlay {
  position: fixed; inset: 0;
  background: radial-gradient(ellipse at 50% 30%, rgba(229, 9, 20, 0.08) 0%, transparent 65%);
  pointer-events: none; z-index: 0;
}
.film-grain {
  position: fixed; inset: 0; opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
  pointer-events: none; z-index: 0;
}
.center-container {
  position: relative; z-index: 1; width: 100%;
  display: flex; align-items: center; justify-content: center; padding: 40px 20px;
}
.form-card {
  width: 100%; max-width: 420px;
  background: rgba(20, 20, 20, 0.95); border: 1px solid #2a2a2a;
  border-radius: 10px; padding: 44px 40px; box-shadow: 0 24px 64px rgba(0, 0, 0, 0.8);
}
.brand-logo {
  display: flex; align-items: center; gap: 8px;
  justify-content: center; margin-bottom: 28px;
}
.logo-mark {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 48px; line-height: 1; display: inline-block; transform: scaleY(1.15);
  background: linear-gradient(180deg, #ff3b30 0%, #e50914 45%, #9c060d 100%);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
  color: #e50914; filter: drop-shadow(0 4px 12px rgba(229, 9, 20, 0.6));
}
.logo-text { font-family: 'Bebas Neue', sans-serif; font-size: 32px; color: #fff; letter-spacing: 1px; }
.form-heading {
  font-family: 'Bebas Neue', sans-serif; font-size: 34px; font-weight: 400;
  color: #fff; margin-bottom: 6px; letter-spacing: 1px; text-align: center;
}
.form-subtext { font-size: 14px; color: #8c8c8c; margin-bottom: 30px; line-height: 1.6; text-align: center; }
.form-subtext strong { color: #e50914; }
.form-group { margin-bottom: 20px; }
label {
  display: block; font-size: 11px; color: #8c8c8c; letter-spacing: 1px;
  text-transform: uppercase; margin-bottom: 8px; font-weight: 600;
}
input[type="text"] {
  width: 100%; padding: 13px 16px; background-color: #2a2a2a;
  border: 1px solid #3a3a3a; border-radius: 5px; color: #fff; font-size: 15px;
  outline: none; transition: border-color 0.2s, background 0.2s; font-family: inherit;
}
input[type="text"]:focus { border-color: #e50914; background-color: #323232; }
input[type="text"].input-error { border-color: #e50914; }
input::placeholder { color: #555; }
.field-error { margin-top: 6px; font-size: 12px; color: #e87c7c; }
.btn-submit {
  width: 100%; padding: 14px; background-color: #e50914; border: none; border-radius: 5px;
  color: #fff; font-size: 16px; font-weight: 700; cursor: pointer; letter-spacing: 0.5px;
  transition: background-color 0.2s, transform 0.1s; display: flex; align-items: center;
  justify-content: center; gap: 8px; font-family: inherit; margin-bottom: 16px;
}
.btn-submit:hover:not(:disabled) { background-color: #f40612; transform: translateY(-1px); }
.btn-submit:disabled { background-color: #7a070d; cursor: not-allowed; opacity: 0.7; }
.btn-loading { display: flex; align-items: center; gap: 10px; }
.spinner {
  display: inline-block; width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
  border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.alert-error {
  margin-bottom: 16px; padding: 12px 16px; background: rgba(229, 9, 20, 0.1);
  border: 1px solid rgba(229, 9, 20, 0.3); border-radius: 5px;
  font-size: 13px; color: #e87c7c; line-height: 1.5;
}
.alert-success {
  margin-bottom: 16px; padding: 12px 16px; background: rgba(29, 158, 117, 0.1);
  border: 1px solid rgba(29, 158, 117, 0.35); border-radius: 5px;
  font-size: 13px; color: #1d9e75; line-height: 1.6;
}
.alert-success strong { color: #2ec09a; }
.nav-links-wrap {
  border-top: 1px solid #2a2a2a; padding-top: 16px;
  display: flex; flex-direction: column; gap: 8px;
}
.nav-link-row { text-align: center; font-size: 14px; color: #737373; }
.link-accent { color: #fff; text-decoration: none; font-weight: 600; margin-left: 4px; transition: color 0.2s; }
.link-accent:hover { color: #e50914; }
@media (max-width: 480px) { .form-card { padding: 32px 24px; } }
</style>