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

        <h1 class="form-heading">Reset Password</h1>
        <p class="form-subtext">
          Buat <strong>password baru</strong> untuk akunmu. Pastikan mudah diingat!
        </p>

        <!-- Email (dari query param, read-only) -->
        <div class="form-group" v-if="emailFromQuery">
          <label>Email</label>
          <input type="text" :value="emailFromQuery" disabled class="input-disabled" />
        </div>

        <!-- Password Baru -->
        <div class="form-group">
          <label for="new-password">Password Baru</label>
          <div class="input-wrapper">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="new-password"
              v-model="newPassword"
              :class="{ 'input-error': errors.newPassword }"
              placeholder="Min. 8 karakter, huruf kapital & angka"
              autocomplete="new-password"
              @input="clearError('newPassword')"
            />
            <button type="button" class="toggle-pw" @click="showPassword = !showPassword" tabindex="-1">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
          <!-- Strength bar -->
          <div class="strength-bar" v-if="newPassword.length > 0">
            <div class="strength-fill" :style="{ width: strengthPercent + '%' }" :class="strengthClass"></div>
          </div>
          <span class="strength-label" v-if="newPassword.length > 0">{{ strengthLabel }}</span>
          <p class="field-error" v-if="errors.newPassword">{{ errors.newPassword }}</p>
        </div>

        <!-- Konfirmasi Password -->
        <div class="form-group">
          <label for="confirm-password">Konfirmasi Password</label>
          <div class="input-wrapper">
            <input
              :type="showConfirm ? 'text' : 'password'"
              id="confirm-password"
              v-model="confirmPassword"
              :class="{
                'input-error': errors.confirmPassword,
                'input-match': confirmPassword && !errors.confirmPassword && newPassword === confirmPassword && confirmPassword.length > 0
              }"
              placeholder="Ulangi password baru kamu"
              autocomplete="new-password"
              @input="clearError('confirmPassword')"
            />
            <button type="button" class="toggle-pw" @click="showConfirm = !showConfirm" tabindex="-1">
              {{ showConfirm ? '🙈' : '👁️' }}
            </button>
          </div>
          <p class="field-error" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</p>
          <p class="field-ok" v-if="confirmPassword && !errors.confirmPassword && newPassword === confirmPassword && confirmPassword.length > 0">
            ✓ Password cocok
          </p>
        </div>

        <button class="btn-submit" :disabled="isLoading || resetSuccess" @click="handleReset">
          <span v-if="!isLoading && !resetSuccess">Reset Password</span>
          <span v-else-if="isLoading" class="btn-loading">
            <span class="spinner"></span> Menyimpan...
          </span>
          <span v-else>✓ Password Berhasil Direset</span>
        </button>

        <div class="alert-error" v-if="globalError">
          ⚠️ {{ globalError }}
        </div>

        <div class="alert-success" v-if="resetSuccess">
          ✅ Password berhasil direset! Mengalihkan ke halaman login...
        </div>

        <div class="nav-links-wrap">
          <p class="nav-link-row">
            Kembali ke
            <RouterLink to="/login" class="link-accent">Login</RouterLink>
          </p>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

export default {
  name: 'ResetPassword',
  setup() {
    const router = useRouter();
    const route  = useRoute();

    // Ambil email dari query param yang dikirim ForgotPassword
    const emailFromQuery = computed(() => route.query.email || '');

    const newPassword     = ref('');
    const confirmPassword = ref('');
    const showPassword    = ref(false);
    const showConfirm     = ref(false);
    const isLoading       = ref(false);
    const resetSuccess    = ref(false);
    const globalError     = ref('');
    const errors          = ref({ newPassword: '', confirmPassword: '' });

    const clearError = (field) => {
      errors.value[field] = '';
      globalError.value   = '';
    };

    const validateForm = () => {
      const e = { newPassword: '', confirmPassword: '' };
      let valid = true;

      if (!newPassword.value) {
        e.newPassword = 'Password tidak boleh kosong.'; valid = false;
      } else if (newPassword.value.length < 8) {
        e.newPassword = 'Password minimal 8 karakter.'; valid = false;
      } else if (!/[A-Z]/.test(newPassword.value)) {
        e.newPassword = 'Password harus mengandung minimal 1 huruf kapital.'; valid = false;
      } else if (!/\d/.test(newPassword.value)) {
        e.newPassword = 'Password harus mengandung minimal 1 angka.'; valid = false;
      }

      if (!confirmPassword.value) {
        e.confirmPassword = 'Konfirmasi password tidak boleh kosong.'; valid = false;
      } else if (newPassword.value !== confirmPassword.value) {
        e.confirmPassword = 'Password tidak cocok.'; valid = false;
      }

      errors.value = e;
      return valid;
    };

    const handleReset = async () => {
      globalError.value = '';
      resetSuccess.value = false;
      if (!validateForm()) return;

      isLoading.value = true;
      try {
        // Simulasi API reset password (ganti dengan endpoint backend jika ada)
        await new Promise(resolve => setTimeout(resolve, 1500));
        resetSuccess.value = true;
        setTimeout(() => { router.push('/login'); }, 2000);
      } catch {
        globalError.value = 'Gagal mereset password. Coba lagi.';
      } finally {
        isLoading.value = false;
      }
    };

    const strengthPercent = computed(() => {
      const p = newPassword.value;
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
      emailFromQuery,
      newPassword, confirmPassword,
      showPassword, showConfirm,
      isLoading, resetSuccess, globalError, errors,
      clearError, handleReset,
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
  width: 100%; max-width: 420px;
  background: rgba(20, 20, 20, 0.95); border: 1px solid #2a2a2a;
  border-radius: 10px; padding: 44px 40px; box-shadow: 0 24px 64px rgba(0, 0, 0, 0.8);
}

/* ── Logo sama persis dengan Login & Register ── */
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
input[type="password"].input-match { border-color: #1d9e75; }
.input-disabled {
  width: 100%; padding: 13px 16px; background-color: #1c1c1c;
  border: 1px solid #2a2a2a; border-radius: 5px; color: #666; font-size: 15px;
  font-family: inherit; cursor: not-allowed;
}
input::placeholder { color: #555; }
.field-error { margin-top: 6px; font-size: 12px; color: #e87c7c; }
.field-ok    { margin-top: 6px; font-size: 12px; color: #1d9e75; }
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
  transition: background-color 0.2s, transform 0.1s; display: flex; align-items: center;
  justify-content: center; gap: 8px; font-family: inherit; margin-top: 8px; margin-bottom: 16px;
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
  font-size: 13px; color: #1d9e75; line-height: 1.6; text-align: center;
}

.nav-links-wrap {
  border-top: 1px solid #2a2a2a; padding-top: 16px;
  display: flex; flex-direction: column; gap: 8px;
}
.nav-link-row { text-align: center; font-size: 14px; color: #737373; }
.link-accent { color: #fff; text-decoration: none; font-weight: 600; margin-left: 4px; transition: color 0.2s; }
.link-accent:hover { color: #e50914; }

@media (max-width: 480px) { .form-card { padding: 32px 24px; } }
</style>