<template>
  <div class="dash-page">
    <div class="film-grain"></div>

    <!-- ═══ Navbar ═══ -->
    <header class="navbar" :class="{ scrolled: isScrolled }">
      <div class="nav-left">
        <div class="brand-logo">
          <span class="logo-mark small">A</span>
          <span class="logo-text">MOVIE</span>
        </div>
        <nav class="nav-links">
          <button class="nav-link active">Beranda</button>
          <button class="nav-link" @click="scrollToRows">Jelajahi</button>
        </nav>
      </div>
      <div class="nav-right">
        <div class="search-box" :class="{ open: searchOpen }">
          <button class="icon-btn" @click="toggleSearch">🔍</button>
          <input
            v-if="searchOpen"
            v-model="searchQuery"
            @keyup.enter="runSearch"
            placeholder="Cari judul..."
            autofocus
          />
        </div>
        <div class="user-info">
          <div class="avatar-circle">{{ initials }}</div>
          <span class="user-name">{{ displayName }}</span>
        </div>
        <button class="btn-logout" @click="handleLogout">⏏ Logout</button>
      </div>
    </header>

    <!-- ═══ Hero Rotator ═══ -->
    <section
      class="hero"
      v-if="heroMovie"
      :style="!heroPlayingTrailer ? getBackdropStyle(heroMovie) : {}"
    >
      <iframe
        v-if="heroPlayingTrailer && heroTrailerKey"
        class="hero-video"
        :src="`https://www.youtube.com/embed/${heroTrailerKey}?autoplay=1&mute=${heroMuted ? 1 : 0}&controls=0&modestbranding=1&loop=1&playlist=${heroTrailerKey}&rel=0&playsinline=1`"
        frameborder="0"
        allow="autoplay; encrypted-media"
        title="trailer preview"
      ></iframe>
      <div class="hero-gradient"></div>
      <div class="hero-content">
        <span class="meta-code">
          REL {{ getYear(heroMovie.release_date) }} · RATING {{ heroMovie.vote_average?.toFixed(1) }} · {{ heroMovie.original_language?.toUpperCase() }}
        </span>
        <h1 class="hero-title">{{ heroMovie.title }}</h1>
        <p class="hero-overview">{{ truncate(heroMovie.overview, 220) }}</p>
        <div class="hero-actions">
          <button class="btn-play" @click="openDetail(heroMovie)">▶ Lihat Detail</button>
          <button class="btn-info" @click="openTMDB(heroMovie.id)">ⓘ Info di TMDB</button>
          <button
            v-if="heroPlayingTrailer && heroTrailerKey"
            class="btn-mute"
            @click="heroMuted = !heroMuted"
          >{{ heroMuted ? '🔇' : '🔊' }}</button>
        </div>
      </div>
      <div class="hero-dots">
        <span
          v-for="(m, i) in heroPool"
          :key="m.id"
          :class="{ active: i === heroIndex }"
          @click="jumpToHero(i)"
        ></span>
      </div>
      <div class="hero-progress">
        <div class="hero-progress-bar" :key="heroIndex"></div>
      </div>
    </section>
    <section class="hero hero-empty" v-else>
      <div class="loading-reel">
        <div class="reel-spinner"></div>
        <p>Menyiapkan tayangan...</p>
      </div>
    </section>

    <div class="sprocket-divider"></div>

    <div class="welcome-banner" ref="rowsArea">
      <span class="welcome-text">Selamat datang, <strong>{{ displayName }}</strong> 👋</span>
      <span class="meta-code">10M+ JUDUL TERSEDIA</span>
    </div>

    <!-- ═══ Rows Film — Netflix Style Trailer Cards ═══ -->
    <main class="rows-area">
      <section v-for="row in rows" :key="row.key" class="movie-row">
        <h2 class="row-title">{{ row.title }}</h2>

        <div class="row-track-wrap">
          <button class="row-nav left" @click="scrollRow(row.key, -1)">‹</button>
          <div class="row-track" :ref="el => setRowRef(row.key, el)">

            <div class="row-loading" v-if="row.loading">
              <span class="reel-spinner small"></span>
            </div>

            <template v-else>
              <!-- ── Trailer Card: landscape 16:9, autoplay trailer, judul selalu tampil ── -->
              <div
                class="trailer-card"
                v-for="movie in row.movies"
                :key="movie.id"
                @click="openDetail(movie)"
                @mouseenter="handleCardEnter(movie)"
                @mouseleave="handleCardLeave(movie)"
              >
                <!-- Backdrop sebagai thumbnail sebelum trailer ready -->
                <img
                  class="card-thumb"
                  :src="getBackdropUrl(movie.backdrop_path) || getPosterUrl(movie.poster_path)"
                  :alt="movie.title"
                  loading="lazy"
                  @error="handleImgError"
                  v-show="!(activeTrailerCardId === movie.id && trailerCache[movie.id])"
                />

                <!-- Trailer iframe — autoplay saat hover/aktif -->
                <iframe
                  v-if="activeTrailerCardId === movie.id && trailerCache[movie.id]"
                  class="card-trailer"
                  :src="`https://www.youtube.com/embed/${trailerCache[movie.id]}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${trailerCache[movie.id]}&rel=0&playsinline=1`"
                  frameborder="0"
                  allow="autoplay; encrypted-media"
                  title="trailer"
                ></iframe>

                <!-- Loading trailer indicator -->
                <div class="card-trailer-loading" v-if="activeTrailerCardId === movie.id && trailerLoading[movie.id]">
                  <div class="reel-spinner small"></div>
                </div>

                <!-- Gradient overlay bawah -->
                <div class="card-gradient"></div>

                <!-- Info film — SELALU TAMPIL, tidak perlu hover -->
                <div class="card-info">
                  <h3 class="card-title">{{ movie.title }}</h3>
                  <div class="card-meta">
                    <span class="card-year">{{ getYear(movie.release_date) }}</span>
                    <span class="card-dot">·</span>
                    <span class="card-rating">★ {{ movie.vote_average?.toFixed(1) }}</span>
                  </div>
                  <div class="card-actions" @click.stop>
                    <button class="card-btn play" @click.stop="openDetail(movie)">▶ Detail</button>
                    <button class="card-btn info" @click.stop="openTMDB(movie.id)">ⓘ TMDB</button>
                  </div>
                </div>

                <!-- Badge "LIVE TRAILER" saat trailer main -->
                <div class="card-live-badge" v-if="activeTrailerCardId === movie.id && trailerCache[movie.id]">
                  ● TRAILER
                </div>
              </div>

              <p class="row-empty" v-if="!row.movies.length">Tidak ada judul untuk kategori ini.</p>
            </template>
          </div>
          <button class="row-nav right" @click="scrollRow(row.key, 1)">›</button>
        </div>
      </section>
    </main>

    <footer class="dash-footer">
      <span class="logo-text small">AMOVIE</span>
      <p>Data film disediakan oleh TMDB. Dibuat untuk pecinta film.</p>
    </footer>

    <!-- ═══ Movie Detail Modal ═══ -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div class="modal-overlay" v-if="selectedMovie" @click.self="closeDetail">
          <div class="modal-card">
            <button class="modal-close-btn" @click="closeDetail">✕</button>
            <div class="modal-hero" :style="getBackdropStyle(selectedMovie)">
              <div class="modal-hero-gradient"></div>
              <div class="modal-hero-info">
                <span class="modal-genre-badge">AMOVIE</span>
                <h2 class="modal-movie-title">{{ selectedMovie.title }}</h2>
                <div class="modal-movie-meta">
                  <span>{{ getYear(selectedMovie.release_date) }}</span>
                  <span class="dot">·</span>
                  <span class="rating-star">★ {{ selectedMovie.vote_average?.toFixed(1) }}</span>
                  <span class="dot">·</span>
                  <span>{{ selectedMovie.vote_count?.toLocaleString() }} votes</span>
                </div>
                <div class="modal-actions">
                  <button class="modal-play-btn" @click="openTMDB(selectedMovie.id)">▶ Buka di TMDB</button>
                  <button class="modal-save-btn">＋ Watchlist</button>
                </div>
              </div>
            </div>
            <div class="modal-body">
              <p class="modal-overview">{{ selectedMovie.overview || 'Tidak ada deskripsi tersedia.' }}</p>
              <div class="modal-info-grid">
                <div class="info-item">
                  <span class="info-label">Popularity</span>
                  <span class="info-val">{{ Math.round(selectedMovie.popularity) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Bahasa</span>
                  <span class="info-val">{{ selectedMovie.original_language?.toUpperCase() }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Rilis</span>
                  <span class="info-val">{{ formatDate(selectedMovie.release_date) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Rating</span>
                  <span class="info-val info-rating">★ {{ selectedMovie.vote_average?.toFixed(1) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const TMDB_API_KEY = '784498737199548b08a7ca499f6678cb';
const TMDB_BASE    = 'https://api.themoviedb.org/3';
const IMG_BASE_W   = 'https://image.tmdb.org/t/p/w342';
const IMG_BASE_BD  = 'https://image.tmdb.org/t/p/w780';   // landscape backdrop
const IMG_BASE_ORI = 'https://image.tmdb.org/t/p/original';

const HERO_DURATION = 10000; // 10 detik

const ROW_DEFS = [
  { key: 'trending', title: 'Trending Minggu Ini', genreId: null },
  { key: 28,    title: 'Action'    },
  { key: 35,    title: 'Comedy'    },
  { key: 18,    title: 'Drama'     },
  { key: 27,    title: 'Horror'    },
  { key: 10749, title: 'Romance'   },
  { key: 878,   title: 'Sci-Fi'    },
  { key: 53,    title: 'Thriller'  },
  { key: 16,    title: 'Animation' },
];

export default {
  name: 'DashboardPage',
  setup() {
    const router    = useRouter();
    const authStore = useAuthStore();

    const displayName = computed(() => authStore.username || 'Pengguna');
    const initials    = computed(() => displayName.value.trim().slice(0, 2).toUpperCase());

    const handleLogout = () => {
      if (typeof authStore.logout === 'function') authStore.logout();
      router.push('/login');
    };

    const isScrolled   = ref(false);
    const onScroll     = () => { isScrolled.value = window.scrollY > 10; };
    const searchOpen   = ref(false);
    const searchQuery  = ref('');
    const toggleSearch = () => { searchOpen.value = !searchOpen.value; };
    const runSearch    = () => { console.log('Cari:', searchQuery.value); };

    // ── Hero ──
    const heroPool  = ref([]);
    const heroIndex = ref(0);
    const heroMovie = computed(() => heroPool.value[heroIndex.value] || null);
    let heroTimer   = null;

    const rows = reactive(
      ROW_DEFS.map(r => ({
        key: r.key,
        title: r.title,
        genreId: r.genreId !== undefined ? r.genreId : r.key,
        movies: [],
        loading: true,
      }))
    );
    rows[0].genreId = null;

    const rowRefs   = {};
    const setRowRef = (key, el) => { if (el) rowRefs[key] = el; };
    const scrollRow = (key, dir) => {
      const el = rowRefs[key];
      if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
    };

    const fetchRow = async (row) => {
      try {
        const url = row.genreId
          ? `${TMDB_BASE}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${row.genreId}&sort_by=popularity.desc&language=id-ID&page=1`
          : `${TMDB_BASE}/trending/movie/week?api_key=${TMDB_API_KEY}&language=id-ID`;
        const res  = await fetch(url);
        if (!res.ok) throw new Error();
        const data = await res.json();
        let results = data.results || [];
        if (results.length < 5 && row.genreId) {
          const res2  = await fetch(`${TMDB_BASE}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${row.genreId}&sort_by=popularity.desc&language=en-US&page=1`);
          results = (await res2.json()).results || [];
        }
        row.movies = results;
      } catch { row.movies = []; }
      finally  { row.loading = false; }
    };

    const loadAll = async () => {
      const trendingRow = rows.find(r => r.key === 'trending');
      await fetchRow(trendingRow);
      heroPool.value = trendingRow.movies.slice(0, 6);
      rows.filter(r => r.key !== 'trending').forEach(r => fetchRow(r));
    };

    const rowsArea     = ref(null);
    const scrollToRows = () => rowsArea.value?.scrollIntoView({ behavior: 'smooth' });
    const truncate     = (txt, n) => !txt ? 'Tidak ada deskripsi.' : txt.length > n ? txt.slice(0, n).trim() + '…' : txt;

    const selectedMovie = ref(null);
    const openDetail    = (m) => { selectedMovie.value = m; document.body.style.overflow = 'hidden'; };
    const closeDetail   = ()  => { selectedMovie.value = null; document.body.style.overflow = ''; };

    const getPosterUrl     = (p) => p ? `${IMG_BASE_W}${p}` : 'https://via.placeholder.com/342x513/141414/555?text=No+Image';
    const getBackdropUrl   = (b) => b ? `${IMG_BASE_BD}${b}` : null;
    const getBackdropStyle = (m) => m?.backdrop_path ? { backgroundImage: `url(${IMG_BASE_ORI}${m.backdrop_path})`, backgroundSize: 'cover', backgroundPosition: 'center top' } : {};
    const getYear          = (d) => d?.slice(0, 4) || '—';
    const formatDate       = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
    const handleImgError   = (e) => { e.target.src = 'https://via.placeholder.com/780x440/141414/555?text=No+Image'; };
    const openTMDB         = (id) => window.open(`https://www.themoviedb.org/movie/${id}`, '_blank');

    /* ════════════════════════════════════════════════════════════════
       TRAILER CACHE — dipakai oleh hero DAN trailer cards
    ════════════════════════════════════════════════════════════════ */
    const trailerCache   = reactive({});
    const trailerLoading = reactive({});

    const fetchTrailerKey = async (movie) => {
      if (!movie) return null;
      if (Object.prototype.hasOwnProperty.call(trailerCache, movie.id)) return trailerCache[movie.id];
      trailerLoading[movie.id] = true;
      try {
        let res  = await fetch(`${TMDB_BASE}/movie/${movie.id}/videos?api_key=${TMDB_API_KEY}&language=id-ID`);
        let data = await res.json();
        let vids = data.results || [];
        if (!vids.length) {
          res  = await fetch(`${TMDB_BASE}/movie/${movie.id}/videos?api_key=${TMDB_API_KEY}&language=en-US`);
          data = await res.json();
          vids = data.results || [];
        }
        const trailer =
          vids.find(v => v.site === 'YouTube' && v.type === 'Trailer') ||
          vids.find(v => v.site === 'YouTube' && v.type === 'Teaser')  ||
          vids.find(v => v.site === 'YouTube');
        trailerCache[movie.id] = trailer ? trailer.key : null;
      } catch {
        trailerCache[movie.id] = null;
      } finally {
        trailerLoading[movie.id] = false;
      }
      return trailerCache[movie.id];
    };

    /* ════════════════════════════════════════════════════════════════
       TRAILER CARDS — hover untuk play, judul selalu tampil
       activeTrailerCardId: film mana yang trailernya aktif sekarang
    ════════════════════════════════════════════════════════════════ */
    const activeTrailerCardId = ref(null);
    let cardHoverTimer        = null;

    const handleCardEnter = (movie) => {
      clearTimeout(cardHoverTimer);
      cardHoverTimer = setTimeout(async () => {
        await fetchTrailerKey(movie);
        activeTrailerCardId.value = movie.id;
      }, 600);
    };

    const handleCardLeave = (movie) => {
      clearTimeout(cardHoverTimer);
      if (activeTrailerCardId.value === movie.id) activeTrailerCardId.value = null;
    };

    /* ════════════════════════════════════════════════════════════════
       HERO TRAILER — autoplay, ganti tiap 10 detik
    ════════════════════════════════════════════════════════════════ */
    const heroTrailerKey     = ref(null);
    const heroPlayingTrailer = ref(false);
    const heroMuted          = ref(true);
    let heroTrailerDelay     = null;

    const goToHero = (index) => {
      heroPlayingTrailer.value = false;
      heroTrailerKey.value     = null;
      clearTimeout(heroTrailerDelay);
      heroIndex.value = index;
    };

    const jumpToHero = (i) => {
      clearInterval(heroTimer);
      goToHero(i);
      heroTimer = setInterval(advanceHero, HERO_DURATION);
    };

    const advanceHero = () => {
      if (!heroPool.value.length) return;
      goToHero((heroIndex.value + 1) % heroPool.value.length);
    };

    watch(heroMovie, (movie) => {
      clearTimeout(heroTrailerDelay);
      heroPlayingTrailer.value = false;
      heroTrailerKey.value     = null;
      if (!movie) return;
      heroTrailerDelay = setTimeout(async () => {
        const key = await fetchTrailerKey(movie);
        if (key && heroMovie.value?.id === movie.id) {
          heroTrailerKey.value     = key;
          heroPlayingTrailer.value = true;
        }
      }, 300);
    });

    onMounted(() => {
      window.addEventListener('scroll', onScroll);
      loadAll();
      heroTimer = setInterval(advanceHero, HERO_DURATION);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('scroll', onScroll);
      clearInterval(heroTimer);
      clearTimeout(cardHoverTimer);
      clearTimeout(heroTrailerDelay);
    });

    return {
      displayName, initials, handleLogout,
      isScrolled, searchOpen, searchQuery, toggleSearch, runSearch,
      heroPool, heroIndex, heroMovie, jumpToHero,
      rows, rowsArea, setRowRef, scrollRow,
      truncate, selectedMovie, openDetail, closeDetail,
      getPosterUrl, getBackdropUrl, getBackdropStyle, getYear, formatDate, handleImgError, openTMDB,
      scrollToRows,
      trailerCache, trailerLoading,
      activeTrailerCardId, handleCardEnter, handleCardLeave,
      heroTrailerKey, heroPlayingTrailer, heroMuted,
    };
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@400;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.dash-page {
  width: 100%; max-width: 100%; min-height: 100vh; overflow-x: hidden;
  background-color: #0a0a0c; color: #fff;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}
.film-grain {
  position: fixed; inset: 0; opacity: 0.02; pointer-events: none; z-index: 1;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
}

/* ── Navbar ── */
.navbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 36px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, transparent 100%);
  transition: background-color 0.3s;
}
.navbar.scrolled { background-color: rgba(10,10,12,0.95); backdrop-filter: blur(10px); border-bottom: 1px solid #1c1c1c; }
.nav-left  { display: flex; align-items: center; gap: 32px; }
.nav-right { display: flex; align-items: center; gap: 16px; }
.brand-logo { display: flex; align-items: center; gap: 6px; }
.logo-mark {
  font-family: 'Bebas Neue', sans-serif; font-size: 26px; line-height: 1;
  display: inline-block; transform: scaleY(1.15);
  background: linear-gradient(180deg, #ff3b30 0%, #e50914 45%, #9c060d 100%);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
  color: #e50914; filter: drop-shadow(0 3px 8px rgba(229,9,20,0.5));
}
.logo-text  { font-family: 'Bebas Neue', sans-serif; font-size: 22px; color: #fff; letter-spacing: 1px; }
.logo-text.small { font-size: 16px; }
.nav-links { display: flex; gap: 22px; }
.nav-link { background: none; border: none; color: #ccc; font-size: 14px; font-weight: 500; cursor: pointer; font-family: inherit; transition: color 0.2s; padding: 4px 0; }
.nav-link:hover, .nav-link.active { color: #fff; font-weight: 700; }
.search-box { display: flex; align-items: center; gap: 8px; }
.icon-btn { background: none; border: none; color: #fff; font-size: 16px; cursor: pointer; }
.search-box input { background: rgba(0,0,0,0.6); border: 1px solid #444; border-radius: 4px; color: #fff; padding: 6px 10px; font-size: 13px; outline: none; width: 180px; font-family: inherit; }
.user-info { display: flex; align-items: center; gap: 8px; }
.avatar-circle { width: 32px; height: 32px; border-radius: 6px; background: #e50914; color: #fff; font-weight: 700; font-size: 12px; display: flex; align-items: center; justify-content: center; font-family: 'IBM Plex Mono', monospace; flex-shrink: 0; }
.user-name { font-size: 13px; color: #ccc; font-weight: 500; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.btn-logout { padding: 7px 16px; background: transparent; border: 1px solid #555; border-radius: 5px; color: #ccc; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; transition: border-color 0.2s, color 0.2s, background 0.2s; white-space: nowrap; }
.btn-logout:hover { border-color: #e50914; color: #e50914; background: rgba(229,9,20,0.08); }

/* ── Hero ── */
.hero { position: relative; height: 100vh; background-color: #141414; background-size: cover; background-position: center top; display: flex; align-items: flex-end; overflow: hidden; }
.hero-empty { align-items: center; justify-content: center; }
.hero-video { position: absolute; inset: 0; width: 100%; height: 100%; border: none; pointer-events: none; z-index: 0; object-fit: cover; }
.hero-gradient { position: absolute; inset: 0; z-index: 1; background: linear-gradient(to top, #0a0a0c 0%, rgba(10,10,12,0.2) 45%, rgba(10,10,12,0.1) 100%), linear-gradient(to right, rgba(10,10,12,0.85) 0%, transparent 60%); }
.hero-content { position: relative; z-index: 2; padding: 0 48px 90px; max-width: 640px; display: flex; flex-direction: column; gap: 16px; }
.meta-code { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #e8c76a; background: rgba(0,0,0,0.45); border: 1px solid rgba(232,199,106,0.3); padding: 4px 10px; border-radius: 3px; display: inline-flex; gap: 8px; letter-spacing: 1.5px; text-transform: uppercase; align-self: flex-start; }
.hero-title { font-family: 'Bebas Neue', sans-serif; font-size: 56px; line-height: 1.05; letter-spacing: 1px; text-shadow: 0 4px 16px rgba(0,0,0,0.7); }
.hero-overview { font-size: 15px; color: #d8d8d8; line-height: 1.6; max-width: 520px; }
.hero-actions { display: flex; gap: 14px; margin-top: 6px; align-items: center; }
.btn-play { padding: 12px 28px; background: #e50914; border: none; border-radius: 4px; color: #fff; font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit; transition: background 0.2s, transform 0.1s; }
.btn-play:hover { background: #f40612; transform: translateY(-1px); }
.btn-info { padding: 12px 24px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.4); border-radius: 4px; color: #fff; font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit; transition: background 0.2s; }
.btn-info:hover { background: rgba(255,255,255,0.2); }
.btn-mute { width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.5); background: rgba(0,0,0,0.5); color: #fff; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
.hero-dots { position: absolute; right: 36px; bottom: 38px; z-index: 2; display: flex; gap: 8px; }
.hero-dots span { width: 22px; height: 3px; background: rgba(255,255,255,0.3); cursor: pointer; transition: background 0.2s; }
.hero-dots span.active { background: #e50914; }
.hero-progress { position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: rgba(255,255,255,0.08); z-index: 3; }
.hero-progress-bar { height: 100%; background: #e50914; animation: progress-fill 10s linear forwards; }
@keyframes progress-fill { from { width: 0%; } to { width: 100%; } }

.sprocket-divider { height: 20px; background-color: #0d0d0f; background-image: radial-gradient(circle, #0a0a0c 5px, transparent 5.5px); background-size: 26px 20px; background-position: center; border-top: 1px solid #1c1c1c; border-bottom: 1px solid #1c1c1c; position: relative; z-index: 2; }
.welcome-banner { position: relative; z-index: 2; display: flex; align-items: center; justify-content: space-between; padding: 20px 36px; background: rgba(229,9,20,0.06); border-bottom: 1px solid rgba(229,9,20,0.15); }
.welcome-text { font-size: 16px; color: #ccc; }
.welcome-text strong { color: #fff; font-weight: 700; }

/* ════════════════════════════════════════════════════════════════
   ROWS — Netflix-style trailer cards, 3 per baris, landscape 16:9
════════════════════════════════════════════════════════════════ */
.rows-area { position: relative; z-index: 2; padding: 28px 0 60px; background: #0a0a0c; }
.movie-row { margin-bottom: 44px; }
.row-title { font-size: 18px; font-weight: 700; padding: 0 36px; margin-bottom: 14px; letter-spacing: 0.3px; }

.row-track-wrap { position: relative; }
.row-track-wrap:hover .row-nav { opacity: 1; }
.row-nav { position: absolute; top: 0; bottom: 0; width: 52px; background: linear-gradient(to right, rgba(10,10,12,0.95), transparent); border: none; color: #fff; font-size: 30px; cursor: pointer; z-index: 5; opacity: 0; transition: opacity 0.2s; }
.row-nav.right { right: 0; background: linear-gradient(to left, rgba(10,10,12,0.95), transparent); }
.row-nav.left  { left: 0; }

.row-track { display: flex; gap: 12px; overflow-x: auto; overflow-y: hidden; padding: 6px 36px 16px; scroll-behavior: smooth; scrollbar-width: none; }
.row-track::-webkit-scrollbar { display: none; }
.row-loading { display: flex; align-items: center; padding: 40px; }
.row-empty   { font-size: 13px; color: #555; padding: 20px 0; }

/* ── Trailer Card — landscape 16:9, lebar ~30% layar ── */
.trailer-card {
  position: relative;
  flex: 0 0 calc((100% - 36px * 2 - 12px * 2) / 3); /* 3 kartu per baris */
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  overflow: hidden;
  background: #1c1c1c;
  cursor: pointer;
  border: 1px solid #1f1f1f;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}
.trailer-card:hover {
  transform: scale(1.04) translateY(-4px);
  box-shadow: 0 20px 50px rgba(0,0,0,0.85);
  border-color: #e50914;
  z-index: 6;
}

/* Thumbnail backdrop */
.card-thumb {
  width: 100%; height: 100%; object-fit: cover; display: block;
  transition: filter 0.3s;
}
.trailer-card:hover .card-thumb { filter: brightness(0.3); }

/* Trailer iframe */
.card-trailer {
  position: absolute; inset: 0; width: 100%; height: 100%;
  border: none; pointer-events: none; background: #000; z-index: 1;
}

/* Loading spinner di tengah kartu */
.card-trailer-loading {
  position: absolute; inset: 0; z-index: 2;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.5);
}

/* Gradient bawah — selalu ada supaya teks terbaca */
.card-gradient {
  position: absolute; bottom: 0; left: 0; right: 0; height: 65%;
  background: linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 55%, transparent 100%);
  z-index: 3;
}

/* Info film — SELALU tampil di bawah kartu */
.card-info {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 12px 14px 14px;
  z-index: 4;
  display: flex; flex-direction: column; gap: 5px;
}
.card-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 18px; color: #fff; line-height: 1.1;
  text-shadow: 0 2px 8px rgba(0,0,0,0.8);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.card-meta { display: flex; align-items: center; gap: 6px; }
.card-year   { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #aaa; }
.card-dot    { color: #555; font-size: 10px; }
.card-rating { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #e8c76a; }

/* Tombol aksi — muncul saat hover */
.card-actions {
  display: flex; gap: 8px; margin-top: 4px;
  opacity: 0; transform: translateY(6px);
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.trailer-card:hover .card-actions { opacity: 1; transform: translateY(0); }

.card-btn {
  padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 700;
  cursor: pointer; font-family: inherit; border: none; transition: background 0.2s, transform 0.1s;
}
.card-btn.play { background: #e50914; color: #fff; }
.card-btn.play:hover { background: #f40612; }
.card-btn.info { background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.4); }
.card-btn.info:hover { background: rgba(255,255,255,0.25); }

/* Badge LIVE TRAILER pojok kiri atas */
.card-live-badge {
  position: absolute; top: 10px; left: 10px; z-index: 5;
  background: #e50914; color: #fff;
  font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 700;
  letter-spacing: 1.5px; padding: 3px 8px; border-radius: 3px;
  animation: pulse-badge 1.5s ease-in-out infinite;
}
@keyframes pulse-badge {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.6; }
}

/* ── Footer ── */
.dash-footer { position: relative; z-index: 2; padding: 30px 36px 50px; border-top: 1px solid #1c1c1c; display: flex; flex-direction: column; gap: 6px; }
.dash-footer p { font-size: 12px; color: #555; }

/* ── Spinner ── */
.loading-reel { display: flex; flex-direction: column; align-items: center; gap: 14px; }
.reel-spinner { width: 40px; height: 40px; border: 3px solid #222; border-top-color: #e50914; border-radius: 50%; animation: spin 0.8s linear infinite; }
.reel-spinner.small { width: 26px; height: 26px; border-width: 2px; }
.loading-reel p { font-size: 13px; color: #666; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Modal ── */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 24px; backdrop-filter: blur(8px); }
.modal-card { background: #141414; border-radius: 8px; border: 1px solid #2a2a2a; width: 100%; max-width: 760px; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 32px 80px rgba(0,0,0,0.9); position: relative; }
.modal-close-btn { position: absolute; top: 14px; right: 14px; z-index: 10; background: rgba(0,0,0,0.7); border: 1px solid #444; color: #fff; font-size: 16px; width: 34px; height: 34px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
.modal-close-btn:hover { background: rgba(229,9,20,0.8); border-color: #e50914; }
.modal-hero { position: relative; height: 280px; flex-shrink: 0; background-color: #1c1c1c; background-size: cover; background-position: center top; }
.modal-hero-gradient { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(20,20,20,0.1) 0%, rgba(20,20,20,0.9) 80%, #141414 100%); }
.modal-hero-info { position: absolute; bottom: 0; left: 0; right: 0; padding: 20px 28px; }
.modal-genre-badge { display: inline-block; padding: 3px 12px; background: #e50914; border-radius: 3px; font-size: 10px; font-weight: 700; color: #fff; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 10px; }
.modal-movie-title { font-family: 'Bebas Neue', sans-serif; font-size: 30px; color: #fff; margin-bottom: 8px; line-height: 1.2; }
.modal-movie-meta { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #aaa; margin-bottom: 14px; }
.dot { color: #555; }
.rating-star { color: #e8c76a; font-weight: 700; }
.modal-actions { display: flex; gap: 10px; }
.modal-play-btn { padding: 9px 22px; background: #e50914; border: none; border-radius: 4px; color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; transition: background 0.2s; }
.modal-play-btn:hover { background: #f40612; }
.modal-save-btn { padding: 9px 20px; background: transparent; border: 2px solid #fff; border-radius: 4px; color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; transition: background 0.2s; }
.modal-save-btn:hover { background: rgba(255,255,255,0.15); }
.modal-body { overflow-y: auto; padding: 20px 28px 28px; flex: 1; }
.modal-body::-webkit-scrollbar { width: 4px; }
.modal-body::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
.modal-overview { font-size: 14px; color: #ccc; line-height: 1.7; margin-bottom: 22px; }
.modal-info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; border-top: 1px solid #222; padding-top: 18px; }
.info-item { display: flex; flex-direction: column; gap: 4px; }
.info-label { font-size: 10px; color: #555; text-transform: uppercase; letter-spacing: 1px; }
.info-val { font-size: 15px; font-weight: 700; color: #fff; }
.info-rating { color: #e8c76a; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-active .modal-card { transition: transform 0.25s ease; }
.modal-fade-enter-from .modal-card { transform: scale(0.95) translateY(12px); }

/* ── Responsive ── */
@media (max-width: 1100px) {
  .trailer-card { flex: 0 0 calc((100% - 36px * 2 - 12px) / 2); } /* 2 per baris */
}
@media (max-width: 900px) {
  .navbar { padding: 12px 20px; }
  .nav-links { display: none; }
  .user-name { display: none; }
  .hero-content { padding: 0 20px 70px; max-width: 100%; }
  .hero-title { font-size: 36px; }
  .row-title { padding: 0 20px; }
  .row-track { padding: 6px 20px 16px; }
  .welcome-banner { padding: 16px 20px; flex-direction: column; align-items: flex-start; gap: 8px; }
  .dash-footer { padding: 24px 20px 40px; }
  .trailer-card { flex: 0 0 280px; } /* scroll bebas di mobile */
}
@media (max-width: 480px) {
  .hero { height: 80vh; }
  .hero-title { font-size: 28px; }
  .modal-hero { height: 200px; }
  .modal-info-grid { grid-template-columns: repeat(2, 1fr); }
  .btn-logout { font-size: 12px; padding: 6px 12px; }
  .trailer-card { flex: 0 0 240px; }
  .card-title { font-size: 15px; }
  /* Trailer cards di mobile: tampilkan thumbnail saja, tidak perlu hover */
  .card-trailer { display: none; }
}
</style>