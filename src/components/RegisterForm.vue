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

        <h1 class="form-heading">Register</h1>
        <p class="form-subtext">Mulai perjalanan sinematikmu — <strong>gratis selamanya</strong></p>

        <div class="form-group">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            v-model="username"
            :class="{ 'input-error': errors.username }"
            placeholder="Min. 3 karakter, tanpa angka"
            autocomplete="username"
            @input="clearError('username')"
          />
          <p class="field-error" v-if="errors.username">{{ errors.username }}</p>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="text"
            id="email"
            v-model="email"
            :class="{ 'input-error': errors.email }"
            placeholder="kamu@email.com"
            autocomplete="email"
            @input="clearError('email')"
          />
          <p class="field-error" v-if="errors.email">{{ errors.email }}</p>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="input-wrapper">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              :class="{ 'input-error': errors.password }"
              placeholder="Min. 8 karakter, huruf kapital &amp; angka"
              autocomplete="new-password"
              @input="clearError('password')"
            />
            <button type="button" class="toggle-pw" @click="showPassword = !showPassword" tabindex="-1">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
          <div class="strength-bar" v-if="password.length > 0">
            <div class="strength-fill" :style="{ width: strengthPercent + '%' }" :class="strengthClass"></div>
          </div>
          <span class="strength-label" v-if="password.length > 0">{{ strengthLabel }}</span>
          <p class="field-error" v-if="errors.password">{{ errors.password }}</p>
        </div>

        <div class="form-group">
          <label for="confirm-password">Konfirmasi Password</label>
          <div class="input-wrapper">
            <input
              :type="showConfirm ? 'text' : 'password'"
              id="confirm-password"
              v-model="confirmPassword"
              :class="{
                'input-error': errors.confirmPassword,
                'input-match': confirmPassword && !errors.confirmPassword && password === confirmPassword && confirmPassword.length > 0
              }"
              placeholder="Ulangi password kamu"
              autocomplete="new-password"
              @input="clearError('confirmPassword')"
            />
            <button type="button" class="toggle-pw" @click="showConfirm = !showConfirm" tabindex="-1">
              {{ showConfirm ? '🙈' : '👁️' }}
            </button>
          </div>
          <p class="field-error" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</p>
          <p class="field-ok" v-if="confirmPassword && !errors.confirmPassword && password === confirmPassword && confirmPassword.length > 0">
            ✓ Password cocok
          </p>
        </div>

        <button class="btn-submit" :disabled="isLoading" @click="handleRegister">
          <span v-if="!isLoading">Register</span>
          <span v-else class="btn-loading">
            <span class="spinner"></span> Membuat akun...
          </span>
        </button>

        <div class="alert-error" v-if="globalError">⚠️ {{ globalError }}</div>

        <div class="alert-success" v-if="registerSuccess">
          ✅ Akun berhasil dibuat! Mengalihkan ke halaman login...
        </div>

        <p class="login-link">
          Sudah punya akun?
          <RouterLink to="/login">Login</RouterLink>
        </p>

      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const API_BASE_URL = 'http://localhost:3001/api/auth';

