/* game.js
   Core game loop: owns tent stats, feature state, day progression,
   scoring, and scene rendering. Ties together WeatherSystem,
   ParticleSystem, and UI. */

class TentDefenderGame {
  constructor() {
    this.canvas = document.getElementById('sceneCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.contourCanvas = document.getElementById('contourCanvas');
    this.contourCtx = this.contourCanvas.getContext('2d');

    this.ui = new UI();
    this.weather = new WeatherSystem();
    this.particles = new ParticleSystem(this.canvas);

    this.totalDays = 5;
    this.dayLength = 6; // seconds of real time per in-game day
    this.day = 1;
    this.dayTimer = 0;

    this.stats = { safety: 100, comfort: 100, battery: 0, durability: 100 };
    this.stats.battery = 60;

    this.features = { waterproof: false, stakes: false, solarFan: false };

    this.score = 0;
    this.running = false;
    this.lastTime = null;
    this.contourOffset = 0;

    this.assets = {};
    this._loadAssets();

    this.ui.setDayTotal(this.totalDays);
    this.ui.updateDay(this.day);
    this.ui.updateStats(this.stats);
    this.ui.updateWeather(this.weather.getInfo(), this.weather.getInfo(this.weather.next));

    this.weather.onChange = (current, previous) => this._onWeatherChange(current, previous);

    this.ui.bindFeatureToggle((feature) => this.toggleFeature(feature));
    this.ui.bindStart(() => this.start());
    this.ui.bindRestart(() => this.restart());

    window.addEventListener('resize', () => this._resize());
    this._resize();
    this._renderStatic(); // draw an idle frame behind the intro overlay
  }

  _loadAssets() {
    const files = ['tent', 'tree', 'cloud', 'sun', 'rain', 'lightning'];
    files.forEach(name => {
      const img = new Image();
      img.src = `assets/${name}.svg`;
      this.assets[name] = img;
    });
  }

  _resize() {
    const wrap = this.canvas.parentElement;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    [this.canvas, this.contourCanvas].forEach(c => {
      c.width = w;
      c.height = h;
    });
    this.particles.resize(w, h);
    if (!this.running) this._renderStatic();
  }

  toggleFeature(feature) {
    this.features[feature] = !this.features[feature];
    this.ui.updateFeatureButton(feature, this.features[feature]);
  }

  start() {
    this.ui.hideIntro();
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this._loop(t));
  }

  restart() {
    this.day = 1;
    this.dayTimer = 0;
    this.stats = { safety: 100, comfort: 100, battery: 60, durability: 100 };
    this.features = { waterproof: false, stakes: false, solarFan: false };
    Object.keys(this.features).forEach(f => this.ui.updateFeatureButton(f, false));
    this.score = 0;
    this.weather = new WeatherSystem();
    this.weather.onChange = (current, previous) => this._onWeatherChange(current, previous);
    this.ui.updateDay(this.day);
    this.ui.updateStats(this.stats);
    this.ui.updateScore(this.score);
    this.ui.updateWeather(this.weather.getInfo(), this.weather.getInfo(this.weather.next));
    this.ui.hideEnd();
    this.start();
  }

  _onWeatherChange(current, previous) {
    this.particles.setWeather(current);
    const info = this.weather.getInfo(current);
    this.ui.updateWeather(info, this.weather.getInfo(this.weather.next));
    this.ui.showToast(`Weather shifting to ${info.label}`);
    if (current === 'storm') this.particles.triggerLightning();
  }

  _loop(t) {
    if (!this.running) return;
    const dt = Math.min(0.05, (t - this.lastTime) / 1000);
    this.lastTime = t;

    this.update(dt);
    this.draw(t);

    if (this.running) requestAnimationFrame((nt) => this._loop(nt));
  }

  update(dt) {
    this.weather.update(dt);
    this.particles.update(dt);

    // apply per-second weather effects scaled by dt
    const eff = this.weather.getEffects(this.features);
    this.stats.safety += eff.safety * dt;
    this.stats.comfort += eff.comfort * dt;
    this.stats.battery += eff.battery * dt;
    this.stats.durability += eff.durability * dt;

    // natural comfort decay if battery is empty (no fan possible)
    if (this.stats.battery <= 0) {
      this.stats.battery = 0;
      if (this.features.solarFan) this.stats.comfort -= 0.5 * dt;
    }

    Object.keys(this.stats).forEach(k => {
      this.stats[k] = Math.max(0, Math.min(100, this.stats[k]));
    });

    // score accrues from average wellbeing each second
    const avg = (this.stats.safety + this.stats.comfort + this.stats.durability) / 3;
    this.score += (avg / 100) * dt * 10;

    this.ui.updateStats(this.stats);
    this.ui.updateScore(this.score);

    // day progression
    this.dayTimer += dt;
    if (this.dayTimer >= this.dayLength) {
      this.dayTimer = 0;
      this.day += 1;
      this.score += 25; // survival bonus per completed day
      if (this.day > this.totalDays) {
        this._endGame(true);
        return;
      }
      this.ui.updateDay(this.day);
      this.ui.showToast(`Day ${this.day} begins`);
    }

    // failure conditions
    if (this.stats.safety <= 0 || this.stats.durability <= 0) {
      this._endGame(false);
    }
  }

