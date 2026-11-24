/**
     * =========================================================================
     * AIM HIGH WITH STI — STI College Laoag Edition
     * Complete HTML5 Canvas Game with Web Audio API, Parallax Ilocos/Laoag
     * Scenery, Custom STI Emblem Physics, and Flutter-Inspired UI Overlays.
     * =========================================================================
     */

    (function () {
      'use strict';

      /* -----------------------------------------------------------------------
       * 1. DOM REFERENCES & STORAGE HELPERS
       * --------------------------------------------------------------------- */
      const stageEl = document.getElementById('canvasStage');
      const canvas = document.getElementById('gameCanvas');
      const ctx = canvas.getContext('2d');

      const topBestScoreEl = document.getElementById('topBestScore');
      const startBestScoreEl = document.getElementById('startBestScore');
      const liveScoreEl = document.getElementById('liveScore');
      const skyPhaseBadgeEl = document.getElementById('skyPhaseBadge');
      const inGameHudEl = document.getElementById('inGameHud');
      const newBestToastEl = document.getElementById('newBestToast');

      const startOverlay = document.getElementById('startOverlay');
      const pauseOverlay = document.getElementById('pauseOverlay');
      const gameOverOverlay = document.getElementById('gameOverOverlay');
      const gameOverCard = document.getElementById('gameOverCard');

      const playNowBtn = document.getElementById('playNowBtn');
      const playAgainBtn = document.getElementById('playAgainBtn');
      const pauseBtn = document.getElementById('pauseBtn');
      const pauseIcon = document.getElementById('pauseIcon');
      const resumeIcon = document.getElementById('resumeIcon');
      const resumeBtn = document.getElementById('resumeBtn');
      const pauseRestartBtn = document.getElementById('pauseRestartBtn');
      const soundBtn = document.getElementById('soundBtn');
      const soundOnIcon = document.getElementById('soundOnIcon');
      const soundOffIcon = document.getElementById('soundOffIcon');

      const finalScoreEl = document.getElementById('finalScore');
      const finalBestScoreEl = document.getElementById('finalBestScore');
      const newRecordPillEl = document.getElementById('newRecordPill');
      const rankEmojiEl = document.getElementById('rankEmoji');
      const rankTitleEl = document.getElementById('rankTitle');
      const funnyRemarkEl = document.getElementById('funnyRemark');

      const hudShieldEl = document.getElementById('hudShield');
      const hudCoffeeEl = document.getElementById('hudCoffee');
      const hudStreakEl = document.getElementById('hudStreak');
      const coffeeTimerTextEl = document.getElementById('coffeeTimerText');

      const openReportCardBtn = document.getElementById('openReportCardBtn');
      const reportCardModal = document.getElementById('reportCardModal');
      const closeReportCardBtn = document.getElementById('closeReportCardBtn');
      const saveCertImgBtn = document.getElementById('saveCertImgBtn');
      const copyCertTextBtn = document.getElementById('copyCertTextBtn');
      const certStudentName = document.getElementById('certStudentName');
      const certEmoji = document.getElementById('certEmoji');
      const certRank = document.getElementById('certRank');
      const certScore = document.getElementById('certScore');
      const certToast = document.getElementById('certToast');

      const STORAGE_KEY = 'aimHighSTI_laoag_bestScore';
      const LEGACY_STORAGE_KEY = 'flyHighSTI_laoag_bestScore';
      const STUDENT_NAME_KEY = 'aimHighSTI_laoag_studentName';
      const LEGACY_NAME_KEY = 'flyHighSTI_laoag_studentName';

      function loadBestScore() {
        try {
          const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
          return saved ? Math.max(0, parseInt(saved, 10) || 0) : 0;
        } catch (err) {
          return 0;
        }
      }

      function saveBestScore(val) {
        try {
          localStorage.setItem(STORAGE_KEY, String(val));
        } catch (err) {
          // Ignore storage errors in restricted iframes
        }
      }

      function loadStudentName() {
        try {
          return localStorage.getItem(STUDENT_NAME_KEY) || localStorage.getItem(LEGACY_NAME_KEY) || 'Certified STIer';
        } catch (err) {
          return 'Certified STIer';
        }
      }

      function saveStudentName(val) {
        try {
          localStorage.setItem(STUDENT_NAME_KEY, val);
        } catch (err) {}
      }

      /* -----------------------------------------------------------------------
       * 2. WEB AUDIO API SYNTHESIZER (Zero External Audio Files)
       * --------------------------------------------------------------------- */
      class SoundFX {
        constructor() {
          this.enabled = true;
          this.ctx = null;
          this.masterGain = null;
          this.compressor = null;
        }

        ensureContext() {
          if (!this.enabled) return null;
          try {
            if (!this.ctx) {
              const AudioCtx = window.AudioContext || window.webkitAudioContext;
              if (AudioCtx) {
                this.ctx = new AudioCtx();

                // High-End Dynamics Compressor (Prevents distortion when boosting volume)
                this.compressor = this.ctx.createDynamicsCompressor();
                this.compressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
                this.compressor.knee.setValueAtTime(10, this.ctx.currentTime);
                this.compressor.ratio.setValueAtTime(4, this.ctx.currentTime);
                this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
                this.compressor.release.setValueAtTime(0.12, this.ctx.currentTime);

                // Master Volume Booster (Louder, punchier audio output)
                this.masterGain = this.ctx.createGain();
                this.masterGain.gain.setValueAtTime(1.9, this.ctx.currentTime);

                this.compressor.connect(this.masterGain);
                this.masterGain.connect(this.ctx.destination);
              }
            }
            if (this.ctx && this.ctx.state === 'suspended') {
              this.ctx.resume();
            }
            return this.ctx;
          } catch (e) {
            return null;
          }
        }

        getMasterInput() {
          return this.compressor || (this.ctx ? this.ctx.destination : null);
        }

        toggle() {
          this.enabled = !this.enabled;
          if (this.enabled) {
            this.ensureContext();
            this.playScore();
          }
          return this.enabled;
        }

        // Harmonious STI collegiate startup arpeggio (Loud & resonant)
        playStartup() {
          const ctx = this.ensureContext();
          if (!ctx) return;
          const now = ctx.currentTime;
          const target = this.getMasterInput();
          const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);

            gain.gain.setValueAtTime(0.001, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.42, now + idx * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.48);

            osc.connect(gain);
            gain.connect(target);

            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.5);
          });
        }

        // Crisp, punchy upward whoosh on flap
        playFlap() {
          const ctx = this.ensureContext();
          if (!ctx) return;
          const now = ctx.currentTime;
          const target = this.getMasterInput();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(260, now);
          osc.frequency.exponentialRampToValueAtTime(620, now + 0.11);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.38, now + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

          osc.connect(gain);
          gain.connect(target);
          osc.start(now);
          osc.stop(now + 0.14);
        }

        // Bright, loud academic chime on scoring (+1)
        playScore() {
          const ctx = this.ensureContext();
          if (!ctx) return;
          const now = ctx.currentTime;
          const target = this.getMasterInput();
          const notes = [587.33, 880.0]; // D5 -> A5
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            const t = now + idx * 0.065;
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(0.44, t + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
            osc.connect(gain);
            gain.connect(target);
            osc.start(t);
            osc.stop(t + 0.24);
          });
        }

        // Celebratory loud arpeggio on new high score or milestone
        playMilestone() {
          const ctx = this.ensureContext();
          if (!ctx) return;
          const now = ctx.currentTime;
          const target = this.getMasterInput();
          const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            const t = now + idx * 0.07;
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(0.48, t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
            osc.connect(gain);
            gain.connect(target);
            osc.start(t);
            osc.stop(t + 0.34);
          });
        }

        // Loud bubbly chime for star & shield pickup
        playPowerup() {
          const ctx = this.ensureContext();
          if (!ctx) return;
          const now = ctx.currentTime;
          const target = this.getMasterInput();
          const notes = [659.25, 830.61, 1046.5]; // E5, G#5, C6
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            const t = now + idx * 0.055;
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(0.46, t + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
            osc.connect(gain);
            gain.connect(target);
            osc.start(t);
            osc.stop(t + 0.22);
          });
        }

        // Warm ascending chord for coffee focus mode
        playCoffee() {
          const ctx = this.ensureContext();
          if (!ctx) return;
          const now = ctx.currentTime;
          const target = this.getMasterInput();
          const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            const t = now + idx * 0.045;
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(0.44, t + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
            osc.connect(gain);
            gain.connect(target);
            osc.start(t);
            osc.stop(t + 0.26);
          });
        }

        // Crisp glass/metallic shatter when shield breaks
        playShieldBreak() {
          const ctx = this.ensureContext();
          if (!ctx) return;
          const now = ctx.currentTime;
          const target = this.getMasterInput();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(850, now);
          osc.frequency.exponentialRampToValueAtTime(180, now + 0.2);
          gain.gain.setValueAtTime(0.52, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
          osc.connect(gain);
          gain.connect(target);
          osc.start(now);
          osc.stop(now + 0.24);
        }

        // Heavy, punchy impact thud on collision
        playCrash() {
          const ctx = this.ensureContext();
          if (!ctx) return;
          const now = ctx.currentTime;
          const target = this.getMasterInput();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(180, now);
          osc.frequency.exponentialRampToValueAtTime(36, now + 0.3);

          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(520, now);

          gain.gain.setValueAtTime(0.65, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(target);
          osc.start(now);
          osc.stop(now + 0.34);
        }
      }

      const sfx = new SoundFX();

      /* -----------------------------------------------------------------------
       * HAPTIC FEEDBACK CONTROLLER (Tactile Vibration API)
       * --------------------------------------------------------------------- */
      function triggerHaptic(pattern) {
        try {
          if (navigator && typeof navigator.vibrate === 'function') {
            navigator.vibrate(pattern);
          }
        } catch (e) {}
      }

      /* -----------------------------------------------------------------------
       * 3. GAME STATE & CONFIGURATION
       * --------------------------------------------------------------------- */
      const STATE = {
        START: 'START',
        PLAYING: 'PLAYING',
        PAUSED: 'PAUSED',
        GAMEOVER: 'GAMEOVER'
      };

      let gameState = STATE.START;
      let width = 400;
      let height = 660;
      let dpr = Math.min(window.devicePixelRatio || 1, 2);
      const GROUND_HEIGHT = 76;

      let score = 0;
      let bestScore = loadBestScore();
      let beatBestThisRun = false;
      let gameOverTimestamp = 0;

      // Visual juice variables
      let shakeTime = 0;
      let shakeMagnitude = 0;
      let flashAlpha = 0;
      let globalTime = 0;
      let groundScroll = 0;
      let farScroll = 0;
      let midScroll = 0;

      // Player (STI Emblem)
      const player = {
        x: 110,
        y: 260,
        vy: 0,
        width: 52,
        height: 40,
        radius: 17, // Slightly forgiving circular collision hitbox
        rotation: 0,
        wingPhase: 0,
        wingBoost: 0,
        scaleX: 1,
        scaleY: 1
      };

      // Physics constants (tuned for 60fps delta-time)
      const GRAVITY = 1380;
      const FLAP_VELOCITY = -435;
      const MAX_FALL_SPEED = 620;

      // Entities & Powerups
      let pillars = [];
      let pickups = [];
      let particles = [];
      let confetti = [];
      let popups = [];
      let clouds = [];
      let stars = [];
      let pillarSpawnTimer = 0;

      // Gameplay features: Powerups & Combos
      let coffeeSlowMoTimer = 0;
      let hasShield = false;
      let invulnerableTimer = 0;
      let streakCount = 0;

      function getFunnyRemark(pts) {
        if (pts === 0) return "Drop subject agad?! Bawi next sem! 😂";
        if (pts < 5) return "Bawi nalang sa Finals pre... 📚";
        if (pts < 10) return "Not bad, pasado na sa quiz! 👍";
        if (pts === 14) return "Sayang! 1 point na lang sana Cum Laude na! 😭";
        if (pts < 15) return "Konti na lang, abot-kamay na ang Latin honors!";
        if (pts === 24) return "Isang score na lang Magna Cum Laude na sana!";
        if (pts < 25) return "Cum Laude standard! Proud STIer! 🏅";
        if (pts === 39) return "1 POINT NA LANG SUMMA NA SANA! Grabe! 😱";
        if (pts < 40) return "Magna Cum Laude Grind! Lupet mo! 🏆";
        return "SUMMA CUM LAUDE! Campus Legend of STI Laoag! 👑";
      }

      /* -----------------------------------------------------------------------
       * 4. COLOR & SKY TRANSITION UTILITIES
       * --------------------------------------------------------------------- */
      const SKY_THEMES = [
        { name: 'Laoag Morning', top: [30, 144, 255], mid: [125, 211, 252], bot: [254, 249, 195], starAlpha: 0 },
        { name: 'Ilocos Noon', top: [2, 119, 189], mid: [79, 195, 247], bot: [225, 245, 254], starAlpha: 0 },
        { name: 'Golden Sunset', top: [74, 58, 128], mid: [249, 115, 22], bot: [253, 224, 71], starAlpha: 0.25 },
        { name: 'STI Starry Night', top: [9, 21, 52], mid: [0, 52, 115], bot: [0, 75, 147], starAlpha: 0.9 }
      ];

      function lerp(a, b, t) {
        return a + (b - a) * t;
      }

      function lerpRGB(c1, c2, t) {
        const r = Math.round(lerp(c1[0], c2[0], t));
        const g = Math.round(lerp(c1[1], c2[1], t));
        const b = Math.round(lerp(c1[2], c2[2], t));
        return `rgb(${r}, ${g}, ${b})`;
      }

      function getCurrentSky() {
        // Every 10 points smoothly shifts to the next sky phase
        const progress = Math.min(score / 10, SKY_THEMES.length - 1);
        const idx = Math.floor(progress);
        const nextIdx = Math.min(idx + 1, SKY_THEMES.length - 1);
        const t = progress - idx;

        const a = SKY_THEMES[idx];
        const b = SKY_THEMES[nextIdx];
        return {
          name: t < 0.5 ? a.name : b.name,
          top: lerpRGB(a.top, b.top, t),
          mid: lerpRGB(a.mid, b.mid, t),
          bot: lerpRGB(a.bot, b.bot, t),
          starAlpha: lerp(a.starAlpha, b.starAlpha, t)
        };
      }

      function getStudentRank(pts) {
        if (pts >= 40) return { title: 'Summa Cum Laude', emoji: '👑' };
        if (pts >= 25) return { title: 'Magna Cum Laude', emoji: '🏆' };
        if (pts >= 15) return { title: 'Cum Laude', emoji: '🏅' };
        if (pts >= 5) return { title: 'STI Scholar', emoji: '⭐' };
        return { title: 'Freshman Flyer', emoji: '🎓' };
      }

      /* -----------------------------------------------------------------------
       * 5. RESPONSIVE CANVAS SETUP
       * --------------------------------------------------------------------- */
      function initScenery() {
        clouds = [];
        for (let i = 0; i < 6; i++) {
          clouds.push({
            x: Math.random() * width,
            y: 45 + Math.random() * (height * 0.38),
            scale: 0.55 + Math.random() * 0.65,
            speed: 12 + Math.random() * 16,
            alpha: 0.55 + Math.random() * 0.3
          });
        }

        stars = [];
        for (let i = 0; i < 36; i++) {
          stars.push({
            x: Math.random() * width,
            y: Math.random() * (height * 0.55),
            r: 0.9 + Math.random() * 1.6,
            phase: Math.random() * Math.PI * 2
          });
        }
      }

      function resizeCanvas() {
        const rect = stageEl.getBoundingClientRect();
        width = Math.max(280, Math.floor(rect.width));
        height = Math.max(400, Math.floor(rect.height));
        dpr = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        player.x = Math.round(width * 0.27);
        if (gameState === STATE.START) {
          player.y = Math.round((height - GROUND_HEIGHT) * 0.46);
        } else {
          player.y = Math.min(player.y, height - GROUND_HEIGHT - player.radius);
        }

        if (clouds.length === 0) initScenery();
      }

      /* -----------------------------------------------------------------------
       * 6. DIFFICULTY CURVE & OBSTACLE SPAWNING
       * --------------------------------------------------------------------- */
      function getDifficultyParams() {
        // Gentle ramp up to score 35, capped at a fun & fair challenge
        const level = Math.min(score, 35) / 35;
        const speed = lerp(168, 232, level);
        const gap = lerp(162, 126, level);
        const spawnInterval = lerp(1.58, 1.24, level);
        return { speed, gap, spawnInterval };
      }

      function spawnPillar() {
        const { gap } = getDifficultyParams();
        const playableHeight = height - GROUND_HEIGHT;
        const minTop = 74;
        const maxTop = Math.max(minTop + 20, playableHeight - gap - 74);
        const topHeight = minTop + Math.random() * (maxTop - minTop);

        // Subtle vertical bobbing on occasional pillars at high scores (22+)
        const canBob = score >= 22 && Math.random() < 0.35;

        const pil = {
          x: width + 44,
          width: 68,
          topHeight: topHeight,
          baseTopHeight: topHeight,
          gap: gap,
          passed: false,
          bobAmp: canBob ? 18 : 0,
          bobSpeed: 1.6 + Math.random() * 0.6,
          bobPhase: Math.random() * Math.PI * 2,
          seed: Math.floor(Math.random() * 9999),
          ribbonColor: Math.random() < 0.5 ? '#E11D48' : '#FFD100',
          bookColors: [
            ['#E11D48', '#FFD100', '#0EA5E9'],
            ['#10B981', '#F59E0B', '#6366F1'],
            ['#F97316', '#38BDF8', '#FACC15']
          ][Math.floor(Math.random() * 3)]
        };
        pillars.push(pil);

        // 45% chance to spawn a collectible pickup in the gap center
        if (Math.random() < 0.45) {
          const rand = Math.random();
          let pType = 'star';
          if (rand < 0.35) pType = 'coffee';
          else if (rand < 0.60) pType = 'shield';
          else pType = 'star';

          pickups.push({
            x: pil.x + pil.width * 0.5,
            y: pil.topHeight + pil.gap * 0.5,
            baseY: pil.topHeight + pil.gap * 0.5,
            type: pType,
            pillar: pil,
            phase: Math.random() * Math.PI * 2,
            collected: false
          });
        }
      }

      /* -----------------------------------------------------------------------
       * 7. PARTICLES, CONFETTI & POPUPS
       * --------------------------------------------------------------------- */
      function emitFlapParticles() {
        // Golden sparkles & crisp air puffs
        for (let i = 0; i < 7; i++) {
          const isSparkle = i < 4;
          particles.push({
            x: player.x - 16 + (Math.random() - 0.5) * 10,
            y: player.y + 8 + (Math.random() - 0.5) * 10,
            vx: -40 - Math.random() * 75,
            vy: 30 + Math.random() * 85,
            size: isSparkle ? 2.5 + Math.random() * 3 : 4 + Math.random() * 4,
            life: 1,
            decay: isSparkle ? 2.2 + Math.random() : 2.6 + Math.random(),
            color: isSparkle ? (Math.random() < 0.6 ? '#FFD100' : '#FFF3B0') : 'rgba(255,255,255,0.85)',
            type: isSparkle ? 'star' : 'puff'
          });
        }
      }

      function emitConfettiBurst(x, y, count = 28) {
        const colors = ['#FFD100', '#004B93', '#FFFFFF', '#38BDF8', '#FFB800'];
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 90 + Math.random() * 210;
          confetti.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 90,
            w: 5 + Math.random() * 5,
            h: 3 + Math.random() * 4,
            rot: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 12,
            color: colors[i % colors.length],
            life: 1
          });
        }
      }

      function emitScorePopup(x, y, text = '+1', color = '#FFD100') {
        popups.push({
          x,
          y,
          vy: -55,
          text,
          color,
          font: '900 22px "Outfit", sans-serif',
          life: 1
        });
      }

      function spawnPopup(text, x, y, color = '#FFD100') {
        popups.push({
          x: Math.max(75, Math.min(width - 75, x)),
          y,
          vy: -46,
          text,
          color,
          font: 'bold 14px "Outfit", sans-serif',
          life: 1.35
        });
      }

      function emitExplosion(x, y, color = '#FFD100') {
        for (let i = 0; i < 20; i++) {
          const angle = Math.random() * Math.PI * 2;
          const spd = 60 + Math.random() * 160;
          particles.push({
            x,
            y,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            size: 3 + Math.random() * 4,
            life: 1,
            decay: 2.2 + Math.random() * 1.5,
            color: color,
            type: 'puff'
          });
        }
      }

      /* -----------------------------------------------------------------------
       * 8. GAME FLOW CONTROLS
       * --------------------------------------------------------------------- */
      function syncBestScoreUI() {
        topBestScoreEl.textContent = bestScore;
        startBestScoreEl.textContent = bestScore;
        finalBestScoreEl.textContent = bestScore;
      }

      function showOverlay(el) {
        el.classList.remove('hidden-overlay');
        el.classList.add('visible-overlay');
      }

      function hideOverlay(el) {
        el.classList.remove('visible-overlay');
        el.classList.add('hidden-overlay');
      }

      function triggerNewBestToast() {
        newBestToastEl.classList.remove('hidden', 'animate-toast');
        void newBestToastEl.offsetWidth; // Force reflow
        newBestToastEl.classList.add('animate-toast');
      }

      function startGame() {
        sfx.ensureContext();
        score = 0;
        beatBestThisRun = false;
        pillars = [];
        pickups = [];
        particles = [];
        confetti = [];
        popups = [];
        pillarSpawnTimer = 0.65;
        shakeTime = 0;
        flashAlpha = 0;

        coffeeSlowMoTimer = 0;
        hasShield = false;
        invulnerableTimer = 0;
        streakCount = 0;
        hudShieldEl.classList.add('hidden');
        hudCoffeeEl.classList.add('hidden');
        hudStreakEl.classList.add('hidden');

        player.x = Math.round(width * 0.27);
        player.y = Math.round((height - GROUND_HEIGHT) * 0.44);
        player.vy = 0;
        player.rotation = 0;
        player.scaleX = 1;
        player.scaleY = 1;

        liveScoreEl.textContent = '0';
        skyPhaseBadgeEl.textContent = SKY_THEMES[0].name;
        newBestToastEl.classList.add('hidden');

        gameState = STATE.PLAYING;
        hideOverlay(startOverlay);
        hideOverlay(pauseOverlay);
        hideOverlay(gameOverOverlay);
        hideOverlay(reportCardModal);
        inGameHudEl.style.opacity = '1';
        pauseBtn.disabled = false;
        pauseIcon.classList.remove('hidden');
        resumeIcon.classList.add('hidden');

        // Initial flap so player starts soaring immediately
        flap();
      }

      function flap() {
        if (gameState !== STATE.PLAYING) return;
        player.vy = FLAP_VELOCITY;
        player.wingBoost = 1.0;
        // Squash-and-stretch impulse
        player.scaleX = 1.18;
        player.scaleY = 0.84;
        emitFlapParticles();
        sfx.playFlap();
        triggerHaptic(14);
      }

      function togglePause() {
        if (gameState === STATE.PLAYING) {
          gameState = STATE.PAUSED;
          showOverlay(pauseOverlay);
          pauseIcon.classList.add('hidden');
          resumeIcon.classList.remove('hidden');
        } else if (gameState === STATE.PAUSED) {
          gameState = STATE.PLAYING;
          hideOverlay(pauseOverlay);
          pauseIcon.classList.remove('hidden');
          resumeIcon.classList.add('hidden');
          lastFrameTime = performance.now();
        }
      }

      function triggerGameOver() {
        if (gameState === STATE.GAMEOVER) return;
        gameState = STATE.GAMEOVER;
        gameOverTimestamp = performance.now();
        sfx.playCrash();
        triggerHaptic([90, 40, 160]);

        shakeTime = 0.35;
        shakeMagnitude = 12;
        flashAlpha = 0.55;

        const isNewRecord = score > bestScore;
        if (isNewRecord) {
          bestScore = score;
          saveBestScore(bestScore);
        }
        syncBestScoreUI();

        // Populate Game Over Modal
        finalScoreEl.textContent = score;
        finalBestScoreEl.textContent = bestScore;
        if (isNewRecord || beatBestThisRun) {
          newRecordPillEl.classList.remove('hidden');
        } else {
          newRecordPillEl.classList.add('hidden');
        }

        const rank = getStudentRank(score);
        rankEmojiEl.textContent = rank.emoji;
        rankTitleEl.textContent = rank.title;
        funnyRemarkEl.textContent = getFunnyRemark(score);

        // Populate Certificate details for share modal
        certStudentName.value = loadStudentName();
        certEmoji.textContent = rank.emoji;
        certRank.textContent = rank.title;
        certScore.textContent = `Academic Score: ${score} pts  |  Best: ${bestScore} pts`;

        inGameHudEl.style.opacity = '0';
        pauseBtn.disabled = true;

        // Re-trigger spring animation on modal card
        gameOverCard.classList.remove('animate-modal-in');
        void gameOverCard.offsetWidth;
        gameOverCard.classList.add('animate-modal-in');

        setTimeout(() => {
          if (gameState === STATE.GAMEOVER) {
            showOverlay(gameOverOverlay);
          }
        }, 260);
      }

      function handleScoreIncrement(pillar) {
        score += 1;
        streakCount += 1;
        liveScoreEl.textContent = score;

        // Spring pop animation on HUD score
        liveScoreEl.classList.remove('animate-score-pop');
        void liveScoreEl.offsetWidth;
        liveScoreEl.classList.add('animate-score-pop');

        skyPhaseBadgeEl.textContent = getCurrentSky().name;
        emitScorePopup(player.x + 12, player.y - 26, '+1');

        // Streak check
        if (streakCount === 4) {
          spawnPopup("🔥 ON FIRE!", player.x, player.y - 24, "#F97316");
          hudStreakEl.classList.remove('hidden');
        }

        // Campus Milestone Popups
        if (score === 3) spawnPopup("Tres is Life! 📚", player.x, player.y - 24, "#FACC15");
        else if (score === 5) spawnPopup("STI Scholar! ⭐", player.x, player.y - 24, "#FACC15");
        else if (score === 10) spawnPopup("Midterms Passed! 💯", player.x, player.y - 24, "#38BDF8");
        else if (score === 15) spawnPopup("Cum Laude Energy! 🏅", player.x, player.y - 24, "#FBBF24");
        else if (score === 25) spawnPopup("Magna Cum Laude Grind! 🏆", player.x, player.y - 24, "#F43F5E");
        else if (score === 40) spawnPopup("SUMMA YARN?! 👑", player.x, player.y - 24, "#FFD100");

        const hitMilestone = score > 0 && score % 10 === 0;
        const justBeatBest = !beatBestThisRun && bestScore > 0 && score > bestScore;

        if (justBeatBest) {
          beatBestThisRun = true;
          bestScore = score;
          saveBestScore(bestScore);
          syncBestScoreUI();
          triggerNewBestToast();
          emitConfettiBurst(width * 0.5, height * 0.28, 36);
          sfx.playMilestone();
        } else if (hitMilestone) {
          emitConfettiBurst(player.x + 20, player.y - 10, 26);
          sfx.playMilestone();
          triggerHaptic([35, 30, 35, 30, 60]);
        } else {
          sfx.playScore();
          triggerHaptic([16, 25, 20]);
        }

        if (score > bestScore) {
          bestScore = score;
          saveBestScore(bestScore);
          syncBestScoreUI();
        }
      }

      /* -----------------------------------------------------------------------
       * 9. UPDATE LOOP (60fps Delta-Time Normalized)
       * --------------------------------------------------------------------- */
      function update(dt) {
        globalTime += dt;

        // Apply coffee slow-mo
        if (coffeeSlowMoTimer > 0) {
          coffeeSlowMoTimer -= dt;
          if (coffeeSlowMoTimer <= 0) {
            coffeeSlowMoTimer = 0;
            hudCoffeeEl.classList.add('hidden');
          } else {
            hudCoffeeEl.classList.remove('hidden');
            coffeeTimerTextEl.textContent = `${Math.ceil(coffeeSlowMoTimer)}s`;
          }
        } else {
          hudCoffeeEl.classList.add('hidden');
        }

        // Shield HUD
        if (hasShield) {
          hudShieldEl.classList.remove('hidden');
        } else {
          hudShieldEl.classList.add('hidden');
        }

        // Streak HUD
        if (streakCount >= 4) {
          hudStreakEl.classList.remove('hidden');
        } else {
          hudStreakEl.classList.add('hidden');
        }

        if (invulnerableTimer > 0) {
          invulnerableTimer -= dt;
        }

        const effectiveDt = coffeeSlowMoTimer > 0 ? dt * 0.65 : dt;

        // Update screen shake & impact flash
        if (shakeTime > 0) {
          shakeTime = Math.max(0, shakeTime - dt);
        }
        if (flashAlpha > 0) {
          flashAlpha = Math.max(0, flashAlpha - dt * 2.2);
        }

        // Clouds always drift gently
        for (let i = 0; i < clouds.length; i++) {
          const c = clouds[i];
          c.x -= c.speed * dt;
          if (c.x < -110) {
            c.x = width + 90;
            c.y = 40 + Math.random() * (height * 0.36);
          }
        }

        // Update particles
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.life -= p.decay * dt;
          if (p.life <= 0) particles.splice(i, 1);
        }

        // Update confetti
        for (let i = confetti.length - 1; i >= 0; i--) {
          const c = confetti[i];
          c.vy += 420 * dt;
          c.x += c.vx * dt;
          c.y += c.vy * dt;
          c.rot += c.vRot * dt;
          c.life -= 0.75 * dt;
          if (c.life <= 0) confetti.splice(i, 1);
        }

        // Update floating score & quote popups
        for (let i = popups.length - 1; i >= 0; i--) {
          const pop = popups[i];
          pop.y += pop.vy * dt;
          pop.life -= 1.35 * dt;
          if (pop.life <= 0) popups.splice(i, 1);
        }

        // Idle animation on START screen
        if (gameState === STATE.START) {
          farScroll = (farScroll + 12 * dt) % width;
          midScroll = (midScroll + 26 * dt) % width;
          groundScroll = (groundScroll + 75 * dt) % 48;
          return;
        }

        if (gameState !== STATE.PLAYING) {
          return;
        }

        const { speed, spawnInterval } = getDifficultyParams();

        // Parallax scrolling
        farScroll = (farScroll + speed * 0.14 * effectiveDt) % 420;
        midScroll = (midScroll + speed * 0.34 * effectiveDt) % 440;
        groundScroll = (groundScroll + speed * effectiveDt) % 48;

        // Player physics
        player.vy = Math.min(MAX_FALL_SPEED, player.vy + GRAVITY * effectiveDt);
        player.y += player.vy * effectiveDt;

        // Trail particles on Fire
        if (streakCount >= 4 && Math.random() < 0.65) {
          particles.push({
            x: player.x - 18,
            y: player.y + (Math.random() - 0.5) * 12,
            vx: -70 - Math.random() * 80,
            vy: (Math.random() - 0.5) * 40,
            size: 3.5 + Math.random() * 4,
            life: 1,
            decay: 2.8 + Math.random() * 1.5,
            color: Math.random() < 0.5 ? '#EA580C' : '#FFD100',
            type: 'puff'
          });
        }

        // Smooth squash-and-stretch recovery
        player.scaleX += (1 - player.scaleX) * Math.min(1, effectiveDt * 11);
        player.scaleY += (1 - player.scaleY) * Math.min(1, effectiveDt * 11);

        // Wing animation
        player.wingBoost = Math.max(0, player.wingBoost - effectiveDt * 3.2);
        player.wingPhase += effectiveDt * (11 + player.wingBoost * 20);

        // Smooth pitch rotation (up on flap, gradual nose-dive on fall)
        const targetRot = player.vy < 0
          ? -0.42
          : Math.min(1.25, (player.vy / MAX_FALL_SPEED) * 1.25);
        player.rotation += (targetRot - player.rotation) * Math.min(1, effectiveDt * (player.vy < 0 ? 15 : 6.5));

        // Ceiling clamp (gentle bounce, no unfair ceiling death)
        if (player.y < player.radius + 6) {
          player.y = player.radius + 6;
          player.vy = Math.max(0, player.vy);
        }

        // Ground collision
        if (player.y + player.radius >= height - GROUND_HEIGHT) {
          if (hasShield) {
            hasShield = false;
            invulnerableTimer = 1.2;
            streakCount = 0;
            sfx.playShieldBreak();
            triggerHaptic([50, 35, 60]);
            shakeTime = 0.22;
            shakeMagnitude = 8;
            player.y = height - GROUND_HEIGHT - player.radius - 2;
            player.vy = -340;
            emitExplosion(player.x, player.y, '#38BDF8');
            spawnPopup("🛡️ SHIELD BOUNCE!", player.x, player.y - 24, "#60A5FA");
          } else if (invulnerableTimer <= 0) {
            player.y = height - GROUND_HEIGHT - player.radius;
            triggerGameOver();
            return;
          }
        }

        // Spawn pillars
        pillarSpawnTimer -= effectiveDt;
        if (pillarSpawnTimer <= 0) {
          spawnPillar();
          pillarSpawnTimer = spawnInterval;
        }

        // Update pillars & check collisions
        for (let i = pillars.length - 1; i >= 0; i--) {
          const pil = pillars[i];
          pil.x -= speed * effectiveDt;

          // Subtle vertical bobbing for advanced pillars
          if (pil.bobAmp > 0) {
            pil.bobPhase += pil.bobSpeed * effectiveDt;
            pil.topHeight = pil.baseTopHeight + Math.sin(pil.bobPhase) * pil.bobAmp;
          }

          // Score check
          if (!pil.passed && pil.x + pil.width * 0.5 < player.x) {
            pil.passed = true;
            handleScoreIncrement(pil);
          }

          // Forgiving AABB vs Circle collision
          const insetX = 4;
          const left = pil.x + insetX;
          const right = pil.x + pil.width - insetX;
          const topBottom = pil.topHeight - 2;
          const bottomTop = pil.topHeight + pil.gap + 2;

          if (player.x + player.radius > left && player.x - player.radius < right) {
            if (player.y - player.radius < topBottom || player.y + player.radius > bottomTop) {
              if (hasShield) {
                hasShield = false;
                invulnerableTimer = 1.2;
                streakCount = 0;
                sfx.playShieldBreak();
            triggerHaptic([50, 35, 60]);
                shakeTime = 0.22;
                shakeMagnitude = 8;
                flashAlpha = 0.45;
                emitExplosion(player.x, player.y, '#38BDF8');
                spawnPopup("🛡️ SHIELD SAVED YOU!", player.x, player.y - 24, "#60A5FA");
                // Bounce player slightly toward center
                player.vy = (player.y < (topBottom + bottomTop) * 0.5) ? 140 : -140;
              } else if (invulnerableTimer <= 0) {
                triggerGameOver();
                return;
              }
            }
          }

          if (pil.x + pil.width < -20) {
            pillars.splice(i, 1);
          }
        }

        // Update pickups & check collection
        for (let i = pickups.length - 1; i >= 0; i--) {
          const p = pickups[i];
          p.x -= speed * effectiveDt;
          p.phase += effectiveDt * 3.5;
          p.y = p.baseY + Math.sin(p.phase) * 6;

          if (!p.collected && Math.hypot(player.x - p.x, player.y - p.y) < player.radius + 16) {
            p.collected = true;
            if (p.type === 'coffee') {
              coffeeSlowMoTimer = 3.5;
              sfx.playCoffee();
              triggerHaptic([30, 30, 40]);
              spawnPopup("☕ COFFEE HIGH!", p.x, p.y, "#F59E0B");
              emitExplosion(p.x, p.y, '#F59E0B');
            } else if (p.type === 'shield') {
              hasShield = true;
              sfx.playPowerup();
              triggerHaptic([30, 30, 40]);
              spawnPopup("🛡️ DEAN'S PASS!", p.x, p.y, "#38BDF8");
              emitExplosion(p.x, p.y, '#38BDF8');
            } else {
              score += 2;
              liveScoreEl.textContent = score;
              sfx.playPowerup();
              spawnPopup("⭐ BONUS +2!", p.x, p.y, "#FACC15");
              emitExplosion(p.x, p.y, '#FFD100');
            }
          }

          if (p.x < -30 || p.collected) {
            pickups.splice(i, 1);
          }
        }
      }

      /* -----------------------------------------------------------------------
       * 10. RENDERING PIPELINE (STI College Laoag & Ilocos Scenery)
       * --------------------------------------------------------------------- */
      function drawSkyAndStars() {
        const sky = getCurrentSky();
        const grad = ctx.createLinearGradient(0, 0, 0, height - GROUND_HEIGHT);
        grad.addColorStop(0, sky.top);
        grad.addColorStop(0.58, sky.mid);
        grad.addColorStop(1, sky.bot);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height - GROUND_HEIGHT);

        // Sun / Moon glow
        const sunY = lerp(95, 195, Math.min(score / 30, 1));
        const sunGrad = ctx.createRadialGradient(width * 0.78, sunY, 8, width * 0.78, sunY, 72);
        sunGrad.addColorStop(0, 'rgba(255, 245, 180, 0.92)');
        sunGrad.addColorStop(0.4, 'rgba(255, 209, 0, 0.35)');
        sunGrad.addColorStop(1, 'rgba(255, 209, 0, 0)');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(width * 0.78, sunY, 72, 0, Math.PI * 2);
        ctx.fill();

        // Twinkling stars at sunset/night
        if (sky.starAlpha > 0.02) {
          ctx.save();
          for (let i = 0; i < stars.length; i++) {
            const s = stars[i];
            const twinkle = 0.45 + 0.55 * Math.sin(globalTime * 2.8 + s.phase);
            ctx.fillStyle = `rgba(255, 250, 220, ${sky.starAlpha * twinkle})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      }

      function drawClouds() {
        ctx.save();
        for (let i = 0; i < clouds.length; i++) {
          const c = clouds[i];
          ctx.save();
          ctx.translate(c.x, c.y);
          ctx.scale(c.scale, c.scale);
          ctx.fillStyle = `rgba(255, 255, 255, ${c.alpha})`;
          ctx.beginPath();
          ctx.arc(0, 0, 22, 0, Math.PI * 2);
          ctx.arc(22, -7, 26, 0, Math.PI * 2);
          ctx.arc(48, 0, 20, 0, Math.PI * 2);
          ctx.arc(24, 9, 22, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();
      }

      // Far Parallax: Ilocos Hills, Spinning Wind Turbines & Laoag Sinking Bell Tower
      function drawFarIlocosSkyline() {
        const baseY = height - GROUND_HEIGHT;
        const tileW = 420;
        const startX = -farScroll;

        ctx.save();
        for (let x = startX; x < width + tileW; x += tileW) {
          // Distant Ilocos rolling hills
          ctx.fillStyle = 'rgba(0, 56, 112, 0.24)';
          ctx.beginPath();
          ctx.moveTo(x, baseY);
          ctx.quadraticCurveTo(x + 95, baseY - 125, x + 210, baseY - 58);
          ctx.quadraticCurveTo(x + 320, baseY - 115, x + tileW, baseY - 36);
          ctx.lineTo(x + tileW, baseY);
          ctx.closePath();
          ctx.fill();

          // Iconic Ilocos Wind Turbines (Bangui/Burgos vibe)
          drawWindTurbine(x + 76, baseY - 82, 54, globalTime * 1.9);
          drawWindTurbine(x + 126, baseY - 68, 42, globalTime * 2.2 + 1.1);

          // Iconic Laoag Sinking Bell Tower Silhouette
          drawSinkingBellTower(x + 292, baseY - 26);
        }
        ctx.restore();
      }

      function drawWindTurbine(cx, topY, poleH, angle) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(cx, topY + poleH);
        ctx.lineTo(cx, topY);
        ctx.stroke();

        // Spinning 3 blades
        ctx.translate(cx, topY);
        ctx.rotate(angle);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
        for (let b = 0; b < 3; b++) {
          ctx.rotate((Math.PI * 2) / 3);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-2.2, -16);
          ctx.lineTo(0, -21);
          ctx.lineTo(2.2, -16);
          ctx.closePath();
          ctx.fill();
        }
        ctx.fillStyle = '#FFD100';
        ctx.beginPath();
        ctx.arc(0, 0, 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      function drawSinkingBellTower(cx, baseY) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 45, 90, 0.36)';
        // Base brick tier
        ctx.fillRect(cx - 22, baseY - 46, 44, 52);
        // Middle tier
        ctx.fillRect(cx - 17, baseY - 82, 34, 38);
        // Upper belfry
        ctx.fillRect(cx - 12, baseY - 108, 24, 28);
        // Domed top + cross
        ctx.beginPath();
        ctx.arc(cx, baseY - 108, 12, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(cx - 1.2, baseY - 128, 2.4, 10);
        ctx.fillRect(cx - 4.5, baseY - 125, 9, 2);

        // Arched belfry windows
        ctx.fillStyle = 'rgba(255, 230, 140, 0.4)';
        ctx.beginPath();
        ctx.arc(cx, baseY - 94, 4, Math.PI, 0);
        ctx.fillRect(cx - 4, baseY - 94, 8, 8);
        ctx.fill();
        ctx.restore();
      }

      // Mid Parallax: Stylized STI College Laoag Campus Building
      function drawMidCampusSkyline() {
        const baseY = height - GROUND_HEIGHT;
        const tileW = 440;
        const startX = -midScroll;

        ctx.save();
        for (let x = startX; x < width + tileW; x += tileW) {
          // Flanking trees / campus foliage
          ctx.fillStyle = 'rgba(0, 75, 147, 0.35)';
          ctx.beginPath();
          ctx.arc(x + 40, baseY - 14, 26, 0, Math.PI * 2);
          ctx.arc(x + 68, baseY - 10, 22, 0, Math.PI * 2);
          ctx.arc(x + 365, baseY - 14, 28, 0, Math.PI * 2);
          ctx.arc(x + 398, baseY - 10, 22, 0, Math.PI * 2);
          ctx.fill();

          // Stylized STI College Laoag Campus Building
          const bx = x + 118;
          const bw = 204;
          const bh = 96;
          const by = baseY - bh;

          // Building body
          ctx.fillStyle = 'rgba(0, 48, 98, 0.56)';
          ctx.fillRect(bx, by, bw, bh);

          // STI Royal Blue & Gold Roof Accent
          ctx.fillStyle = 'rgba(0, 75, 147, 0.85)';
          ctx.fillRect(bx - 5, by - 10, bw + 10, 12);
          ctx.fillStyle = 'rgba(255, 209, 0, 0.85)';
          ctx.fillRect(bx - 5, by + 2, bw + 10, 4);

          // Campus Signage Banner
          ctx.fillStyle = 'rgba(255, 209, 0, 0.92)';
          ctx.font = '800 9px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('STI COLLEGE LAOAG', bx + bw / 2, by - 1);

          // Glowing classroom windows
          ctx.fillStyle = 'rgba(255, 232, 130, 0.42)';
          for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 6; col++) {
              ctx.fillRect(bx + 14 + col * 30, by + 16 + row * 24, 18, 13);
            }
          }
        }
        ctx.restore();
      }

      // Obstacles: Towering STI Academic Hardbound Textbooks
      const BOOK_PALETTES = [
        { cover: '#004B93', spine: '#002E5C', light: '#1D70C9', gold: '#FFD100', text: '#EBF4FF' }, // STI Royal Blue
        { cover: '#B91C1C', spine: '#7F1D1D', light: '#DC2626', gold: '#FDE047', text: '#FEF2F2' }, // Crimson Hardbound
        { cover: '#047857', spine: '#064E3B', light: '#059669', gold: '#FDE047', text: '#ECFDF5' }, // Emerald Science
        { cover: '#D97706', spine: '#92400E', light: '#F59E0B', gold: '#FEF08A', text: '#FFFBEB' }, // STI Amber / Gold
        { cover: '#5B21B6', spine: '#4C1D95', light: '#7C3AED', gold: '#FDE047', text: '#F5F3FF' }, // Royal Purple
        { cover: '#0E7490', spine: '#155E75', light: '#06B6D4', gold: '#FFD100', text: '#ECFEFF' }, // Cyan Tech Blue
        { cover: '#1E293B', spine: '#0F172A', light: '#334155', gold: '#FACC15', text: '#F8FAFC' }  // Dark Slate IT
      ];

      const BOOK_TITLES = [
        'IT 101', 'JAVA', 'WEB DEV', 'ALGORITHMS', 'C++', 'CALCULUS', 
        'NETWORKING', 'STI CS', 'DATA SCI', 'SYS ARCH', 'ENGLISH', 'UI/UX', 
        'COMP ENG', 'AI TECH', 'TOURISM', 'ACCT 1', 'MOBILE DEV', 'DATABASE', 
        'PYTHON', 'SHS TECH'
      ];

      function drawPillars() {
        for (let i = 0; i < pillars.length; i++) {
          const pil = pillars[i];
          const topH = pil.topHeight;
          const botY = pil.topHeight + pil.gap;
          const botH = height - GROUND_HEIGHT - botY;

          drawSingleBookStack(pil, pil.x, 0, pil.width, topH, true);
          drawSingleBookStack(pil, pil.x, botY, pil.width, botH, false);
        }
      }

      function drawSingleBookStack(pil, x, startY, w, h, isTop) {
        if (h <= 0) return;
        ctx.save();

        const bookH = 26;
        const totalBooks = Math.ceil(h / bookH) + 1;

        for (let k = 0; k < totalBooks; k++) {
          let rawBy, bh;
          if (isTop) {
            // Stack hangs down from ceiling; k=0 is the Hero Book touching the gap at h
            rawBy = h - (k + 1) * bookH;
            if (rawBy + bookH < 0) break;
            const by = Math.max(0, rawBy);
            bh = Math.min(bookH - 2.5, (rawBy < 0) ? (rawBy + bookH) : (bookH - 2.5));
            if (bh <= 3) continue;
            drawSingleBook(pil, x, by, bh, w, isTop, k);
          } else {
            // Stack rises from ground; k=0 is the Hero Book touching the gap at startY
            rawBy = startY + k * bookH;
            if (rawBy >= startY + h) break;
            const by = rawBy;
            bh = Math.min(bookH - 2.5, (startY + h) - rawBy);
            if (bh <= 3) continue;
            drawSingleBook(pil, x, by, bh, w, isTop, k);
          }
        }

        ctx.restore();
      }

      function drawSingleBook(pil, x, by, bh, w, isTop, k) {
        const bookSeed = ((pil.seed || 101) + (isTop ? 5432 : 1234) + k * 37);
        const p = BOOK_PALETTES[bookSeed % BOOK_PALETTES.length];
        const title = BOOK_TITLES[bookSeed % BOOK_TITLES.length];

        // Organic stack jitter (-2px to +2px)
        const jitter = ((bookSeed % 5) - 2) * 0.9;
        const widthMod = ((bookSeed % 3) - 1) * 1.5;
        const bx = x + jitter;
        const bw = w + widthMod;

        // 1. Soft Drop Shadow below book
        ctx.fillStyle = 'rgba(0, 10, 25, 0.28)';
        ctx.fillRect(bx + 1, by + bh, bw - 2, 2.5);

        // 2. Spine Background with 3D Curvature Gradient
        const spineGrad = ctx.createLinearGradient(bx, by, bx, by + bh);
        spineGrad.addColorStop(0, p.light);
        spineGrad.addColorStop(0.2, p.cover);
        spineGrad.addColorStop(0.8, p.cover);
        spineGrad.addColorStop(1, p.spine);

        ctx.fillStyle = spineGrad;
        roundRectPath(ctx, bx, by, bw, bh, 3.5);
        ctx.fill();

        // Dark binding border
        ctx.strokeStyle = p.spine;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // 3. Cylindrical Horizontal Light Reflection
        const horizShade = ctx.createLinearGradient(bx, 0, bx + bw, 0);
        horizShade.addColorStop(0, 'rgba(0,0,0,0.22)');
        horizShade.addColorStop(0.12, 'rgba(255,255,255,0.14)');
        horizShade.addColorStop(0.4, 'rgba(255,255,255,0)');
        horizShade.addColorStop(0.72, 'rgba(0,0,0,0.08)');
        horizShade.addColorStop(1, 'rgba(0,0,0,0.32)');
        ctx.fillStyle = horizShade;
        roundRectPath(ctx, bx, by, bw, bh, 3.5);
        ctx.fill();

        // 4. Fore-Edge Paper Block (Right side showing paper pages)
        const pageW = 12;
        const pageX = bx + bw - pageW - 2;
        const pageY = by + 2;
        const pageH = bh - 4;
        if (pageH > 3) {
          ctx.fillStyle = '#FFFDEC';
          ctx.fillRect(pageX, pageY, pageW, pageH);

          // Subtle horizontal page lines
          ctx.fillStyle = 'rgba(160, 135, 95, 0.4)';
          if (pageH >= 7) {
            ctx.fillRect(pageX + 1, pageY + Math.floor(pageH * 0.35), pageW - 2, 1);
            ctx.fillRect(pageX + 1, pageY + Math.floor(pageH * 0.7), pageW - 2, 1);
          }

          // Hardcover outer lip
          ctx.fillStyle = p.spine;
          ctx.fillRect(bx + bw - 2.5, by, 2.5, bh);
        }

        // 5. Gold Foil Raised Spine Ribs
        ctx.fillStyle = p.gold;
        ctx.fillRect(bx + 4, by + 2.5, 2, bh - 5);
        ctx.fillRect(bx + 8, by + 2.5, 1.2, bh - 5);

        // 6. Embossed Course / Subject Title on Spine
        if (bh >= 14) {
          ctx.save();
          ctx.font = 'bold 8.5px "Montserrat", sans-serif';
          ctx.fillStyle = p.text;
          ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
          ctx.shadowBlur = 2;
          ctx.fillText(title, bx + 16, by + bh * 0.5 + 3);
          ctx.restore();
        }

        // 7. Hero Book Polish (k === 0 at the gap)
        if (k === 0) {
          // Brass metal corner protectors on opening edge
          if (bh > 12) {
            ctx.fillStyle = '#FFD100';
            const cornerSize = 7.5;
            const cy = isTop ? (by + bh - cornerSize) : by;
            ctx.beginPath();
            ctx.moveTo(bx, cy + (isTop ? cornerSize : 0));
            ctx.lineTo(bx + cornerSize, cy + (isTop ? cornerSize : 0));
            ctx.lineTo(bx, cy + (isTop ? 0 : cornerSize));
            ctx.closePath();
            ctx.fill();

            // Tiny brass rivet
            ctx.fillStyle = '#78350F';
            ctx.fillRect(bx + 2, cy + (isTop ? 4.5 : 1.5), 1.5, 1.5);
          }

          // Animated Satin Bookmark Ribbon fluttering in the gap
          const ribbonColor = pil.ribbonColor || '#E11D48';
          const rx = bx + bw - 14;
          const ry = isTop ? (by + bh) : by;
          const sway = Math.sin(globalTime * 4.8 + pil.x * 0.05) * 4.5;

          ctx.save();
          ctx.strokeStyle = ribbonColor;
          ctx.lineWidth = 3.2;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          if (isTop) {
            ctx.quadraticCurveTo(rx + sway * 0.5, ry + 9, rx + sway, ry + 18);
          } else {
            ctx.quadraticCurveTo(rx + sway * 0.5, ry - 8, rx + sway, ry - 16);
          }
          ctx.stroke();

          // Golden tipped ribbon edge
          ctx.strokeStyle = '#FFD100';
          ctx.lineWidth = 3.2;
          ctx.beginPath();
          if (isTop) {
            ctx.moveTo(rx + sway - 0.5, ry + 16);
            ctx.lineTo(rx + sway, ry + 18);
          } else {
            ctx.moveTo(rx + sway - 0.5, ry - 14);
            ctx.lineTo(rx + sway, ry - 16);
          }
          ctx.stroke();
          ctx.restore();
        }
      }

      // Foreground Scrolling Ground with STI Blue-and-Yellow Architectural Curb
      function drawGround() {
        const gy = height - GROUND_HEIGHT;

        // Top golden trim
        ctx.fillStyle = '#FFD100';
        ctx.fillRect(0, gy, width, 6);

        // STI Diagonal Blue-and-Gold Striped Curb
        const curbH = 18;
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, gy + 6, width, curbH);
        ctx.clip();

        ctx.fillStyle = '#004B93';
        ctx.fillRect(0, gy + 6, width, curbH);

        ctx.fillStyle = '#FFD100';
        const stripeW = 24;
        for (let sx = -groundScroll - 48; sx < width + 48; sx += 48) {
          ctx.beginPath();
          ctx.moveTo(sx, gy + 6 + curbH);
          ctx.lineTo(sx + 12, gy + 6);
          ctx.lineTo(sx + 12 + stripeW, gy + 6);
          ctx.lineTo(sx + stripeW, gy + 6 + curbH);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();

        // Deep Navy Campus Walkway Base
        const baseGrad = ctx.createLinearGradient(0, gy + 24, 0, height);
        baseGrad.addColorStop(0, '#00356B');
        baseGrad.addColorStop(1, '#001C3D');
        ctx.fillStyle = baseGrad;
        ctx.fillRect(0, gy + 24, width, GROUND_HEIGHT - 24);

        // Crisp subtle divider line
        ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
        ctx.fillRect(0, gy + 24, width, 2);
      }

      // Pickups: Coffee Cup, Dean's Pass Shield, Golden Star
      function drawPickups() {
        for (let i = 0; i < pickups.length; i++) {
          const p = pickups[i];
          if (p.collected) continue;

          ctx.save();
          ctx.translate(p.x, p.y);

          // Glowing aura
          ctx.save();
          ctx.shadowBlur = 12;
          if (p.type === 'coffee') {
            ctx.shadowColor = '#F59E0B';
            // Coffee Cup icon
            ctx.fillStyle = '#FEF3C7';
            ctx.beginPath();
            ctx.arc(0, 0, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#F59E0B';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#B45309';
            ctx.fillRect(-7, -4, 14, 11);
            // Handle
            ctx.strokeStyle = '#B45309';
            ctx.lineWidth = 2;
            ctx.strokeRect(7, -2, 4, 6);
            // Steam
            ctx.strokeStyle = 'rgba(217, 119, 6, 0.85)';
            ctx.lineWidth = 1.6;
            const steamY = Math.sin(globalTime * 6 + p.x) * 2;
            ctx.beginPath();
            ctx.moveTo(-3, -6);
            ctx.lineTo(-3, -11 + steamY);
            ctx.moveTo(3, -6);
            ctx.lineTo(3, -11 - steamY);
            ctx.stroke();
          } else if (p.type === 'shield') {
            ctx.shadowColor = '#38BDF8';
            // Glowing Blue Shield Badge
            ctx.fillStyle = '#0284C7';
            ctx.beginPath();
            ctx.arc(0, 0, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#38BDF8';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Shield Crest
            ctx.fillStyle = '#38BDF8';
            ctx.beginPath();
            ctx.moveTo(0, -9);
            ctx.lineTo(8, -5);
            ctx.lineTo(6, 4);
            ctx.lineTo(0, 10);
            ctx.lineTo(-6, 4);
            ctx.lineTo(-8, -5);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#FFD100';
            ctx.fillRect(-2, -5, 4, 10);
            ctx.fillRect(-5, -2, 10, 4);
          } else {
            ctx.shadowColor = '#FACC15';
            // Golden Star
            ctx.fillStyle = '#FEF08A';
            ctx.beginPath();
            ctx.arc(0, 0, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#F59E0B';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#FFD100';
            ctx.beginPath();
            for (let s = 0; s < 5; s++) {
              const a1 = (s * Math.PI * 2) / 5 - Math.PI / 2;
              const a2 = a1 + Math.PI / 5;
              ctx.lineTo(Math.cos(a1) * 11, Math.sin(a1) * 11);
              ctx.lineTo(Math.cos(a2) * 5, Math.sin(a2) * 5);
            }
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#B45309';
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
          ctx.restore();
          ctx.restore();
        }
      }

      // Player Character: Custom-Drawn STI Logo Emblem with Animated Golden Wings
      function drawPlayer() {
        if (gameState === STATE.START) return; // Start overlay shows hero SVG emblem

        // Invulnerability flashing (e.g. after shield break)
        if (invulnerableTimer > 0 && Math.floor(globalTime * 18) % 2 === 0) {
          return;
        }

        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.rotation);
        ctx.scale(player.scaleX, player.scaleY);

        const flapAngle = Math.sin(player.wingPhase) * (0.48 + player.wingBoost * 0.42);

        // Golden Wings (Classic STI Emblem)
        const wingPrimary = '#FFD100';
        const wingSecondary = '#FFE875';
        const wingStroke = '#9E6B00';

        // Back/Left Wing
        drawWing(-20, 2, -1, flapAngle, wingPrimary, wingSecondary, wingStroke);
        // Right/Trailing Wing
        drawWing(18, 2, 1, -flapAngle * 0.85, wingPrimary, wingSecondary, wingStroke);

        // Main STI Rounded Royal-Blue Badge
        const bw = player.width;
        const bh = player.height;
        const bx = -bw / 2;
        const by = -bh / 2;

        // Soft drop shadow
        ctx.save();
        ctx.shadowColor = 'rgba(0, 20, 50, 0.45)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;

        const badgeGrad = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
        badgeGrad.addColorStop(0, '#0068CC');
        badgeGrad.addColorStop(0.55, '#004B93');
        badgeGrad.addColorStop(1, '#00274F');

        ctx.fillStyle = badgeGrad;
        roundRectPath(ctx, bx, by, bw, bh, 11);
        ctx.fill();
        ctx.restore();

        // Golden / Cyber Border
        ctx.strokeStyle = '#FFD100';
        ctx.lineWidth = 3;
        roundRectPath(ctx, bx, by, bw, bh, 11);
        ctx.stroke();

        // Glossy Top Highlight
        ctx.save();
        roundRectPath(ctx, bx + 2, by + 2, bw - 4, bh * 0.44, 9);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.fill();
        ctx.restore();

        // Bold "STI" Lettering
        ctx.font = '900 21px "Outfit", "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(0, 24, 56, 0.55)';
        ctx.fillText('STI', 0, 2.5);
        ctx.fillStyle = '#FFD100';
        ctx.fillText('STI', 0, 1);

        // Active Energy Shield Bubble
        if (hasShield) {
          ctx.save();
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 2.8;
          ctx.shadowColor = '#0284C7';
          ctx.shadowBlur = 14;
          const shieldPulse = Math.sin(globalTime * 6) * 2;
          ctx.beginPath();
          ctx.arc(0, 0, player.radius + 14 + shieldPulse, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
          ctx.fill();
          ctx.restore();
        }

        ctx.restore();
      }

      function drawWing(offsetX, offsetY, dir, angle, col1 = '#FFD100', col2 = '#FFE875', strk = '#9E6B00') {
        ctx.save();
        ctx.translate(offsetX, offsetY);
        ctx.scale(dir, 1);
        ctx.rotate(angle);

        // Upper feather
        ctx.fillStyle = col1;
        ctx.strokeStyle = strk;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(14, -14, 24, -7);
        ctx.quadraticCurveTo(16, 2, 2, 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Lower lighter feather
        ctx.fillStyle = col2;
        ctx.beginPath();
        ctx.moveTo(0, 3);
        ctx.quadraticCurveTo(11, -3, 18, 4);
        ctx.quadraticCurveTo(11, 9, 0, 8);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      function drawParticlesAndEffects() {
        // Flap particles
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          if (p.type === 'star') {
            ctx.translate(p.x, p.y);
            ctx.rotate(globalTime * 4);
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          } else {
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        // Confetti
        for (let i = 0; i < confetti.length; i++) {
          const c = confetti[i];
          ctx.save();
          ctx.globalAlpha = Math.max(0, c.life);
          ctx.translate(c.x, c.y);
          ctx.rotate(c.rot);
          ctx.fillStyle = c.color;
          ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
          ctx.restore();
        }

        // Floating score & quote popups
        for (let i = 0; i < popups.length; i++) {
          const pop = popups[i];
          ctx.save();
          ctx.globalAlpha = Math.max(0, pop.life);
          ctx.font = pop.font || '900 20px "Outfit", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#001A38';
          ctx.fillText(pop.text, pop.x + 1.5, pop.y + 2);
          ctx.fillStyle = pop.color || '#FFD100';
          ctx.fillText(pop.text, pop.x, pop.y);
          ctx.restore();
        }

        // Brief collision white flash
        if (flashAlpha > 0) {
          ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
          ctx.fillRect(0, 0, width, height);
        }
      }

      function roundRectPath(c, x, y, w, h, r) {
        const radius = Math.min(r, w / 2, h / 2);
        c.beginPath();
        c.moveTo(x + radius, y);
        c.arcTo(x + w, y, x + w, y + h, radius);
        c.arcTo(x + w, y + h, x, y + h, radius);
        c.arcTo(x, y + h, x, y, radius);
        c.arcTo(x, y, x + w, y, radius);
        c.closePath();
      }

      function render() {
        ctx.save();

        // Subtle screen shake on impact
        if (shakeTime > 0) {
          const mag = shakeMagnitude * (shakeTime / 0.28);
          ctx.translate((Math.random() - 0.5) * mag * 2, (Math.random() - 0.5) * mag * 2);
        }

        drawSkyAndStars();
        drawClouds();
        drawFarIlocosSkyline();
        drawMidCampusSkyline();
        drawPillars();
        drawPickups();
        drawGround();
        drawPlayer();
        drawParticlesAndEffects();

        ctx.restore();
      }

      /* -----------------------------------------------------------------------
       * 11. MAIN ANIMATION LOOP & INPUT LISTENERS
       * --------------------------------------------------------------------- */
      let lastFrameTime = 0;

      function gameLoop(timestamp) {
        if (!lastFrameTime) lastFrameTime = timestamp;
        const dt = Math.min(0.05, (timestamp - lastFrameTime) / 1000);
        lastFrameTime = timestamp;

        update(dt);
        render();
        requestAnimationFrame(gameLoop);
      }

      function handlePrimaryInput(e) {
        if (e && e.target && e.target.closest('button, input')) return;
        if (gameState === STATE.PLAYING) {
          flap();
        }
      }

      // Pointer & Touch on Canvas
      canvas.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        handlePrimaryInput(e);
      });

      // Keyboard Controls
      window.addEventListener('keydown', (e) => {
        if (e.target && e.target.tagName === 'INPUT') return;

        if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
          e.preventDefault();
          if (gameState === STATE.START) {
            startGame();
          } else if (gameState === STATE.PLAYING) {
            flap();
          } else if (gameState === STATE.GAMEOVER && performance.now() - gameOverTimestamp > 500) {
            startGame();
          }
        } else if (e.code === 'Enter') {
          if (gameState === STATE.START) {
            startGame();
          } else if (gameState === STATE.GAMEOVER && performance.now() - gameOverTimestamp > 500) {
            startGame();
          }
        } else if (e.code === 'KeyP' || e.code === 'Escape') {
          if (gameState === STATE.PLAYING || gameState === STATE.PAUSED) {
            togglePause();
          }
        } else if (e.code === 'KeyM') {
          updateSoundButtonUI(sfx.toggle());
        }
      });

      function updateSoundButtonUI(isOn) {
        if (isOn) {
          soundOnIcon.classList.remove('hidden');
          soundOffIcon.classList.add('hidden');
        } else {
          soundOnIcon.classList.add('hidden');
          soundOffIcon.classList.remove('hidden');
        }
      }

// Report Card Modal Handlers
      openReportCardBtn.addEventListener('click', () => {
        showOverlay(reportCardModal);
      });
      closeReportCardBtn.addEventListener('click', () => {
        hideOverlay(reportCardModal);
      });

      certStudentName.addEventListener('input', () => {
        saveStudentName(certStudentName.value.trim());
      });

      saveCertImgBtn.addEventListener('click', () => {
        triggerHaptic(12);
        downloadCertificateImage();
      });
      copyCertTextBtn.addEventListener('click', () => {
        triggerHaptic(12);
        copyScoreToClipboard();
      });

            function downloadCertificateImage() {
        const studentName = certStudentName.value.trim() || 'Certified STIer';
        const rank = getStudentRank(score);
        
        // High-res offscreen canvas (800 x 1040)
        const offCanvas = document.createElement('canvas');
        offCanvas.width = 800;
        offCanvas.height = 1040;
        const octx = offCanvas.getContext('2d');

        // 1. Background Gradient (Deep Royal STI Navy)
        const bgGrad = octx.createLinearGradient(0, 0, 800, 1040);
        bgGrad.addColorStop(0, '#001026');
        bgGrad.addColorStop(0.3, '#001E42');
        bgGrad.addColorStop(0.7, '#002654');
        bgGrad.addColorStop(1, '#000D1F');
        octx.fillStyle = bgGrad;
        octx.fillRect(0, 0, 800, 1040);

        // Soft Radial Glow in Center
        const radGlow = octx.createRadialGradient(400, 520, 60, 400, 520, 460);
        radGlow.addColorStop(0, 'rgba(0, 80, 180, 0.18)');
        radGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        octx.fillStyle = radGlow;
        octx.fillRect(0, 0, 800, 1040);

        // 2. Double Gold Certificate Borders
        // Outer Border
        octx.strokeStyle = '#FFD100';
        octx.lineWidth = 6;
        octx.strokeRect(26, 26, 748, 988);

        // Thin Accent Border
        octx.strokeStyle = 'rgba(255, 209, 0, 0.4)';
        octx.lineWidth = 1.2;
        octx.strokeRect(36, 36, 728, 968);

        // Inner Border
        octx.strokeStyle = '#EAB308';
        octx.lineWidth = 2;
        octx.strokeRect(44, 44, 712, 952);

        // Corner Cornerpieces / Ornaments
        [ [44, 44], [756, 44], [44, 996], [756, 996] ].forEach(([cx, cy]) => {
          octx.fillStyle = '#FFD100';
          octx.beginPath();
          octx.arc(cx, cy, 7, 0, Math.PI * 2);
          octx.fill();

          octx.strokeStyle = '#92400E';
          octx.lineWidth = 1.5;
          octx.stroke();

          // Small outer diamond accents
          octx.fillStyle = '#FFE66D';
          octx.fillRect(cx - 3, cy - 3, 6, 6);
        });

        // 3. STI Winged Emblem (Drawn at Top Center)
        drawCertificateEmblem(octx, 400, 95);

        // 4. Header Titles
        octx.textAlign = 'center';
        octx.fillStyle = '#FFD100';
        octx.font = '900 32px "Outfit", sans-serif';
        octx.fillText('STI COLLEGE LAOAG', 400, 160);

        octx.fillStyle = '#93C5FD';
        octx.font = 'bold 12px "Montserrat", sans-serif';
        octx.letterSpacing = '3px';
        octx.fillText('OFFICIAL CERTIFICATE OF MERIT & ACADEMIC ACHIEVEMENT', 400, 190);

        // 5. Presentation Line
        octx.fillStyle = '#CBD5E1';
        octx.font = 'italic 16px "Georgia", serif';
        octx.letterSpacing = '0px';
        octx.fillText('This certifies with high academic distinction that', 400, 238);

        // 6. Student Name
        octx.fillStyle = '#FFD100';
        octx.font = '900 42px "Outfit", sans-serif';
        octx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        octx.shadowBlur = 10;
        octx.shadowOffsetY = 3;
        octx.fillText(studentName, 400, 292);
        octx.shadowColor = 'transparent';

        // Underline with Center Diamond
        octx.strokeStyle = '#FFD100';
        octx.lineWidth = 2;
        octx.beginPath();
        octx.moveTo(180, 310);
        octx.lineTo(380, 310);
        octx.moveTo(420, 310);
        octx.lineTo(620, 310);
        octx.stroke();

        // Center Diamond Ornament
        octx.fillStyle = '#FFD100';
        octx.beginPath();
        octx.moveTo(400, 303);
        octx.lineTo(408, 310);
        octx.lineTo(400, 317);
        octx.lineTo(392, 310);
        octx.closePath();
        octx.fill();

        // 7. Citation Text (Balanced 3 Short Lines, Max Width 520px - Zero Overflow!)
        octx.fillStyle = '#E2E8F0';
        octx.font = 'normal 15px "Georgia", serif';
        octx.fillText('for demonstrating exceptional focus, academic resilience, and excellence', 400, 350);
        octx.fillText('in soaring past towering collegiate textbooks across the skies of Laoag City,', 400, 376);
        octx.fillText('mastering rigorous obstacles and embodying the true spirit of an STIer.', 400, 402);

        // 8. Latin Honor / Rank Badge Card
        const cardX = 140;
        const cardY = 438;
        const cardW = 520;
        const cardH = 210;

        // Card Background
        const cardGrad = octx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
        cardGrad.addColorStop(0, 'rgba(0, 32, 70, 0.85)');
        cardGrad.addColorStop(1, 'rgba(0, 16, 38, 0.95)');
        octx.fillStyle = cardGrad;
        roundRectPath(octx, cardX, cardY, cardW, cardH, 18);
        octx.fill();

        // Card Golden Border
        octx.strokeStyle = '#FFD100';
        octx.lineWidth = 2.5;
        roundRectPath(octx, cardX, cardY, cardW, cardH, 18);
        octx.stroke();

        // Vector Medallion with Ribbon
        drawCertificateMedal(octx, 400, 492);

        // Rank Title
        octx.fillStyle = '#FFFFFF';
        octx.font = '900 30px "Outfit", sans-serif';
        octx.fillText(rank.title.toUpperCase(), 400, 560);

        // Score Pill
        const pillW = 380;
        const pillH = 30;
        const pillX = 400 - pillW / 2;
        const pillY = 576;
        octx.fillStyle = 'rgba(255, 209, 0, 0.14)';
        roundRectPath(octx, pillX, pillY, pillW, pillH, 15);
        octx.fill();
        octx.strokeStyle = 'rgba(255, 209, 0, 0.45)';
        octx.lineWidth = 1;
        roundRectPath(octx, pillX, pillY, pillW, pillH, 15);
        octx.stroke();

        octx.fillStyle = '#FFD100';
        octx.font = 'bold 14px "Montserrat", sans-serif';
        octx.fillText(`Academic Score: ${score} pts   |   Campus Best: ${bestScore} pts`, 400, 596);

        // Remark Text
        octx.fillStyle = '#93C5FD';
        octx.font = 'italic 12px "Montserrat", sans-serif';
        octx.fillText(`"${getFunnyRemark(score)}"`, 400, 630);

        // 9. Motto
        octx.fillStyle = '#38BDF8';
        octx.font = 'bold italic 18px "Outfit", sans-serif';
        octx.letterSpacing = '2px';
        octx.fillText('"BE FUTURE-READY"', 400, 686);
        octx.letterSpacing = '0px';

        // 10. Official Gold Seal of STI College Laoag (Center)
        // Elegant flanking golden ribbons
        octx.strokeStyle = 'rgba(255, 209, 0, 0.6)';
        octx.lineWidth = 1.5;
        octx.beginPath();
        octx.moveTo(140, 785);
        octx.lineTo(330, 785);
        octx.moveTo(470, 785);
        octx.lineTo(660, 785);
        octx.stroke();

        // Flanking diamond accents
        octx.fillStyle = '#FFD100';
        [ [140, 785], [660, 785] ].forEach(([px, py]) => {
          octx.beginPath();
          octx.moveTo(px, py - 4);
          octx.lineTo(px + 4, py);
          octx.lineTo(px, py + 4);
          octx.lineTo(px - 4, py);
          octx.closePath();
          octx.fill();
        });

        // Center Embossed Gold Seal
        drawCertificateSeal(octx, 400, 785);

        // 11. Footer Metadata & Date
        const now = new Date();
        const dateOptions = { month: 'long', day: 'numeric', year: 'numeric' };
        const dateFormatted = now.toLocaleDateString('en-US', dateOptions);

        octx.fillStyle = '#CBD5E1';
        octx.font = 'normal 12px "Montserrat", sans-serif';
        octx.fillText(`Conferred this ${dateFormatted} • Laoag City, Ilocos Norte, Philippines`, 400, 915);

        const certSerial = 'STI-LAOAG-' + Math.abs((score * 73 + bestScore * 37 + 2026)).toString(16).toUpperCase();
        octx.fillStyle = '#64748B';
        octx.font = 'bold 10px "Montserrat", monospace';
        octx.letterSpacing = '1px';
        octx.fillText(`OFFICIAL CREDENTIAL SERIAL: ${certSerial} • S.Y. 2026-2027`, 400, 938);
        octx.letterSpacing = '0px';

        // Trigger Instant PNG Download
        const link = document.createElement('a');
        link.download = `STI_Laoag_Certificate_${studentName.replace(/\s+/g, '_')}.png`;
        link.href = offCanvas.toDataURL('image/png');
        link.click();
      }

      function drawCertificateEmblem(ctx, cx, cy) {
        ctx.save();
        ctx.translate(cx, cy);

        // Left Wing
        ctx.fillStyle = '#FFD100';
        ctx.strokeStyle = '#B87D00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-18, 5);
        ctx.quadraticCurveTo(-40, -18, -58, 2);
        ctx.quadraticCurveTo(-45, 18, -18, 12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FFE66D';
        ctx.beginPath();
        ctx.moveTo(-17, 12);
        ctx.quadraticCurveTo(-38, 2, -50, 16);
        ctx.quadraticCurveTo(-34, 24, -16, 17);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Right Wing
        ctx.fillStyle = '#FFD100';
        ctx.beginPath();
        ctx.moveTo(18, 5);
        ctx.quadraticCurveTo(40, -18, 58, 2);
        ctx.quadraticCurveTo(45, 18, 18, 12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FFE66D';
        ctx.beginPath();
        ctx.moveTo(17, 12);
        ctx.quadraticCurveTo(38, 2, 50, 16);
        ctx.quadraticCurveTo(34, 24, 16, 17);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Central STI Badge
        const bw = 54, bh = 40;
        const badgeGrad = ctx.createLinearGradient(-bw/2, -bh/2, bw/2, bh/2);
        badgeGrad.addColorStop(0, '#0066CC');
        badgeGrad.addColorStop(0.55, '#004B93');
        badgeGrad.addColorStop(1, '#002952');
        ctx.fillStyle = badgeGrad;
        ctx.strokeStyle = '#FFD100';
        ctx.lineWidth = 3.5;
        roundRectPath(ctx, -bw/2, -bh/2, bw, bh, 10);
        ctx.fill();
        ctx.stroke();

        // Gloss
        roundRectPath(ctx, -bw/2 + 2, -bh/2 + 2, bw - 4, bh * 0.44, 7);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.fill();

        // STI Bold Text
        ctx.font = '900 20px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFD100';
        ctx.fillText('STI', 0, 1.5);

        ctx.restore();
      }

      function drawCertificateMedal(ctx, cx, cy) {
        ctx.save();
        ctx.translate(cx, cy);

        // Folded Ribbons
        // Left Blue Ribbon
        ctx.fillStyle = '#0052CC';
        ctx.beginPath();
        ctx.moveTo(-16, -26);
        ctx.lineTo(-24, 8);
        ctx.lineTo(-14, 2);
        ctx.lineTo(-6, 8);
        ctx.closePath();
        ctx.fill();

        // Right Crimson Ribbon
        ctx.fillStyle = '#DC2626';
        ctx.beginPath();
        ctx.moveTo(16, -26);
        ctx.lineTo(24, 8);
        ctx.lineTo(14, 2);
        ctx.lineTo(6, 8);
        ctx.closePath();
        ctx.fill();

        // Shiny Gold Medal Disc
        const medGrad = ctx.createRadialGradient(-5, -7, 4, 0, 0, 28);
        medGrad.addColorStop(0, '#FFF59D');
        medGrad.addColorStop(0.45, '#FFD100');
        medGrad.addColorStop(0.85, '#D97706');
        medGrad.addColorStop(1, '#92400E');
        ctx.fillStyle = medGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 28, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#FDE047';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Inner Embossed Ring
        ctx.strokeStyle = '#92400E';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.stroke();

        // Central Star
        ctx.fillStyle = '#FFFDE7';
        ctx.font = '22px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', 0, 1);

        ctx.restore();
      }

      function drawCertificateSeal(ctx, cx, cy) {
        ctx.save();
        ctx.translate(cx, cy);

        // 32-point Scalloped Starburst
        const points = 32;
        ctx.fillStyle = '#D97706';
        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
          const angle = (i * Math.PI) / points;
          const r = i % 2 === 0 ? 42 : 36;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();

        // Main Gold Disc
        const sealGrad = ctx.createRadialGradient(-8, -8, 5, 0, 0, 36);
        sealGrad.addColorStop(0, '#FFF59D');
        sealGrad.addColorStop(0.5, '#FFD100');
        sealGrad.addColorStop(1, '#B45309');
        ctx.fillStyle = sealGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 35, 0, Math.PI * 2);
        ctx.fill();

        // Outer rim
        ctx.strokeStyle = '#92400E';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Inner rim
        ctx.beginPath();
        ctx.arc(0, 0, 27, 0, Math.PI * 2);
        ctx.stroke();

        // Text
        ctx.fillStyle = '#78350F';
        ctx.font = 'bold 7.5px "Montserrat", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★ STI LAOAG ★', 0, -13);
        ctx.fillText('SEAL OF MERIT', 0, 13);
        ctx.font = '900 13px "Outfit", sans-serif';
        ctx.fillText('2026', 0, 0);

        ctx.restore();
      }

      function copyScoreToClipboard() {
        const studentName = certStudentName.value.trim() || 'STIer';
        const rank = getStudentRank(score);
        const text = `🎓 AIM HIGH WITH STI (Laoag Edition)\n👤 Flyer: ${studentName}\n🏅 Rank: ${rank.title} ${rank.emoji}\n🎯 Score: ${score} pts (Best: ${bestScore} pts)\n\nKaya mo bang higitan ang score ko sa Laoag skies? Be Future-Ready! 🚀`;
        navigator.clipboard.writeText(text).then(() => {
          certToast.classList.remove('hidden');
          setTimeout(() => certToast.classList.add('hidden'), 2500);
        });
      }

      // Button Event Listeners
      playNowBtn.addEventListener('click', () => {
        triggerHaptic(12);
        startGame();
      });
      playAgainBtn.addEventListener('click', () => {
        triggerHaptic(12);
        startGame();
      });
      pauseBtn.addEventListener('click', togglePause);
      resumeBtn.addEventListener('click', togglePause);
      pauseRestartBtn.addEventListener('click', startGame);
      soundBtn.addEventListener('click', () => updateSoundButtonUI(sfx.toggle()));

      // Auto-pause if browser tab loses visibility
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && gameState === STATE.PLAYING) {
          togglePause();
        }
      });

      window.addEventListener('resize', resizeCanvas);

      // Start everything safely on window load
      
      /* -----------------------------------------------------------------------
       * FLUTTER SPLASH SCREEN CONTROLLER
       * --------------------------------------------------------------------- */
      const splashScreenEl = document.getElementById('splashScreen');
      const splashStatusTextEl = document.getElementById('splashStatusText');
      const skipSplashBtn = document.getElementById('skipSplashBtn');
      let splashDismissed = false;

      function dismissSplashScreen() {
        if (splashDismissed || !splashScreenEl) return;
        splashDismissed = true;

        // Play uplifting STI startup chime
        try { sfx.playStartup(); } catch (e) {}

        // Add Flutter hero scale-out exit class
        splashScreenEl.classList.add('splash-dismissed');

        setTimeout(() => {
          if (splashScreenEl && splashScreenEl.parentNode) {
            splashScreenEl.style.display = 'none';
          }
        }, 700);
      }

      if (splashScreenEl) {
        // Dynamic status updates
        setTimeout(() => {
          if (!splashDismissed && splashStatusTextEl) {
            splashStatusTextEl.textContent = 'Calibrating Laoag Textbooks... 📚';
          }
        }, 800);

        setTimeout(() => {
          if (!splashDismissed && splashStatusTextEl) {
            splashStatusTextEl.textContent = 'Campus Skyway Ready! 🚀';
          }
        }, 1600);

        // Auto-dismiss after 2.3 seconds
        setTimeout(() => {
          dismissSplashScreen();
        }, 2350);

        // Tap/click anywhere to skip immediately
        splashScreenEl.addEventListener('click', () => {
          dismissSplashScreen();
        });

        if (skipSplashBtn) {
          skipSplashBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dismissSplashScreen();
          });
        }

        // Space/Enter/Arrow keys to skip
        window.addEventListener('keydown', (e) => {
          if (!splashDismissed && (e.code === 'Space' || e.code === 'Enter')) {
            dismissSplashScreen();
          }
        }, { once: true });
      }

      window.onload = function () {
        syncBestScoreUI();
        resizeCanvas();
        initScenery();
        requestAnimationFrame(gameLoop);
      };
    })();
