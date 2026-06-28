<template>
  <div class="page-wrapper">
    <div class="bg-overlay"></div>
    <div class="film-grain"></div>

    <div class="center-container">
      <div class="form-card">

        <div class="brand-logo">
          <span class="logo-mark">A</span>
          <span class="logo-text">MOVIE</span>
        </div>

        <h1 class="form-heading">Login</h1>
        <p class="form-subtext">Lanjutkan menonton <strong>10M+ judul</strong> favoritmu</p>

        <div class="form-group">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            v-model="username"
            :class="{ 'input-error': errors.username }"
            placeholder="Username kamu"
            autocomplete="username"
            @input="clearError('username')"
          />
          <p class="field-error" v-if="errors.username">{{ errors.username }}</p>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="input-wrapper">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              :class="{ 'input-error': errors.password }"
              placeholder="••••••••"
              autocomplete="current-password"
              @input="clearError('password')"
            />
            <button type="button" class="toggle-pw" @click="showPassword = !showPassword" tabindex="-1">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
          <p class="field-error" v-if="errors.password">{{ errors.password }}</p>
        </div>

        <div class="form-row">
          <label class="remember-label">
            <input type="checkbox" v-model="rememberMe" class="remember-cb" />
            <span>Ingat saya</span>
          </label>
          <RouterLink to="/forgot-password" class="forgot-link">Forgot password?</RouterLink>
        </div>

        <button class="btn-submit" :disabled="isLoading" @click="handleLogin">
          <span v-if="!isLoading">Login</span>
          <span v-else class="btn-loading">
            <span class="spinner"></span> Login...
          </span>
        </button>

        <div class="alert-error" v-if="globalError">
          ⚠️ {{ globalError }}
        </div>

        <p class="register-label">
          Belum punya akun?
          <RouterLink to="/register">Register</RouterLink>
        </p>

      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const API_BASE_URL = 'http://localhost:3001/api/auth';

export default {
  name: 'LoginForm',
  setup() {
    const username     = ref('');
    const password     = ref('');
    const showPassword = ref(false);
    const rememberMe   = ref(false);
    const isLoading    = ref(false);
    const globalError  = ref('');
    const errors       = reactive({ username: '', password: '' });

    const router    = useRouter();
    const authStore = useAuthStore();

    const clearError = (field) => { errors[field] = ''; globalError.value = ''; };

    const validateForm = () => {
      let valid = true;
      errors.username = '';
      errors.password = '';
      if (!username.value.trim()) {
        errors.username = 'Username tidak boleh kosong.';
        valid = false;
      } else if (username.value.trim().length < 3) {
        errors.username = 'Username minimal 3 karakter.';
        valid = false;
      }
      if (!password.value) {
        errors.password = 'Password tidak boleh kosong.';
        valid = false;
      } else if (password.value.length < 6) {
        errors.password = 'Password minimal 6 karakter.';
        valid = false;
      }
      return valid;
    };

    const handleLogin = async () => {
      globalError.value = '';
      if (!validateForm()) return;
      isLoading.value = true;
      try {
        const response = await fetch(`${API_BASE_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username.value.trim(),
            password: password.value,
          }),
        });
        const result = await response.json();
        if (!response.ok) {
          if (response.status === 401) globalError.value = 'Username atau password salah.';
          else if (response.status === 404) errors.username = 'Akun tidak ditemukan.';
          else globalError.value = result.message || 'Login gagal. Coba lagi.';
          return;
        }
        authStore.login(username.value.trim());
        router.push('/dashboard');
      } catch {
        globalError.value = 'Tidak dapat terhubung ke server. Pastikan backend sudah berjalan.';
      } finally {
        isLoading.value = false;
      }
    };

    return {
      username, password, showPassword, rememberMe, isLoading, globalError, errors,
      clearError, handleLogin,
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

/* ── Logo persis sama dengan Navbar dashboard ── */
.brand-logo {
  display: flex; align-items: center; gap: 8px;
  justify-content: center; margin-bottom: 28px;
}
.logo-mark {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 48px;           /* besar seperti Netflix */
  line-height: 1;
  display: inline-block;
  transform: scaleY(1.15);
  background: linear-gradient(180deg, #ff3b30 0%, #e50914 45%, #9c060d 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: #e50914;
  filter: drop-shadow(0 4px 12px rgba(229, 9, 20, 0.6));
}
.logo-text {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 32px; color: #fff; letter-spacing: 1px;
}

.form-heading {
  font-family: 'Bebas Neue', sans-serif; font-size: 34px; font-weight: 400;
  color: #fff; margin-bottom: 6px; letter-spacing: 1px; text-align: center;
}
.form-subtext { font-size: 14px; color: #8c8c8c; margin-bottom: 30px; line-height: 1.5; text-align: center; }
.form-subtext strong { color: #e50914; }
.form-group { margin-bottom: 18px; }
label {
  display: block; font-size: 11px; color: #8c8c8c; letter-spacing: 1px;
  text-transform: uppercase; margin-bottom: 8px; font-weight: 600;
}
input[type="text"], input[type="password"] {
  width: 100%; padding: 13px 16px; background-color: #2a2a2a;
  border: 1px solid #3a3a3a; border-radius: 5px; color: #fff; font-size: 15px;
  outline: none; transition: border-color 0.2s, background 0.2s; font-family: inherit;
}
input[type="text"]:focus, input[type="password"]:focus { border-color: #e50914; background-color: #323232; }
input[type="text"].input-error, input[type="password"].input-error { border-color: #e50914; }
input::placeholder { color: #555; }
.field-error { margin-top: 6px; font-size: 12px; color: #e87c7c; }
.input-wrapper { position: relative; }
.input-wrapper input { padding-right: 44px; }
.toggle-pw {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; font-size: 16px;
  opacity: 0.5; transition: opacity 0.2s; padding: 0;
}
.toggle-pw:hover { opacity: 1; }
.form-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.remember-label {
  display: flex; align-items: center; gap: 8px; font-size: 13px; color: #aaa;
  cursor: pointer; text-transform: none; letter-spacing: 0; font-weight: 400;
}
.remember-cb { width: auto; padding: 0; background: none; border: none; accent-color: #e50914; }
.forgot-link { font-size: 13px; color: #aaa; text-decoration: none; transition: color 0.2s; }
.forgot-link:hover { color: #e50914; }
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
.register-label { text-align: center; font-size: 14px; color: #737373; margin-top: 4px; }
.register-label a { color: #fff; text-decoration: none; font-weight: 600; transition: color 0.2s; }
.register-label a:hover { color: #e50914; }
@media (max-width: 480px) { .form-card { padding: 32px 24px; } }
</style>