  _endGame(win) {
    this.running = false;
    const finalScore = Math.round(this.score);
    let rank = 'Novice Camper';
    if (finalScore > 550) rank = 'Storm Master';
    else if (finalScore > 400) rank = 'Seasoned Ranger';
    else if (finalScore > 250) rank = 'Trail Survivor';

    const message = win
      ? 'You weathered every condition the trip threw at you and kept camp intact.'
      : 'Exposure and damage overwhelmed the tent before the trip could finish.';

    this.ui.showEnd({ win, score: finalScore, rank, message });
  }

  /* ---------------- Rendering ---------------- */

  _skyColors() {
    switch (this.weather.current) {
      case 'sunny': return ['#7BB6D6', '#DDE9C8'];
      case 'cloudy': return ['#8494A0', '#B7C2C4'];
      case 'rain': return ['#4C5A63', '#6C7D82'];
      case 'wind': return ['#7C93A0', '#A8B9BE'];
      case 'storm': return ['#2A333A', '#4A5560'];
      default: return ['#7BB6D6', '#DDE9C8'];
    }
  }

  _renderStatic() {
    this.draw(performance.now());
  }

  draw(t) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    // sky gradient
    const [top, bottom] = this._skyColors();
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, top);
    grad.addColorStop(1, bottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // ground
    const groundY = h * 0.72;
    ctx.fillStyle = '#3F5236';
    ctx.fillRect(0, groundY, w, h - groundY);
    ctx.fillStyle = '#4E6842';
    ctx.fillRect(0, groundY, w, 10);

    // sun / cloud decoration
    if (this.weather.current === 'sunny' && this.assets.sun.complete) {
      ctx.drawImage(this.assets.sun, w - 130, 30, 90, 90);
    }
    if ((this.weather.current === 'cloudy' || this.weather.current === 'wind') && this.assets.cloud.complete) {
      ctx.globalAlpha = 0.9;
      ctx.drawImage(this.assets.cloud, w - 220, 40, 140, 90);
      ctx.drawImage(this.assets.cloud, 40, 20, 110, 70);
      ctx.globalAlpha = 1;
    }
    if ((this.weather.current === 'rain' || this.weather.current === 'storm') && this.assets.cloud.complete) {
      ctx.globalAlpha = 0.85;
      ctx.filter = 'brightness(0.6)';
      ctx.drawImage(this.assets.cloud, w * 0.5 - 100, 10, 200, 110);
      ctx.filter = 'none';
      ctx.globalAlpha = 1;
    }

    // trees
    if (this.assets.tree.complete) {
      ctx.drawImage(this.assets.tree, 30, groundY - 130, 70, 130);
      ctx.drawImage(this.assets.tree, w - 110, groundY - 150, 80, 150);
    }

    // tent, with a slight shake if durability is critical
    if (this.assets.tent.complete) {
      const tentW = 232, tentH = 174;
      let tx = w / 2 - tentW / 2;
      let ty = groundY - tentH + 20;
      if (this.stats.durability < 25 && this.running) {
        tx += (Math.random() - 0.5) * 4;
        ty += (Math.random() - 0.5) * 4;
      }
      ctx.drawImage(this.assets.tent, tx, ty, tentW, tentH);

      // waterproof shimmer overlay
      if (this.features.waterproof) {
        ctx.strokeStyle = 'rgba(120, 190, 230, 0.5)';
        ctx.lineWidth = 3;
        ctx.strokeRect(tx + 4, ty + 4, tentW - 8, tentH - 8);
      }
      // stakes indicator
      if (this.features.stakes) {
        ctx.fillStyle = '#C9BB98';
        ctx.fillRect(tx - 10, groundY - 6, 6, 14);
        ctx.fillRect(tx + tentW + 4, groundY - 6, 6, 14);
      }
      // fan indicator
      if (this.features.solarFan) {
        ctx.fillStyle = 'rgba(240, 180, 41, 0.85)';
        ctx.beginPath();
        ctx.arc(tx + tentW / 2, ty - 10, 6 + Math.sin(t / 120) * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // weather particles on top
    this.particles.draw();

    this._drawContours(t);
  }

  _drawContours(t) {
    const ctx = this.contourCtx;
    const w = this.contourCanvas.width;
    const h = this.contourCanvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(233, 223, 199, 0.05)';
    ctx.lineWidth = 1;
    const offset = (t / 8000) % 60;
    for (let i = -60; i < Math.max(w, h) * 1.6; i += 60) {
      ctx.beginPath();
      const r = i + offset;
      ctx.ellipse(w * 0.5, h * 0.5, r, r * 0.6, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.tentDefenderGame = new TentDefenderGame();
});
