/* ui.js
   Manages all DOM-facing updates: stat bars, weather gauge, day
   tracker, feature buttons, toast messages, and start/end overlays. */

class UI {
  constructor() {
    this.el = {
      weatherIcon: document.getElementById('weatherIcon'),
      weatherLabel: document.getElementById('weatherLabel'),
      weatherNext: document.getElementById('weatherNext'),
      dayNum: document.getElementById('dayNum'),
      dayTotal: document.getElementById('dayTotal'),
      dayDots: document.getElementById('dayDots'),
      toast: document.getElementById('toast'),
      scoreVal: document.getElementById('scoreVal'),
      introOverlay: document.getElementById('introOverlay'),
      introDays: document.getElementById('introDays'),
      endOverlay: document.getElementById('endOverlay'),
      endCard: document.getElementById('endCard'),
      endTitle: document.getElementById('endTitle'),
      finalScore: document.getElementById('finalScore'),
      rank: document.getElementById('rank'),
      endMessage: document.getElementById('endMessage'),
      startBtn: document.getElementById('startBtn'),
      restartBtn: document.getElementById('restartBtn'),
    };

    this.stats = {
      safety: { val: document.getElementById('safetyVal'), fill: document.getElementById('safetyFill') },
      comfort: { val: document.getElementById('comfortVal'), fill: document.getElementById('comfortFill') },
      battery: { val: document.getElementById('batteryVal'), fill: document.getElementById('batteryFill') },
      durability: { val: document.getElementById('durabilityVal'), fill: document.getElementById('durabilityFill') },
    };

    this.featureButtons = {
      waterproof: document.getElementById('btnWaterproof'),
      stakes: document.getElementById('btnStakes'),
      solarFan: document.getElementById('btnFan'),
    };

    this._toastTimeout = null;
  }

  bindFeatureToggle(callback) {
    Object.values(this.featureButtons).forEach(btn => {
      btn.addEventListener('click', () => callback(btn.dataset.feature));
    });
  }

  bindStart(callback) {
    this.el.startBtn.addEventListener('click', callback);
  }

  bindRestart(callback) {
    this.el.restartBtn.addEventListener('click', callback);
  }

  setDayTotal(total) {
    this.el.dayTotal.textContent = total;
    this.el.introDays.textContent = total;
    this.el.dayDots.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('span');
      this.el.dayDots.appendChild(dot);
    }
  }

  updateDay(day) {
    this.el.dayNum.textContent = day;
    const dots = this.el.dayDots.children;
    for (let i = 0; i < dots.length; i++) {
      dots[i].classList.remove('current', 'done');
      if (i < day - 1) dots[i].classList.add('done');
      else if (i === day - 1) dots[i].classList.add('current');
    }
  }

  updateStats(stats) {
    for (const key of Object.keys(stats)) {
      const ref = this.stats[key];
      if (!ref) continue;
      const clamped = Math.max(0, Math.min(100, stats[key]));
      ref.val.textContent = Math.round(clamped);
      ref.fill.style.width = clamped + '%';
      ref.fill.classList.toggle('warn', clamped <= 25);
    }
  }

  updateWeather(weatherInfo, nextInfo) {
    this.el.weatherIcon.src = weatherInfo.icon;
    this.el.weatherLabel.textContent = weatherInfo.label;
    this.el.weatherNext.textContent = nextInfo.label;
  }

  updateFeatureButton(feature, active) {
    const btn = this.featureButtons[feature];
    btn.classList.toggle('active', active);
    btn.querySelector('.btn-state').textContent = active ? 'On' : 'Off';
  }

  updateScore(score) {
    this.el.scoreVal.textContent = Math.round(score);
  }

  showToast(message) {
    const t = this.el.toast;
    t.textContent = message;
    t.classList.add('show');
    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => t.classList.remove('show'), 2400);
  }

  hideIntro() {
    this.el.introOverlay.classList.remove('show');
  }

  showEnd({ win, score, rank, message }) {
    this.el.endOverlay.classList.add('show');
    this.el.endCard.classList.toggle('win', win);
    this.el.endCard.classList.toggle('lose', !win);
    this.el.endTitle.textContent = win ? 'Camp Survived' : 'Tent Destroyed';
    this.el.finalScore.textContent = Math.round(score);
    this.el.rank.textContent = 'Rank: ' + rank;
    this.el.endMessage.textContent = message;
  }

  hideEnd() {
    this.el.endOverlay.classList.remove('show');
  }
}
