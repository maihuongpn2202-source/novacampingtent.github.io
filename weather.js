/* weather.js
   Defines the dynamic weather system: available conditions, their
   probabilities, durations, and the per-second effect they have on
   tent stats depending on which features are currently active. */

const WEATHER_TYPES = {
  sunny:  { key: 'sunny',  label: 'Sunny',       icon: 'assets/sun.svg',      weight: 3 },
  cloudy: { key: 'cloudy', label: 'Cloudy',       icon: 'assets/cloud.svg',    weight: 3 },
  rain:   { key: 'rain',   label: 'Heavy Rain',   icon: 'assets/rain.svg',     weight: 2 },
  wind:   { key: 'wind',   label: 'Strong Wind',  icon: 'assets/cloud.svg',    weight: 2 },
  storm:  { key: 'storm',  label: 'Thunderstorm', icon: 'assets/lightning.svg', weight: 1 }
};

class WeatherSystem {
  constructor() {
    this.current = 'sunny';
    this.next = this._rollNext('sunny');
    this.timer = 0;
    this.duration = this._rollDuration();
    this.onChange = null; // callback(current, previous)
  }

  _rollDuration() {
    // seconds a weather condition lasts
    return 8 + Math.random() * 7;
  }

  _rollNext(exclude) {
    const keys = Object.keys(WEATHER_TYPES).filter(k => k !== exclude);
    const totalWeight = keys.reduce((s, k) => s + WEATHER_TYPES[k].weight, 0);
    let r = Math.random() * totalWeight;
    for (const k of keys) {
      r -= WEATHER_TYPES[k].weight;
      if (r <= 0) return k;
    }
    return keys[0];
  }

  update(dt) {
    this.timer += dt;
    if (this.timer >= this.duration) {
      const previous = this.current;
      this.current = this.next;
      this.next = this._rollNext(this.current);
      this.timer = 0;
      this.duration = this._rollDuration();
      if (this.onChange) this.onChange(this.current, previous);
      return true; // changed
    }
    return false;
  }

  getInfo(key = this.current) {
    return WEATHER_TYPES[key];
  }

  /**
   * Returns per-second deltas for {safety, comfort, battery, durability}
   * given the current weather and which features are active.
   */
  getEffects(features) {
    const d = { safety: 0, comfort: 0, battery: 0, durability: 0 };
    const { waterproof, stakes, solarFan } = features;

    switch (this.current) {
      case 'sunny':
        d.comfort -= 1.2; // heat builds up without ventilation
        if (solarFan) {
          d.comfort += 3.0;
          d.battery += 2.5; // charges in direct sun
        }
        break;

      case 'cloudy':
        d.comfort -= 0.2;
        if (solarFan) {
          d.comfort += 1.6;
          d.battery += 0.4; // weak charge under clouds
        }
        break;

      case 'rain':
        if (!waterproof) {
          d.safety -= 4.5;
          d.durability -= 3.0;
          d.comfort -= 2.5;
        } else {
          d.comfort += 0.3;
        }
        if (solarFan) {
          // running the fan in rain risks water ingress through vents
          d.durability -= 1.0;
          d.battery -= 1.5;
        }
        break;

      case 'wind':
        if (!stakes) {
          d.safety -= 4.0;
          d.durability -= 3.5;
        }
        if (solarFan) d.battery -= 0.5;
        break;

      case 'storm':
        if (!waterproof) {
          d.safety -= 5.0;
          d.durability -= 3.5;
          d.comfort -= 2.0;
        }
        if (!stakes) {
          d.safety -= 5.0;
          d.durability -= 4.0;
        }
        if (waterproof && stakes) {
          d.comfort -= 0.5; // still a stressful night, minor comfort dip
        }
        if (solarFan) {
          d.durability -= 1.5;
          d.battery -= 2.0;
        }
        break;
    }

    // baseline battery drain for any active electronic feature
    if (solarFan && this.current !== 'sunny' && this.current !== 'cloudy') {
      d.battery -= 1.0;
    }

    return d;
  }
}
