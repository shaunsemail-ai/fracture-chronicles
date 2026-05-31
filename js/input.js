// Input system — keyboard + edge-of-screen touch controls
// Movement: touch left/right/top/bottom edges of screen (hold to move)
// Action buttons: small cluster in lower-center area
const Input = (() => {
  const state = {
    up: false, down: false, left: false, right: false,
    action: false, attack: false, dodge: false,
    menu: false, map: false,
    // one-shot flags (consumed after read)
    actionPress: false, attackPress: false, dodgePress: false,
    menuPress: false, mapPress: false, confirmPress: false, cancelPress: false,
  };

  // Keyboard
  const keyMap = {
    'ArrowUp': 'up', 'w': 'up', 'W': 'up',
    'ArrowDown': 'down', 's': 'down', 'S': 'down',
    'ArrowLeft': 'left', 'a': 'left', 'A': 'left',
    'ArrowRight': 'right', 'd': 'right', 'D': 'right',
    'z': 'action', 'Z': 'action', 'Enter': 'action',
    'x': 'attack', 'X': 'attack',
    'c': 'dodge', 'C': 'dodge', 'Shift': 'dodge',
    'Escape': 'menu', 'p': 'menu', 'P': 'menu',
    'm': 'map', 'M': 'map',
  };

  const pressMap = {
    'action': 'actionPress', 'attack': 'attackPress',
    'dodge': 'dodgePress', 'menu': 'menuPress', 'map': 'mapPress',
  };

  window.addEventListener('keydown', e => {
    const k = keyMap[e.key];
    if (k) {
      state[k] = true;
      if (pressMap[k]) state[pressMap[k]] = true;
    }
    if (e.key === 'Enter') state.confirmPress = true;
    if (e.key === 'Escape') state.cancelPress = true;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
  });

  window.addEventListener('keyup', e => {
    const k = keyMap[e.key];
    if (k) state[k] = false;
  });

  // ── Edge-zone touch layout ────────────────────────────────────
  // Left/right edges: EDGE_X wide on each side
  // Top edge: EDGE_Y_TOP tall
  // Bottom edge: EDGE_Y_BOT tall
  // Center area: action buttons cluster
  let W = 0, H = 0;
  let EDGE_X = 0;       // left/right zone width
  let EDGE_Y_TOP = 0;   // top zone height
  let EDGE_Y_BOT = 0;   // bottom zone height
  let btnPositions = {};  // action button hit areas

  function layoutControls(w, h) {
    W = w; H = h;
    EDGE_X    = Math.round(w * 0.18);
    EDGE_Y_TOP = Math.round(h * 0.18);
    EDGE_Y_BOT = Math.round(h * 0.22);

    // Action buttons sit just above the bottom edge, center-right of screen
    // Spaced within the safe center zone to avoid triggering edge directions
    const btnR   = Math.min(w, h) * 0.055;
    const btnGap = btnR * 2.4;
    const bCenterX = w * 0.72;
    const bCenterY = h - EDGE_Y_BOT - btnR * 1.2;

    btnPositions = {
      action: { x: bCenterX,            y: bCenterY,            r: btnR,        key: 'action'  },
      attack: { x: bCenterX - btnGap,   y: bCenterY - btnR * 0.6, r: btnR,      key: 'attack'  },
      dodge:  { x: bCenterX + btnGap * 0.5, y: bCenterY - btnR * 1.6, r: btnR * 0.78, key: 'dodge' },
      menu:   { x: w - btnR * 1.1,      y: btnR * 1.1,          r: btnR * 0.7,  key: 'menu'    },
    };
  }

  // Classify a screen point into a direction zone or null
  function getEdgeDir(tx, ty) {
    // Priority: corners go to horizontal (left/right) first
    if (tx < EDGE_X)       return 'left';
    if (tx > W - EDGE_X)   return 'right';
    if (ty < EDGE_Y_TOP)   return 'up';
    if (ty > H - EDGE_Y_BOT) return 'down';
    return null;
  }

  function touchInBtn(tx, ty) {
    for (const [name, btn] of Object.entries(btnPositions)) {
      const dx = tx - btn.x, dy = ty - btn.y;
      if (dx*dx + dy*dy <= btn.r * btn.r) return name;
    }
    return null;
  }

  // Per-touch tracking: touchId -> 'left'|'right'|'up'|'down'|<btnName>
  let activeTouches = {};

  function onTouchStart(e) {
    e.preventDefault();
    for (const t of e.changedTouches) {
      const tx = t.clientX, ty = t.clientY;
      const dir = getEdgeDir(tx, ty);
      if (dir) {
        activeTouches[t.identifier] = dir;
        state[dir] = true;
      } else {
        const btn = touchInBtn(tx, ty);
        if (btn) {
          activeTouches[t.identifier] = btn;
          state[btnPositions[btn].key] = true;
          const pressKey = btnPositions[btn].key + 'Press';
          if (pressKey in state) state[pressKey] = true;
          if (btn === 'action') state.confirmPress = true;
          if (btn === 'menu')   state.cancelPress  = true;
        } else {
          // Tap in safe center — treat as action tap for UI (dialogue advance, etc.)
          activeTouches[t.identifier] = 'center_tap';
        }
      }
    }
  }

  function onTouchMove(e) {
    e.preventDefault();
    for (const t of e.changedTouches) {
      const prev = activeTouches[t.identifier];
      const newDir = getEdgeDir(t.clientX, t.clientY);

      // If this touch started as a direction, update it
      if (prev === 'left' || prev === 'right' || prev === 'up' || prev === 'down') {
        if (newDir !== prev) {
          state[prev] = false;
          // Re-check all active touches to not clear a direction another finger holds
          _rebuildDirState();
          if (newDir) {
            activeTouches[t.identifier] = newDir;
            state[newDir] = true;
          } else {
            delete activeTouches[t.identifier];
          }
        }
      }
    }
  }

  function onTouchEnd(e) {
    e.preventDefault();
    for (const t of e.changedTouches) {
      const type = activeTouches[t.identifier];
      if (type === 'left' || type === 'right' || type === 'up' || type === 'down') {
        delete activeTouches[t.identifier];
        _rebuildDirState();
      } else if (type && btnPositions[type]) {
        state[btnPositions[type].key] = false;
        delete activeTouches[t.identifier];
      } else {
        delete activeTouches[t.identifier];
      }
    }
  }

  // Recompute direction state from all active touches (handles multi-finger)
  function _rebuildDirState() {
    state.up = false; state.down = false; state.left = false; state.right = false;
    for (const type of Object.values(activeTouches)) {
      if (type === 'left' || type === 'right' || type === 'up' || type === 'down') {
        state[type] = true;
      }
    }
  }

  document.addEventListener('touchstart',  onTouchStart,  { passive: false });
  document.addEventListener('touchmove',   onTouchMove,   { passive: false });
  document.addEventListener('touchend',    onTouchEnd,    { passive: false });
  document.addEventListener('touchcancel', onTouchEnd,    { passive: false });

  // Consume one-shot press
  function consume(key) {
    const v = state[key];
    state[key] = false;
    return v;
  }

  // ── Draw edge-zone indicators + action buttons ────────────────
  function drawControls(ctx) {
    if (!W || !H) return;
    ctx.save();

    // Edge zone tint bands — very subtle, darken slightly to show touch areas
    const edgeAlpha = 0.08;
    const edgeActiveAlpha = 0.22;

    // Helper: draw a rounded-rect fill
    function edgeRect(x, y, w, h, active) {
      ctx.globalAlpha = active ? edgeActiveAlpha : edgeAlpha;
      ctx.fillStyle = active ? '#8af' : '#334';
      ctx.fillRect(x, y, w, h);
    }

    edgeRect(0, 0, EDGE_X, H, state.left);
    edgeRect(W - EDGE_X, 0, EDGE_X, H, state.right);
    edgeRect(EDGE_X, 0, W - EDGE_X * 2, EDGE_Y_TOP, state.up);
    edgeRect(EDGE_X, H - EDGE_Y_BOT, W - EDGE_X * 2, EDGE_Y_BOT, state.down);

    // Arrow glyphs inside each edge zone
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = '#aac';
    ctx.font = `${Math.round(Math.min(W, H) * 0.05)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // left arrow
    ctx.globalAlpha = state.left ? 0.9 : 0.35;
    ctx.fillText('◀', EDGE_X / 2, H / 2);
    // right arrow
    ctx.globalAlpha = state.right ? 0.9 : 0.35;
    ctx.fillText('▶', W - EDGE_X / 2, H / 2);
    // up arrow
    ctx.globalAlpha = state.up ? 0.9 : 0.35;
    ctx.fillText('▲', W / 2, EDGE_Y_TOP / 2);
    // down arrow
    ctx.globalAlpha = state.down ? 0.9 : 0.35;
    ctx.fillText('▼', W / 2, H - EDGE_Y_BOT / 2);

    // Action buttons
    const colors = { action: '#2a5', attack: '#c35', dodge: '#48a', menu: '#445' };
    const labels = { action: 'A', attack: 'B', dodge: 'C', menu: 'M' };
    for (const [name, btn] of Object.entries(btnPositions)) {
      ctx.globalAlpha = state[btn.key] ? 0.85 : 0.38;
      ctx.beginPath();
      ctx.arc(btn.x, btn.y, btn.r, 0, Math.PI * 2);
      ctx.fillStyle = colors[name] || '#445';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = state[btn.key] ? 0.9 : 0.5;
      ctx.stroke();

      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#fff';
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
    get buttons() { return btnPositions; },
    drawControls,
  };
})();
