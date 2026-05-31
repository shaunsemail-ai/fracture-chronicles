// Input system — tap-to-move (mobile) + keyboard (desktop)
// Mobile: tap anywhere on the game world to walk there (blink indicator shown).
//         Tapping on an interactable (NPC, chest, campfire) triggers interact automatically.
//         Three small corner buttons: Attack (bottom-right), Dodge (above attack), Menu (top-right).
// Desktop: WASD / arrow keys for movement, Z=interact, X=attack, C=dodge, Esc=menu.
const Input = (() => {
  const state = {
    up: false, down: false, left: false, right: false,
    action: false, attack: false, dodge: false, menu: false,
    actionPress: false, attackPress: false, dodgePress: false,
    menuPress: false, confirmPress: false, cancelPress: false,
  };

  // ── Keyboard ──────────────────────────────────────────────────
  const keyMap = {
    'ArrowUp': 'up', 'w': 'up', 'W': 'up',
    'ArrowDown': 'down', 's': 'down', 'S': 'down',
    'ArrowLeft': 'left', 'a': 'left', 'A': 'left',
    'ArrowRight': 'right', 'd': 'right', 'D': 'right',
    'z': 'action', 'Z': 'action', 'Enter': 'action',
    'x': 'attack', 'X': 'attack',
    'c': 'dodge',  'C': 'dodge', 'Shift': 'dodge',
    'Escape': 'menu', 'p': 'menu', 'P': 'menu',
  };
  const pressMap = {
    action: 'actionPress', attack: 'attackPress',
    dodge:  'dodgePress',  menu:   'menuPress',
  };

  window.addEventListener('keydown', e => {
    const k = keyMap[e.key];
    if (k) { state[k] = true; if (pressMap[k]) state[pressMap[k]] = true; }
    if (e.key === 'Enter')  state.confirmPress = true;
    if (e.key === 'Escape') state.cancelPress  = true;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
  });
  window.addEventListener('keyup', e => {
    const k = keyMap[e.key];
    if (k) state[k] = false;
  });

  // ── Layout ────────────────────────────────────────────────────
  let W = 0, H = 0;
  let btnPositions = {};

  function layoutControls(w, h) {
    W = w; H = h;
    const r  = Math.round(Math.min(w, h) * 0.065); // attack button radius
    const rm = Math.round(Math.min(w, h) * 0.042); // dodge / menu radius
    const pad = Math.round(r * 1.35);

    btnPositions = {
      attack: { x: w - pad,        y: h - pad,        r,  key: 'attack' },
      dodge:  { x: w - pad,        y: h - pad - r * 2.5, r: rm, key: 'dodge'  },
      menu:   { x: w - rm - 6,     y: rm + 6,          r: rm, key: 'menu'   },
    };
  }

  function touchInBtn(tx, ty) {
    for (const [name, btn] of Object.entries(btnPositions)) {
      const dx = tx - btn.x, dy = ty - btn.y;
      if (dx * dx + dy * dy <= btn.r * btn.r) return name;
    }
    return null;
  }

  // Per-touch: touchId -> button name | 'world'
  let activeTouches = {};

  function onTouchStart(e) {
    e.preventDefault();
    for (const t of e.changedTouches) {
      const tx = t.clientX, ty = t.clientY;
      const btn = touchInBtn(tx, ty);
      if (btn) {
        activeTouches[t.identifier] = btn;
        state[btnPositions[btn].key] = true;
        const pk = btnPositions[btn].key + 'Press';
        if (pk in state) state[pk] = true;
        if (btn === 'menu') state.cancelPress = true;
      } else {
        activeTouches[t.identifier] = 'world';
        // World taps are handled by engine.js touchstart (tap-to-move / interact).
        // We expose the raw coordinates for engine to pick up.
        _lastWorldTap = { x: tx, y: ty, consumed: false };
      }
    }
  }

  function onTouchEnd(e) {
    e.preventDefault();
    for (const t of e.changedTouches) {
      const type = activeTouches[t.identifier];
      if (type && type !== 'world' && btnPositions[type]) {
        state[btnPositions[type].key] = false;
      }
      delete activeTouches[t.identifier];
    }
  }

  document.addEventListener('touchstart',  onTouchStart, { passive: false });
  document.addEventListener('touchmove',   e => e.preventDefault(), { passive: false });
  document.addEventListener('touchend',    onTouchEnd,   { passive: false });
  document.addEventListener('touchcancel', onTouchEnd,   { passive: false });

  // Consume one-shot press
  function consume(key) {
    const v = state[key];
    state[key] = false;
    return v;
  }

  // ── World tap queue (read by engine) ─────────────────────────
  let _lastWorldTap = null;

  function consumeWorldTap() {
    if (!_lastWorldTap || _lastWorldTap.consumed) return null;
    _lastWorldTap.consumed = true;
    return { x: _lastWorldTap.x, y: _lastWorldTap.y };
  }

  // ── Draw corner buttons ───────────────────────────────────────
  function drawControls(ctx) {
    if (!W || !H) return;
    ctx.save();

    const colors  = { attack: '#c03535', dodge: '#4080c0', menu: '#334455' };
    const labels  = { attack: 'B',       dodge: 'C',       menu: 'M'       };

    for (const [name, btn] of Object.entries(btnPositions)) {
      const active = state[btn.key];
      ctx.globalAlpha = active ? 0.88 : 0.42;

      ctx.beginPath();
      ctx.arc(btn.x, btn.y, btn.r, 0, Math.PI * 2);
      ctx.fillStyle = colors[name] || '#334';
      ctx.fill();

      ctx.globalAlpha = active ? 0.95 : 0.60;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.globalAlpha = 0.92;
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.round(btn.r * 0.72)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labels[name] || '?', btn.x, btn.y);
    }

    ctx.restore();
  }

  return {
    state,
    consume,
    layoutControls,
    consumeWorldTap,
    get buttons() { return btnPositions; },
    drawControls,
  };
})();