export default {
  name: 'RegisterForm',
  setup() {
    const router = useRouter();

    const username        = ref('');
    const email           = ref('');
    const password        = ref('');
    const confirmPassword = ref('');
    const showPassword    = ref(false);
    const showConfirm     = ref(false);
    const isLoading       = ref(false);
    const globalError     = ref('');
    const registerSuccess = ref(false);
    const errors          = ref({ username: '', email: '', password: '', confirmPassword: '' });

    const clearError = (field) => {
      errors.value[field] = '';
      globalError.value   = '';
    };

    const validateForm = () => {
      const e = { username: '', email: '', password: '', confirmPassword: '' };
      let valid = true;

      if (!username.value.trim()) {
        e.username = 'Username tidak boleh kosong.'; valid = false;
      } else if (username.value.trim().length < 3) {
        e.username = 'Username minimal 3 karakter.'; valid = false;
      } else if (/\d/.test(username.value)) {
        e.username = 'Username tidak boleh mengandung angka.'; valid = false;
      }

      if (!email.value.trim()) {
        e.email = 'Email tidak boleh kosong.'; valid = false;
      } else if (!email.value.includes('@') || !email.value.includes('.')) {
        e.email = 'Format email tidak valid.'; valid = false;
      }

      if (!password.value) {
        e.password = 'Password tidak boleh kosong.'; valid = false;
      } else if (password.value.length < 8) {
        e.password = 'Password minimal 8 karakter.'; valid = false;
      } else if (!/[A-Z]/.test(password.value)) {
        e.password = 'Password harus mengandung minimal 1 huruf kapital.'; valid = false;
      } else if (!/\d/.test(password.value)) {
        e.password = 'Password harus mengandung minimal 1 angka.'; valid = false;
      }

      if (!confirmPassword.value) {
        e.confirmPassword = 'Konfirmasi password tidak boleh kosong.'; valid = false;
      } else if (password.value !== confirmPassword.value) {
        e.confirmPassword = 'Password tidak cocok.'; valid = false;
      }

      errors.value = e;
      return valid;
    };

    const handleRegister = async () => {
      globalError.value     = '';
      registerSuccess.value = false;
      if (!validateForm()) return;

      isLoading.value = true;

      const payload = {
        username:        username.value.trim(),
        email:           email.value.trim(),
        password:        password.value,
        confirmPassword: confirmPassword.value,
      };

      try {
        const response = await fetch(`${API_BASE_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
          if (response.status === 409) {
            errors.value.username = 'Username atau email sudah terdaftar.';
          } else {
            globalError.value =
              result.message || result.error || result.msg ||
              JSON.stringify(result) || 'Registrasi gagal. Coba lagi.';
          }
          return;
        }

        registerSuccess.value = true;
        setTimeout(() => { router.push('/login'); }, 1500);
      } catch (err) {
        globalError.value = 'Tidak dapat terhubung ke server. Pastikan backend sudah berjalan.';
      } finally {
        isLoading.value = false;
      }
    };

    const strengthPercent = computed(() => {
      const p = password.value;
      if (!p.length) return 0;
      let score = 0;
      if (p.length >= 8)          score += 25;
      if (/[A-Z]/.test(p))        score += 25;
      if (/\d/.test(p))           score += 25;
      if (/[^A-Za-z0-9]/.test(p)) score += 25;
      return score;
    });

    const strengthClass = computed(() => {
      const s = strengthPercent.value;
      if (s <= 25) return 'weak';
      if (s <= 50) return 'fair';
      if (s <= 75) return 'good';
      return 'strong';
    });

    const strengthLabel = computed(() => {
      const map = { weak: '🔴 Lemah', fair: '🟠 Cukup', good: '🟡 Baik', strong: '🟢 Kuat' };
      return map[strengthClass.value];
    });

    return {
      username, email, password, confirmPassword,
      showPassword, showConfirm,
      isLoading, globalError, registerSuccess, errors,
      clearError, handleRegister,
      strengthPercent, strengthClass, strengthLabel,
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
  width: 100%; max-width: 440px;
  background: rgba(20, 20, 20, 0.95); border: 1px solid #2a2a2a;
  border-radius: 10px; padding: 44px 40px; box-shadow: 0 24px 64px rgba(0, 0, 0, 0.8);
}

/* ── Logo sama persis dengan Login & Navbar dashboard ── */
.brand-logo {
  display: flex; align-items: center; gap: 8px;
  justify-content: center; margin-bottom: 24px;
}
.logo-mark {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 48px;
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
.form-subtext { font-size: 14px; color: #8c8c8c; margin-bottom: 26px; line-height: 1.5; text-align: center; }
.form-subtext strong { color: #e50914; }
.form-group { margin-bottom: 16px; }
label {
  display: block; font-size: 11px; color: #8c8c8c; letter-spacing: 1px;
  text-transform: uppercase; margin-bottom: 7px; font-weight: 600;
}
input[type="text"], input[type="password"] {
  width: 100%; padding: 13px 16px; background-color: #2a2a2a;
  border: 1px solid #3a3a3a; border-radius: 5px; color: #fff; font-size: 14px;
  outline: none; transition: border-color 0.2s, background 0.2s; font-family: inherit;
}
input[type="text"]:focus, input[type="password"]:focus { border-color: #e50914; background-color: #323232; }
input[type="text"].input-error, input[type="password"].input-error { border-color: #e50914; }
input[type="password"].input-match { border-color: #1d9e75; }
input::placeholder { color: #555; }
.field-error { margin-top: 5px; font-size: 12px; color: #e87c7c; }
.field-ok    { margin-top: 5px; font-size: 12px; color: #1d9e75; }
.input-wrapper { position: relative; }
.input-wrapper input { padding-right: 44px; }
.toggle-pw {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; font-size: 16px;
  opacity: 0.5; transition: opacity 0.2s; padding: 0;
}
.toggle-pw:hover { opacity: 1; }
.strength-bar { height: 3px; background: #222; border-radius: 2px; margin-top: 8px; overflow: hidden; }
.strength-fill { height: 100%; border-radius: 2px; transition: width 0.3s ease, background-color 0.3s ease; }
.strength-fill.weak   { background-color: #e50914; }
.strength-fill.fair   { background-color: #ef9f27; }
.strength-fill.good   { background-color: #e8c76a; }
.strength-fill.strong { background-color: #1d9e75; }
.strength-label { font-size: 11px; color: #666; margin-top: 4px; display: block; }
.btn-submit {
  width: 100%; padding: 14px; background-color: #e50914; border: none; border-radius: 5px;
  color: #fff; font-size: 16px; font-weight: 700; cursor: pointer; letter-spacing: 0.5px;
  margin-top: 8px; margin-bottom: 16px;
  transition: background-color 0.2s, transform 0.1s; display: flex;
  align-items: center; justify-content: center; gap: 8px; font-family: inherit;
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
  margin-bottom: 14px; padding: 12px 16px; background: rgba(229, 9, 20, 0.1);
  border: 1px solid rgba(229, 9, 20, 0.3); border-radius: 5px;
  font-size: 13px; color: #e87c7c; line-height: 1.5;
}
.alert-success {
  margin-bottom: 14px; padding: 12px 16px; background: rgba(29, 158, 117, 0.1);
  border: 1px solid rgba(29, 158, 117, 0.35); border-radius: 5px;
  font-size: 13px; color: #1d9e75; line-height: 1.5; text-align: center;
}
.login-link { text-align: center; font-size: 14px; color: #737373; margin-top: 4px; }
.login-link a { color: #fff; text-decoration: none; font-weight: 600; transition: color 0.2s; }
.login-link a:hover { color: #e50914; }
@media (max-width: 480px) { .form-card { padding: 32px 24px; } }
</style>