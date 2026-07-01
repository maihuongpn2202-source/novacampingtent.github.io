/* particles.js
   Handles all weather-driven visual effects on the scene canvas:
   rain drops, wind streaks, and lightning flashes. */

class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.rain = [];
    this.wind = [];
    this.lightningAlpha = 0;
    this.lightningTimer = 0;
    this.rainIntensity = 0;   // 0 - 1
    this.windIntensity = 0;   // 0 - 1
    this.stormActive = false;
  }

  resize(w, h) {
    this.width = w;
    this.height = h;
  }

  setWeather(type) {
    switch (type) {
      case 'sunny':
        this.rainIntensity = 0;
        this.windIntensity = 0.05;
        this.stormActive = false;
        break;
      case 'cloudy':
        this.rainIntensity = 0;
        this.windIntensity = 0.15;
        this.stormActive = false;
        break;
      case 'rain':
        this.rainIntensity = 0.7;
        this.windIntensity = 0.2;
        this.stormActive = false;
        break;
      case 'wind':
        this.rainIntensity = 0;
        this.windIntensity = 0.9;
        this.stormActive = false;
        break;
      case 'storm':
        this.rainIntensity = 1;
        this.windIntensity = 0.75;
        this.stormActive = true;
        break;
    }
  }

  triggerLightning() {
    this.lightningAlpha = 0.85;
  }

  update(dt) {
    // spawn rain
    const targetRainCount = Math.floor(this.rainIntensity * 140);
    while (this.rain.length < targetRainCount) {
      this.rain.push(this._newRainDrop());
    }
    while (this.rain.length > targetRainCount) this.rain.pop();

    for (const d of this.rain) {
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      if (d.y > this.height || d.x > this.width + 20) {
        Object.assign(d, this._newRainDrop(true));
      }
    }

    // spawn wind streaks
    const targetWindCount = Math.floor(this.windIntensity * 26);
    while (this.wind.length < targetWindCount) this.wind.push(this._newWindStreak());
    while (this.wind.length > targetWindCount) this.wind.pop();

    for (const w of this.wind) {
      w.x += w.speed * dt;
      if (w.x > this.width + 60) Object.assign(w, this._newWindStreak(true));
    }

    // lightning decay
    if (this.lightningAlpha > 0) {
      this.lightningAlpha -= dt * 1.6;
      if (this.lightningAlpha < 0) this.lightningAlpha = 0;
    }

    // random autonomous lightning during storms
    if (this.stormActive) {
      this.lightningTimer -= dt;
      if (this.lightningTimer <= 0) {
        this.triggerLightning();
        this.lightningTimer = 2 + Math.random() * 4;
      }
    }
  }

  _newRainDrop(recycled) {
    return {
      x: recycled ? -10 : Math.random() * (this.width + 200) - 100,
      y: recycled ? -10 : Math.random() * this.height,
      vx: 220 + Math.random() * 80,
      vy: 520 + Math.random() * 140,
      len: 10 + Math.random() * 10
    };
  }

  _newWindStreak(recycled) {
    return {
      x: recycled ? -60 : Math.random() * this.width,
      y: 40 + Math.random() * (this.height * 0.55),
      speed: 260 + Math.random() * 160,
      len: 40 + Math.random() * 50,
      alpha: 0.12 + Math.random() * 0.18
    };
  }

  draw() {
    const ctx = this.ctx;

    // wind streaks
    if (this.windIntensity > 0.05) {
      ctx.strokeStyle = 'rgba(233, 223, 199, 0.35)';
      ctx.lineWidth = 1.5;
      for (const w of this.wind) {
        ctx.beginPath();
        ctx.globalAlpha = w.alpha;
        ctx.moveTo(w.x, w.y);
        ctx.lineTo(w.x - w.len, w.y - w.len * 0.15);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // rain
    if (this.rainIntensity > 0) {
      ctx.strokeStyle = 'rgba(150, 190, 220, 0.55)';
      ctx.lineWidth = 1.6;
      for (const d of this.rain) {
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.len * 0.25, d.y + d.len);
        ctx.stroke();
      }
    }

    // lightning flash overlay
    if (this.lightningAlpha > 0) {
      ctx.fillStyle = `rgba(240, 244, 255, ${this.lightningAlpha})`;
      ctx.fillRect(0, 0, this.width, this.height);
    }
  }
}
