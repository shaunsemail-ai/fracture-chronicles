// UI system — HUD, menus, dialogue, inventory, talent tree, memory prison
const UI = (() => {

  // ── Shared draw helpers ───────────────────────────────────────
  function roundRect(ctx, x, y, w, h, r = 8) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function panel(ctx, x, y, w, h, alpha = 0.92) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = PAL.uiBg;
    roundRect(ctx, x, y, w, h, 8);
    ctx.fill();
    ctx.strokeStyle = PAL.uiBorder;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  function bar(ctx, x, y, w, h, val, max, fillColor, bgColor) {
    ctx.fillStyle = bgColor;
    roundRect(ctx, x, y, w, h, 3);
    ctx.fill();
    if (val > 0) {
      ctx.fillStyle = fillColor;
      const fw = Math.max(0, (val / max) * w);
      ctx.save();
      ctx.beginPath();
      roundRect(ctx, x, y, fw, h, 3);
      ctx.clip();
      ctx.fillRect(x, y, fw, h);
      ctx.restore();
    }
  }

  function text(ctx, str, x, y, color = PAL.text, size = 14, align = 'left') {
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = `${size}px "Courier New", monospace`;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.fillText(str, x, y);
    ctx.restore();
  }

  function boldText(ctx, str, x, y, color = PAL.text, size = 14, align = 'left') {
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = `bold ${size}px "Courier New", monospace`;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.fillText(str, x, y);
    ctx.restore();
  }

  // ── HUD ───────────────────────────────────────────────────────
  function drawHUD(ctx, W, H, p, cs) {
    const pad = 12;
    const barW = Math.min(180, W * 0.35);
    const barH = 10;
    const x = pad, y = pad;
    const spacing = 16;

    panel(ctx, x - 6, y - 6, barW + 12, spacing * 3 + barH + 6, 0.8);

    // HP
    bar(ctx, x, y, barW, barH, p.hp, cs.maxHP, PAL.hpFill, PAL.hpBg);
    text(ctx, `HP ${p.hp}/${cs.maxHP}`, x + barW + 6, y + barH / 2, PAL.hpFill, 11);

    // MP
    bar(ctx, x, y + spacing, barW, barH, p.mp, cs.maxMP, PAL.mpFill, PAL.mpBg);
    text(ctx, `MP ${p.mp}/${cs.maxMP}`, x + barW + 6, y + spacing + barH / 2, PAL.mpFill, 11);

    // Stamina
    bar(ctx, x, y + spacing * 2, barW, barH, p.stamina, cs.maxStamina, PAL.staminaFill, PAL.staminaBg);
    text(ctx, `ST ${Math.floor(p.stamina)}/${cs.maxStamina}`, x + barW + 6, y + spacing * 2 + barH / 2, PAL.staminaFill, 11);

    // Level / XP
    const xpNeeded = Player.xpToNextLevel(p.level);
    const xpX = pad, xpY = y + spacing * 3 + barH - 2;
    bar(ctx, xpX, xpY, barW, 5, p.xp, xpNeeded, PAL.xpFill, PAL.xpBg);
    boldText(ctx, `Lv.${p.level}`, x + barW + 6, xpY + 2, PAL.xpFill, 11);

    // Combat message
    const msg = Combat.message;
    if (msg) {
      panel(ctx, W / 2 - 120, H - 80, 240, 28, 0.85);
      boldText(ctx, msg, W / 2, H - 65, PAL.textHi, 13, 'center');
    }

    // Status effects
    const statuses = p.statusEffects || [];
    statuses.forEach((s, i) => {
      const colors = { poison: PAL.textGreen, burn: PAL.textRed, slow: PAL.textBlue, venom: PAL.veilcaster };
      const sx = x + i * 44;
      const sy = y + spacing * 3 + barH + 10;
      panel(ctx, sx, sy, 40, 20, 0.8);
      text(ctx, s.type.slice(0, 4), sx + 4, sy + 10, colors[s.type] || PAL.text, 10);
    });

    // Pet indicator (bottom of HP panel)
    if (typeof Pets !== 'undefined') {
      Pets.drawHUDIndicator(ctx, x + barW + 30, y + spacing * 2.5);
      // Early warning pulse
      if (Pets.warningActive) {
        ctx.save();
        ctx.globalAlpha = 0.5 + 0.5 * Math.sin(Date.now() * 0.01);
        ctx.strokeStyle = '#d4ac0d';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + barW + 30, y + spacing * 2.5, 18, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Stat points reminder
    if (p.statPoints > 0 || p.talentPoints > 0) {
      const msg2 = `${p.statPoints > 0 ? p.statPoints + ' stat ' : ''}${p.talentPoints > 0 ? p.talentPoints + ' talent' : ''} point${(p.statPoints + p.talentPoints) > 1 ? 's' : ''} available`;
      panel(ctx, W / 2 - 130, 10, 260, 26, 0.9);
      boldText(ctx, msg2, W / 2, 24, PAL.xpFill, 12, 'center');
    }

    // Zone name (top right)
    const zone = World.current;
    if (zone) {
      panel(ctx, W - 180, 10, 170, 26, 0.75);
      text(ctx, zone.name, W - 175, 24, PAL.textDim, 11);
    }
  }

  // ── Dialogue box ─────────────────────────────────────────────
  function drawDialogue(ctx, W, H) {
    const node = Story.getCurrentNode();
    if (!node) return;

    const boxH = H * 0.3;
    const boxY = H - boxH - 10;
    const boxX = 10;
    const boxW = W - 20;

    panel(ctx, boxX, boxY, boxW, boxH, 0.95);

    const char = Story.CHARACTERS[node.speaker] || Story.CHARACTERS.narrator;

    // Speaker name
    if (char.name) {
      boldText(ctx, char.name, boxX + 16, boxY + 20, char.color, 14);
      ctx.fillStyle = PAL.uiBorderHi;
      ctx.fillRect(boxX + 16, boxY + 30, char.name.length * 9, 1);
    }

    // Dialogue text with word wrap
    const textX = boxX + 16;
    const textY = boxY + (char.name ? 48 : 24);
    const maxWidth = boxW - 32;
    const lineHeight = 20;
    const words = node.text.split(' ');
    let line = '', ly = textY;
    ctx.save();
    ctx.fillStyle = PAL.text;
    ctx.font = '13px "Courier New", monospace';
    ctx.textBaseline = 'top';
    for (const word of words) {
      const testLine = line + word + ' ';
      if (ctx.measureText(testLine).width > maxWidth && line.length > 0) {
        ctx.fillText(line.trim(), textX, ly);
        line = word + ' ';
        ly += lineHeight;
        if (ly > boxY + boxH - 40) { ctx.fillText('...', textX, ly); break; }
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), textX, ly);
    ctx.restore();

    // Choices
    if (node.choices) {
      const choiceY = boxY + boxH - (node.choices.length * 26) - 8;
      node.choices.forEach((c, i) => {
        const cy = choiceY + i * 26;
        const isSelected = UI.dialogueChoice === i;
        if (isSelected) {
          ctx.fillStyle = 'rgba(100,100,200,0.3)';
          roundRect(ctx, boxX + 12, cy - 2, boxW - 24, 22, 4);
          ctx.fill();
        }
        text(ctx, `${i + 1}. ${c.label}`, boxX + 20, cy + 9,
          isSelected ? PAL.textHi : PAL.textDim, 12);
      });
      // Hint
      text(ctx, 'Tap to choose', boxX + boxW - 90, boxY + boxH - 12, PAL.textDim, 10);
    } else {
      // Continue hint
      const t = Date.now() * 0.002;
      ctx.fillStyle = PAL.textDim;
      ctx.font = '11px "Courier New", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t);
      ctx.fillText('[ Tap to continue ]', boxX + boxW - 12, boxY + boxH - 12);
      ctx.globalAlpha = 1;
    }
  }

  // ── Main menu ─────────────────────────────────────────────────
  let mainMenuSel = 0;
  function drawMainMenu(ctx, W, H, slots) {
    // Background art (simple atmospheric)
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, W, H);

    // Stars
    const starRng = seededRand(42);
    for (let i = 0; i < 80; i++) {
      const sx = starRng() * W, sy = starRng() * H * 0.6;
      const alpha = 0.3 + starRng() * 0.5;
      ctx.fillStyle = `rgba(212,200,154,${alpha})`;
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }

    // Title
    ctx.save();
    ctx.shadowColor = '#6a4aad';
    ctx.shadowBlur = 20;
    boldText(ctx, 'FRACTURE', W / 2, H * 0.18, '#d4c89a', Math.min(40, W * 0.08), 'center');
    boldText(ctx, 'CHRONICLES', W / 2, H * 0.18 + Math.min(44, W * 0.09), '#6a4aad', Math.min(22, W * 0.045), 'center');
    ctx.shadowBlur = 0;
    ctx.restore();

    text(ctx, 'Something happened. No one knows what.', W / 2, H * 0.35, PAL.textDim, 12, 'center');
    text(ctx, 'Figure it out.', W / 2, H * 0.35 + 18, PAL.textDim, 11, 'center');

    // Slot buttons
    const bW = Math.min(260, W * 0.7);
    const bH = 54;
    const bX = (W - bW) / 2;
    const items = [];

    slots.forEach((s, i) => {
      if (s) {
        items.push({ label: `Slot ${i+1}: ${s.profile} — Lv.${s.level} ${s.zone}`, sub: null, action: 'load', slot: i });
      } else {
        items.push({ label: `Slot ${i+1}: New Game`, sub: null, action: 'new', slot: i });
      }
    });
    items.push({ label: 'Player Stats', action: 'stats' });
    items.push({ label: 'Settings', action: 'settings' });

    const startY = H * 0.5;
    items.forEach((item, i) => {
      const iy = startY + i * (bH + 8);
      const selected = mainMenuSel === i;
      panel(ctx, bX, iy, bW, bH, selected ? 0.95 : 0.7);
      if (selected) {
        ctx.strokeStyle = PAL.uiBorderHi;
        ctx.lineWidth = 2;
        roundRect(ctx, bX, iy, bW, bH, 8);
        ctx.stroke();
      }
      boldText(ctx, item.label, bX + bW / 2, iy + bH / 2, selected ? PAL.textHi : PAL.text, 13, 'center');
    });

    return items;
  }

  // ── Character creation ────────────────────────────────────────
  let charCreateStep = 0; // 0=name, 1=class
  let charCreateName = '';
  let charCreateClass = 0;
  const classOpts = ['ironclad', 'ashwalker', 'veilcaster'];
  const classDescs = {
    ironclad:   'Melee warrior. High HP, strong defense. Hits hard up close.',
    ashwalker:  'Ranged scout. Fast and nimble. Keeps enemies at a distance.',
    veilcaster: 'Magic specialist. Fragile but powerful. Controls the battlefield.',
  };

  function drawCharCreate(ctx, W, H) {
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, W, H);

    boldText(ctx, 'CHOOSE YOUR PATH', W / 2, H * 0.1, PAL.textHi, 18, 'center');
    text(ctx, 'Your choices shape your talents. Nothing is permanent — you can invest across paths.', W / 2, H * 0.1 + 26, PAL.textDim, 11, 'center');

    const bW = Math.min(220, W * 0.6);
    const bH = 80;
    const bX = (W - bW) / 2;
    const startY = H * 0.22;

    classOpts.forEach((cls, i) => {
      const iy = startY + i * (bH + 12);
      const selected = charCreateClass === i;
      const clrMap = { ironclad: PAL.ironclad, ashwalker: PAL.ashwalker, veilcaster: PAL.veilcaster };

      panel(ctx, bX, iy, bW, bH, selected ? 0.95 : 0.7);
      if (selected) {
        ctx.strokeStyle = clrMap[cls];
        ctx.lineWidth = 2;
        roundRect(ctx, bX, iy, bW, bH, 8);
        ctx.stroke();
      }

      boldText(ctx, cls.toUpperCase(), bX + bW / 2, iy + 20, clrMap[cls], 16, 'center');
      text(ctx, classDescs[cls], bX + bW / 2, iy + 45, selected ? PAL.text : PAL.textDim, 10, 'center');
    });

    // Confirm button
    const cy = startY + classOpts.length * (bH + 12) + 16;
    panel(ctx, bX, cy, bW, 40, 0.9);
    boldText(ctx, 'BEGIN', bX + bW / 2, cy + 20, PAL.xpFill, 15, 'center');
  }

  // ── Pause menu ────────────────────────────────────────────────
  const PAUSE_OPTIONS = ['Resume', 'Journal', 'Inventory', 'Talents', 'Save', 'Main Menu'];
  let pauseSel = 0;

  function drawPauseMenu(ctx, W, H) {
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(0, 0, W, H);

    const bW = Math.min(200, W * 0.5);
    const bH = 40;
    const bX = (W - bW) / 2;
    const startY = H * 0.3;

    boldText(ctx, 'PAUSED', W / 2, startY - 30, PAL.textDim, 16, 'center');

    PAUSE_OPTIONS.forEach((opt, i) => {
      const iy = startY + i * (bH + 6);
      const sel = pauseSel === i;
      panel(ctx, bX, iy, bW, bH, sel ? 0.95 : 0.75);
      if (sel) {
        ctx.strokeStyle = PAL.uiBorderHi;
        ctx.lineWidth = 1.5;
        roundRect(ctx, bX, iy, bW, bH, 8);
        ctx.stroke();
      }
      boldText(ctx, opt, bX + bW / 2, iy + bH / 2, sel ? PAL.textHi : PAL.text, 13, 'center');
    });
  }

  // ── Inventory screen ──────────────────────────────────────────
  let invSel = 0;
  let invTab = 'all'; // 'all','weapon','armor','consumable','quest'

  function drawInventory(ctx, W, H, p) {
    ctx.fillStyle = 'rgba(0,0,0,0.88)';
    ctx.fillRect(0, 0, W, H);
    panel(ctx, 10, 10, W - 20, H - 20, 0.95);

    boldText(ctx, 'INVENTORY', W / 2, 30, PAL.textHi, 16, 'center');

    // Equipped
    boldText(ctx, 'Equipped:', 24, 56, PAL.textDim, 11);
    const eq = p.equipped;
    const equipped = [
      { slot: 'Weapon', id: eq.weapon }, { slot: 'Armor', id: eq.armor },
      { slot: 'Accss.', id: eq.accessory }
    ];
    equipped.forEach((e, i) => {
      const item = e.id ? ITEMS[e.id] : null;
      text(ctx, `${e.slot}: ${item ? item.name : '—'}`, 24 + i * (W / 3 - 8), 72,
        item ? PAL.textHi : PAL.textDim, 11);
    });

    ctx.fillStyle = PAL.uiBorder;
    ctx.fillRect(20, 84, W - 40, 1);

    // Item list
    const visStart = Math.max(0, invSel - 4);
    const items = p.inventory;
    const listX = 20, listY = 94, itemH = 32, listW = W - 40;
    const visible = Math.floor((H - 200) / itemH);

    items.slice(visStart, visStart + visible).forEach((slot, i) => {
      const item = ITEMS[slot.id];
      if (!item) return;
      const iy = listY + i * itemH;
      const selected = (i + visStart) === invSel;
      if (selected) {
        ctx.fillStyle = 'rgba(60,60,160,0.35)';
        roundRect(ctx, listX, iy - 2, listW, itemH - 2, 4);
        ctx.fill();
      }
      boldText(ctx, item.name, listX + 8, iy + itemH / 2 - 4, selected ? PAL.textHi : PAL.text, 12);
      if (slot.qty > 1) text(ctx, `x${slot.qty}`, listX + listW - 40, iy + itemH / 2 - 4, PAL.textDim, 11, 'right');
      text(ctx, item.type, listX + listW - (slot.qty > 1 ? 60 : 10), iy + itemH / 2 - 4, PAL.textDim, 10, 'right');
    });

    // Selected item detail
    const selSlot = items[invSel];
    const selItem = selSlot ? ITEMS[selSlot.id] : null;
    if (selItem) {
      const detY = H - 110;
      ctx.fillStyle = PAL.uiBorder;
      ctx.fillRect(20, detY - 4, W - 40, 1);
      boldText(ctx, selItem.name, 24, detY + 8, PAL.textHi, 13);
      text(ctx, selItem.desc, 24, detY + 26, PAL.text, 11);
      if (selItem.lore) text(ctx, `"${selItem.lore}"`, 24, detY + 44, PAL.textDim, 10);
      if (selItem.type === 'consumable') text(ctx, '[A] Use', W - 60, detY + 8, PAL.textGreen, 11);
      if (selItem.type === 'weapon' || selItem.type === 'armor' || selItem.type === 'accessory')
        text(ctx, '[A] Equip', W - 64, detY + 8, PAL.textBlue, 11);
    }

    text(ctx, '[B] Close', W - 60, H - 25, PAL.textDim, 11);
  }

  // ── Talent tree screen ────────────────────────────────────────
  let talentTab = 'ironclad';
  let talentSel = 0;

  function drawTalentTree(ctx, W, H, p) {
    ctx.fillStyle = 'rgba(0,0,0,0.9)';
    ctx.fillRect(0, 0, W, H);
    panel(ctx, 10, 10, W - 20, H - 20, 0.95);

    const trees = Player.TALENT_TREES;
    const tabW = (W - 20) / 3;

    // Tabs
    Object.keys(trees).forEach((key, i) => {
      const tx = 10 + i * tabW;
      const selected = talentTab === key;
      ctx.fillStyle = selected ? trees[key].color + '44' : 'transparent';
      ctx.fillRect(tx, 10, tabW, 34);
      boldText(ctx, trees[key].name.toUpperCase(), tx + tabW / 2, 28, selected ? trees[key].color : PAL.textDim, 12, 'center');
    });

    ctx.fillStyle = PAL.uiBorder;
    ctx.fillRect(20, 44, W - 40, 1);

    boldText(ctx, `Talent Points: ${p.talentPoints}`, W / 2, 56, PAL.xpFill, 12, 'center');

    const tree = trees[talentTab];
    if (!tree) return;

    // Talent nodes
    const allNodes = tree.tiers.flat();
    const tileW = Math.floor((W - 40) / 3);
    const tileH = 60;
    const startY = 72;

    tree.tiers.forEach((tier, ti) => {
      // Tier label
      text(ctx, `TIER ${ti + 1}`, 20, startY + ti * (tileH + 8) + 10, PAL.textDim, 10);
      tier.forEach((talent, ni) => {
        const globalIdx = tree.tiers.slice(0, ti).flat().length + ni;
        const tx = 20 + ni * tileW;
        const ty = startY + ti * (tileH + 8);
        const rank = p.talents[talent.id] || 0;
        const maxed = rank >= talent.max;
        const hasReqs = Object.entries(talent.req || {}).every(([k, v]) => (p.talents[k] || 0) >= v);
        const hasGate = !talent.educationGate || p.flags['edu_gate_' + talent.id];
        const available = hasReqs && hasGate && p.talentPoints > 0 && !maxed;
        const selected = talentSel === globalIdx;

        panel(ctx, tx + 2, ty, tileW - 4, tileH, selected ? 0.95 : 0.8);
        if (selected) {
          ctx.strokeStyle = tree.color;
          ctx.lineWidth = 2;
          roundRect(ctx, tx + 2, ty, tileW - 4, tileH, 8);
          ctx.stroke();
        }

        boldText(ctx, talent.name, tx + (tileW / 2), ty + 14, maxed ? tree.color : (available ? PAL.textHi : PAL.textDim), 11, 'center');

        // Rank pips
        for (let r = 0; r < talent.max; r++) {
          ctx.fillStyle = r < rank ? tree.color : PAL.uiBorder;
          ctx.beginPath();
          ctx.arc(tx + (tileW / 2) - (talent.max - 1) * 6 + r * 12, ty + 30, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        if (talent.educationGate && !hasGate) {
          text(ctx, '[Study required]', tx + (tileW / 2), ty + 46, PAL.textRed, 9, 'center');
        } else {
          text(ctx, talent.desc.slice(0, 28) + (talent.desc.length > 28 ? '...' : ''), tx + (tileW / 2), ty + 46, PAL.textDim, 9, 'center');
        }
      });
    });

    boldText(ctx, `[A] Invest  [B] Close  [← →] Tree  [↑ ↓] Select`, W / 2, H - 16, PAL.textDim, 10, 'center');
  }

  // ── Quest journal ─────────────────────────────────────────────
  let journalSel = 0;
  function drawJournal(ctx, W, H) {
    ctx.fillStyle = 'rgba(0,0,0,0.88)';
    ctx.fillRect(0, 0, W, H);
    panel(ctx, 10, 10, W - 20, H - 20, 0.95);
    boldText(ctx, 'QUEST JOURNAL', W / 2, 30, PAL.textHi, 16, 'center');

    const entries = Quests.getJournalEntries();
    const listH = 34;
    const startY = 50;
    const maxVisible = Math.floor((H - 160) / listH);
    const visStart = Math.max(0, journalSel - Math.floor(maxVisible / 2));

    entries.slice(visStart, visStart + maxVisible).forEach((q, i) => {
      const idx = i + visStart;
      const iy = startY + i * listH;
      const sel = journalSel === idx;
      if (sel) {
        ctx.fillStyle = 'rgba(60,60,120,0.4)';
        roundRect(ctx, 16, iy, W - 32, listH - 2, 4);
        ctx.fill();
      }
      const catColors = { main: PAL.textGold, side: PAL.textBlue, education: PAL.textGreen };
      text(ctx, q.category.toUpperCase(), 22, iy + 10, catColors[q.category] || PAL.textDim, 9);
      boldText(ctx, q.name, 70, iy + 10, sel ? PAL.textHi : PAL.text, 12);
      const statusColors = { Active: PAL.textGreen, Complete: PAL.textGold, Failed: PAL.textRed };
      text(ctx, q.statusLabel, W - 30, iy + 10, statusColors[q.statusLabel] || PAL.textDim, 10, 'right');
    });

    // Detail panel for selected
    const selEntry = entries[journalSel];
    if (selEntry) {
      const detY = H - 120;
      ctx.fillStyle = PAL.uiBorder;
      ctx.fillRect(16, detY - 4, W - 32, 1);
      text(ctx, selEntry.desc, 20, detY + 10, PAL.text, 11);
      selEntry.stages.forEach((s, i) => {
        const checkColor = s.done ? PAL.textGreen : PAL.textDim;
        text(ctx, `${s.done ? '✓' : '○'} ${s.desc}`, 24, detY + 28 + i * 18, checkColor, 10);
      });
    }

    text(ctx, '[B] Close', W - 60, H - 14, PAL.textDim, 11);
  }

  // ── Memory Prison quiz ────────────────────────────────────────
  let quizState = null; // { quiz, currentQ, selected, answers, timeLeft, done, passed }

  function startMemoryPrison(characterId, attemptNum) {
    const quiz = Story.getMemoryPrisonQuiz(characterId, attemptNum);
    if (!quiz) return false;
    quizState = {
      quiz, currentQ: 0,
      selected: -1,
      answers: [],
      timeLeft: quiz.timeLimit,
      done: false, passed: false,
      flash: 0, flashColor: '',
    };
    return true;
  }

  // Start a Knowledge Trial using a pre-built quiz object (from Curriculum)
  function startKnowledgeTrial(quiz) {
    if (!quiz) return false;
    quizState = {
      quiz, currentQ: 0,
      selected: -1,
      answers: [],
      timeLeft: quiz.timeLimit || 60,
      done: false, passed: false,
      flash: 0, flashColor: '',
    };
    return true;
  }

  function drawMemoryPrison(ctx, W, H) {
    if (!quizState) return;
    const q = quizState.quiz;

    // Eerie background
    ctx.fillStyle = '#030308';
    ctx.fillRect(0, 0, W, H);

    // Vignette
    const grad = ctx.createRadialGradient(W / 2, H / 2, H * 0.1, W / 2, H / 2, H * 0.7);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(1, 'rgba(80,0,120,0.4)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Flash effect on wrong answer
    if (quizState.flash > 0) {
      ctx.fillStyle = `rgba(${quizState.flashColor},${quizState.flash * 0.5})`;
      ctx.fillRect(0, 0, W, H);
      quizState.flash = Math.max(0, quizState.flash - 0.05);
    }

    boldText(ctx, 'MEMORY PRISON', W / 2, 30, '#6a4aad', 16, 'center');
    text(ctx, q.flavor, W / 2, 52, PAL.textDim, 11, 'center');

    // Timer
    const timeColor = quizState.timeLeft < 20 ? PAL.textRed : quizState.timeLeft < 40 ? PAL.xpFill : PAL.textGreen;
    boldText(ctx, `${Math.ceil(quizState.timeLeft)}s`, W - 40, 30, timeColor, 16, 'center');

    // Progress
    text(ctx, `${quizState.currentQ + 1} / ${q.questions.length}`, W / 2, 68, PAL.textDim, 11, 'center');

    if (quizState.done) {
      const resultColor = quizState.passed ? PAL.textGreen : PAL.textRed;
      const resultText = quizState.passed
        ? `${q.characterName} remembers. They return.`
        : `The memory fades further. Try again.`;
      boldText(ctx, quizState.passed ? 'RECOVERED' : 'FAILED', W / 2, H * 0.4, resultColor, 22, 'center');
      text(ctx, resultText, W / 2, H * 0.4 + 32, PAL.text, 12, 'center');
      text(ctx, quizState.passed ? '' : `Next attempt: ${q.questions.length + 2} questions`, W / 2, H * 0.4 + 52, PAL.textDim, 11, 'center');
      text(ctx, '[Tap to continue]', W / 2, H * 0.7, PAL.textDim, 12, 'center');
      return;
    }

    const cq = q.questions[quizState.currentQ];
    if (!cq) return;

    // Question
    panel(ctx, 16, 88, W - 32, 60, 0.9);
    const qWords = cq.q.split(' ');
    let qLine = '', qY = 108;
    ctx.save();
    ctx.fillStyle = PAL.textHi;
    ctx.font = '13px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    for (const word of qWords) {
      const test = qLine + word + ' ';
      if (ctx.measureText(test).width > W - 56 && qLine) {
        ctx.fillText(qLine.trim(), 26, qY);
        qLine = word + ' '; qY += 18;
      } else qLine = test;
    }
    ctx.fillText(qLine.trim(), 26, qY);
    ctx.restore();

    // Choices
    const choiceStartY = 164;
    cq.choices.forEach((choice, ci) => {
      const cy = choiceStartY + ci * 50;
      const sel = quizState.selected === ci;
      panel(ctx, 16, cy, W - 32, 42, sel ? 0.95 : 0.8);
      if (sel) {
        ctx.strokeStyle = '#6a4aad';
        ctx.lineWidth = 2;
        roundRect(ctx, 16, cy, W - 32, 42, 8);
        ctx.stroke();
      }
      text(ctx, `${ci + 1}. ${choice}`, 28, cy + 21, sel ? PAL.textHi : PAL.text, 13);
    });
  }

  function tickMemoryPrison(dt) {
    if (!quizState || quizState.done) return;
    quizState.timeLeft -= dt;
    if (quizState.timeLeft <= 0) {
      quizState.done = true;
      quizState.passed = false;
    }
  }

  function selectMemoryAnswer(choiceIdx) {
    if (!quizState || quizState.done) return null;
    quizState.selected = choiceIdx;
  }

  function confirmMemoryAnswer() {
    if (!quizState || quizState.done || quizState.selected < 0) return null;
    const cq = quizState.quiz.questions[quizState.currentQ];
    const correct = quizState.selected === cq.answer;
    quizState.answers.push({ correct, selected: quizState.selected });
    quizState.flash = 1;
    quizState.flashColor = correct ? '0,180,0' : '180,0,0';
    quizState.selected = -1;
    quizState.currentQ++;
    if (quizState.currentQ >= quizState.quiz.questions.length) {
      const correctCount = quizState.answers.filter(a => a.correct).length;
      const pass = correctCount >= Math.ceil(quizState.quiz.questions.length * 0.7);
      quizState.done = true;
      quizState.passed = pass;
      return { done: true, passed: pass };
    }
    return { done: false };
  }

  // ── Rarity color helper ───────────────────────────────────────
  function rarityColor(rarity) {
    if (typeof DROP_RARITY !== 'undefined') {
      switch (rarity) {
        case DROP_RARITY.UNCOMMON: return PAL.textGreen;
        case DROP_RARITY.RARE:     return PAL.textBlue;
        case DROP_RARITY.UNIQUE:   return PAL.textGold;
        default:                   return PAL.text;
      }
    }
    return PAL.text;
  }

  // ── Screen flash ──────────────────────────────────────────────
  let screenFlash = 0;
  let screenFlashColor = '0,0,0';

  function flashScreen(r, g, b, alpha = 0.5) {
    screenFlash = alpha;
    screenFlashColor = `${r},${g},${b}`;
  }

  function drawScreenFlash(ctx, W, H) {
    if (screenFlash <= 0) return;
    ctx.fillStyle = `rgba(${screenFlashColor},${screenFlash})`;
    ctx.fillRect(0, 0, W, H);
    screenFlash = Math.max(0, screenFlash - 0.04);
  }

  // ── Level up overlay ──────────────────────────────────────────
  let levelUpTimer = 0;
  let levelUpLevel = 0;

  function showLevelUp(level) {
    levelUpTimer = 3;
    levelUpLevel = level;
    flashScreen(200, 180, 50, 0.4);
  }

  function drawLevelUp(ctx, W, H) {
    if (levelUpTimer <= 0) return;
    levelUpTimer -= 0.016;
    const alpha = Math.min(1, levelUpTimer);
    ctx.save();
    ctx.globalAlpha = alpha;
    boldText(ctx, `LEVEL UP — ${levelUpLevel}`, W / 2, H * 0.25, PAL.xpFill, 22, 'center');
    text(ctx, '+3 Stat Points  +1 Talent Point', W / 2, H * 0.25 + 30, PAL.text, 13, 'center');
    ctx.restore();
  }

  // ── Knowledge Trial button (small pulsing "?" in top-right) ──
  function drawKnowledgeTrialButton(ctx, W, H, available) {
    const r = 18;
    const cx = W - r - 10;
    const cy = r + 10;
    const t = Date.now() / 1000;
    ctx.save();
    if (available) {
      // Pulsing glow
      const pulse = 0.6 + 0.4 * Math.sin(t * 3);
      ctx.shadowColor = '#f0c040';
      ctx.shadowBlur = 12 * pulse;
      ctx.globalAlpha = pulse;
    } else {
      ctx.globalAlpha = 0.25;
    }
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = available ? '#2a2010' : '#181818';
    ctx.fill();
    ctx.strokeStyle = available ? '#f0c040' : '#555';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = available ? '#f0c040' : '#666';
    ctx.font = `bold ${r}px "Courier New", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', cx, cy + 1);
    ctx.restore();
  }

  // ── Knowledge Trial confirmation overlay ──────────────────────
  // eventType: 'death' | 'pet_hurt' | 'boss_fail'
  // detail: extra string (pet name, boss name, etc.)
  function drawKnowledgeTrialPrompt(ctx, W, H, eventType, detail) {
    ctx.save();
    // Dark semi-transparent backdrop
    ctx.fillStyle = 'rgba(0,0,0,0.78)';
    ctx.fillRect(0, 0, W, H);

    const bw = Math.min(W - 40, 360);
    const bh = 210;
    const bx = (W - bw) / 2;
    const by = (H - bh) / 2;
    panel(ctx, bx, by, bw, bh, '#1a1408', '#c8a030', 2, 10);

    const cx = W / 2;
    boldText(ctx, 'KNOWLEDGE TRIAL', cx, by + 28, '#f0c040', 16, 'center');

    let desc = '';
    if (eventType === 'death') {
      desc = 'You fell in battle.';
    } else if (eventType === 'pet_hurt') {
      desc = detail ? `${detail} was hurt and fled to camp.` : 'Your companion was hurt.';
    } else if (eventType === 'boss_fail') {
      desc = detail ? `${detail} repelled your attack.` : 'The trial failed.';
    }
    text(ctx, desc, cx, by + 58, PAL.text, 12, 'center');
    text(ctx, 'Answer 4 of 5 questions correctly', cx, by + 78, PAL.textDim, 11, 'center');
    text(ctx, 'to undo this moment.', cx, by + 94, PAL.textDim, 11, 'center');

    // Confirm button
    const btnW = 140, btnH = 34;
    const btnX = cx - btnW - 10;
    const btnY = by + bh - 54;
    panel(ctx, btnX, btnY, btnW, btnH, '#1a2e10', '#50c040', 1, 6);
    boldText(ctx, '[A] Begin Trial', btnX + btnW / 2, btnY + btnH / 2, '#80ff60', 12, 'center');

    // Cancel button
    const canX = cx + 10;
    panel(ctx, canX, btnY, btnW, btnH, '#2e1010', '#c04040', 1, 6);
    boldText(ctx, '[B] Accept Fate', canX + btnW / 2, btnY + btnH / 2, '#ff8060', 12, 'center');

    ctx.restore();
  }

  // ── Player name picker (char create step 0) ──────────────────
  let playerNameSel = 0;

  function drawPlayerPicker(ctx, W, H) {
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, W, H);
    boldText(ctx, 'WHO IS PLAYING?', W / 2, H * 0.15, PAL.textHi, 20, 'center');
    text(ctx, 'Each player has their own save and progress tracking.', W / 2, H * 0.15 + 28, PAL.textDim, 11, 'center');

    const names = typeof PLAYER_NAMES !== 'undefined' ? PLAYER_NAMES : ['Player 1', 'Player 2'];
    const bW = Math.min(220, W * 0.6);
    const bH = 56;
    const bX = (W - bW) / 2;
    const startY = H * 0.32;

    names.forEach((name, i) => {
      const iy = startY + i * (bH + 12);
      const sel = playerNameSel === i;
      const cfg = typeof PLAYER_CONFIGS !== 'undefined' ? PLAYER_CONFIGS[name] : null;
      panel(ctx, bX, iy, bW, bH, sel ? 0.95 : 0.75);
      if (sel) {
        ctx.strokeStyle = PAL.xpFill;
        ctx.lineWidth = 2;
        roundRect(ctx, bX, iy, bW, bH, 8);
        ctx.stroke();
      }
      boldText(ctx, name, bX + bW / 2, iy + 18, sel ? PAL.textHi : PAL.text, 16, 'center');
      if (cfg?.subjects?.length) {
        text(ctx, cfg.subjects.join(' + '), bX + bW / 2, iy + 36, sel ? PAL.textGold : PAL.textDim, 10, 'center');
      } else {
        text(ctx, 'Subjects TBD', bX + bW / 2, iy + 36, PAL.textDim, 10, 'center');
      }
    });

    text(ctx, '[A] Select   [B] Back', W / 2, H * 0.85, PAL.textDim, 11, 'center');
  }

  // ── Stats screen ──────────────────────────────────────────────
  let statsProfile = null;
  let statsScroll = 0;
  let statsExpandedTopic = null;
  let statsTab = 'overview'; // 'overview' | 'wrong' | 'topics'

  function drawStatsScreen(ctx, W, H) {
    if (!statsProfile) return;
    const stats = typeof Analytics !== 'undefined' ? Analytics.getProfileStats(statsProfile) : null;

    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, W, H);
    panel(ctx, 8, 8, W - 16, H - 16, 0.97);

    // Header
    boldText(ctx, `${statsProfile.toUpperCase()} — PROGRESS`, W / 2, 30, PAL.textHi, 16, 'center');

    if (!stats) {
      text(ctx, 'No quiz data yet. Play the game and answer some questions!', W / 2, H / 2, PAL.textDim, 12, 'center');
      text(ctx, '[B] Back', W - 50, H - 20, PAL.textDim, 11);
      return;
    }

    // Play time summary
    const mins = Math.floor(stats.totalPlaytime / 60);
    const secs = stats.totalPlaytime % 60;
    text(ctx, `${mins}m ${secs}s played  •  ${stats.sessionCount} sessions`, W / 2, 50, PAL.textDim, 11, 'center');

    // Tab bar
    const tabs = ['overview', 'topics', 'wrong'];
    const tabW = (W - 32) / tabs.length;
    tabs.forEach((tab, i) => {
      const tx = 16 + i * tabW;
      const sel = statsTab === tab;
      ctx.fillStyle = sel ? 'rgba(100,100,200,0.3)' : 'transparent';
      ctx.fillRect(tx, 60, tabW - 2, 24);
      boldText(ctx, tab.toUpperCase(), tx + tabW / 2, 73, sel ? PAL.textHi : PAL.textDim, 10, 'center');
      if (sel) {
        ctx.fillStyle = PAL.uiBorderHi;
        ctx.fillRect(tx, 84, tabW - 2, 2);
      }
    });

    const contentY = 94;
    const contentH = H - contentY - 40;
    ctx.save();
    ctx.beginPath();
    ctx.rect(8, contentY, W - 16, contentH);
    ctx.clip();

    if (statsTab === 'overview') {
      _drawStatsOverview(ctx, W, contentY, stats);
    } else if (statsTab === 'topics') {
      _drawStatsTopics(ctx, W, contentY, contentH, stats);
    } else if (statsTab === 'wrong') {
      _drawStatsWrong(ctx, W, contentY, contentH, statsProfile);
    }

    ctx.restore();

    // Bottom bar
    ctx.fillStyle = PAL.uiBorder;
    ctx.fillRect(8, H - 38, W - 16, 1);
    text(ctx, '[B] Back  [↑↓] Scroll  [A] Export/Copy', W / 2, H - 20, PAL.textDim, 10, 'center');
  }

  function _drawStatsOverview(ctx, W, startY, stats) {
    let y = startY + 14;
    const pad = 20;

    for (const [subj, summary] of Object.entries(stats.subjectSummary)) {
      const subjMeta = typeof Curriculum !== 'undefined' ? Curriculum.SUBJECTS[subj] : null;
      const subjName = subjMeta?.name || subj;
      const pct = summary.pct;
      const barColor = pct === null ? PAL.textDim : pct >= 85 ? PAL.textGreen : pct >= 70 ? PAL.xpFill : pct >= 50 ? '#e67e22' : PAL.textRed;

      boldText(ctx, subjName, pad, y, subjMeta?.color || PAL.textHi, 13);
      y += 18;

      // Big percentage display
      if (pct !== null) {
        boldText(ctx, `${pct}%`, pad, y + 10, barColor, 28);
        text(ctx, `${summary.topicsTested}/${summary.topicsTotal} topics covered`, pad + 60, y + 4, PAL.textDim, 11);

        // Bar
        const bW = W - pad * 2;
        ctx.fillStyle = PAL.uiBg;
        roundRect(ctx, pad, y + 18, bW, 10, 4);
        ctx.fill();
        ctx.fillStyle = barColor;
        const fw = bW * (pct / 100);
        ctx.beginPath();
        roundRect(ctx, pad, y + 18, fw, 10, 4);
        ctx.fill();
        y += 36;
      } else {
        text(ctx, 'No quiz attempts yet', pad + 4, y + 8, PAL.textDim, 11);
        y += 20;
      }

      // Weak topics callout
      const weakTopics = (stats.bySubject[subj] || []).filter(t => t.pct !== null && t.pct < 70);
      if (weakTopics.length > 0) {
        text(ctx, 'Needs work:', pad, y, PAL.textRed, 10);
        y += 14;
        for (const t of weakTopics.slice(0, 3)) {
          ctx.fillStyle = PAL.textRed;
          ctx.font = `11px "Courier New", monospace`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(`  • ${t.name} — ${t.pct}%`, pad + 4, y);
          y += 14;
        }
      }
      y += 12;
      ctx.fillStyle = PAL.uiBorder;
      ctx.fillRect(pad, y, W - pad * 2, 1);
      y += 12;
    }
  }

  function _drawStatsTopics(ctx, W, startY, contentH, stats) {
    const pad = 16;
    let y = startY + 8 - statsScroll;

    for (const [subj, topics] of Object.entries(stats.bySubject)) {
      const subjMeta = typeof Curriculum !== 'undefined' ? Curriculum.SUBJECTS[subj] : null;
      boldText(ctx, (subjMeta?.name || subj).toUpperCase(), pad, y, subjMeta?.color || PAL.textHi, 11);
      y += 18;

      const sorted = [...topics].sort((a, b) => (a.pct ?? 101) - (b.pct ?? 101));
      for (const t of sorted) {
        const pct = t.pct;
        const barColor = pct === null ? '#444' : pct >= 85 ? PAL.textGreen : pct >= 70 ? PAL.xpFill : pct >= 50 ? '#e67e22' : PAL.textRed;
        const label = pct === null ? 'Not tested' : `${pct}% (${t.correct}/${t.attempts})`;

        text(ctx, t.name, pad + 4, y, pct === null ? PAL.textDim : PAL.text, 11);
        text(ctx, label, W - pad - 4, y, barColor, 11, 'right');
        y += 14;

        // Thin bar
        const bW = W - pad * 2;
        ctx.fillStyle = '#1a1a2a';
        ctx.fillRect(pad, y, bW, 6);
        if (pct !== null) {
          ctx.fillStyle = barColor;
          ctx.fillRect(pad, y, bW * (pct / 100), 6);
        }
        y += 10;
      }
      y += 8;
    }
  }

  function _drawStatsWrong(ctx, W, startY, contentH, profileName) {
    const wrongs = typeof Analytics !== 'undefined' ? Analytics.getAllWrongAnswers(profileName) : [];
    const pad = 16;
    let y = startY + 8 - statsScroll;

    if (wrongs.length === 0) {
      text(ctx, 'No wrong answers recorded yet!', W / 2, startY + contentH / 2, PAL.textGreen, 13, 'center');
      return;
    }

    for (const w of wrongs) {
      // Topic label
      text(ctx, w.topicId.replace(/_/g, ' ').toUpperCase(), pad, y, PAL.textDim, 9);
      y += 13;
      // Question
      const words = w.questionText.split(' ');
      let line = '', ly = y;
      ctx.save();
      ctx.font = '11px "Courier New", monospace';
      ctx.fillStyle = PAL.text;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      for (const word of words) {
        const test = line + word + ' ';
        if (ctx.measureText(test).width > W - pad * 2 && line) {
          ctx.fillText(line.trim(), pad, ly);
          line = word + ' '; ly += 14;
        } else line = test;
      }
      ctx.fillText(line.trim(), pad, ly);
      ly += 14;
      ctx.restore();
      y = ly;

      text(ctx, `✗ Said: "${w.lastWrongAnswer}"`, pad + 4, y, PAL.textRed, 10);
      y += 13;
      text(ctx, `✓ Right: "${w.correctAnswer}"`, pad + 4, y, PAL.textGreen, 10);
      y += 13;
      text(ctx, `${w.wrongCount} wrong attempt${w.wrongCount > 1 ? 's' : ''}`, W - pad, y - 13, PAL.textDim, 9, 'right');

      ctx.fillStyle = PAL.uiBorder;
      ctx.fillRect(pad, y + 2, W - pad * 2, 1);
      y += 14;
    }
  }

  return {
    drawHUD, drawDialogue, drawMainMenu, drawCharCreate, drawPlayerPicker,
    drawPauseMenu, drawInventory, drawTalentTree, drawJournal,
    drawMemoryPrison, drawScreenFlash, drawLevelUp, drawStatsScreen,
    drawKnowledgeTrialButton, drawKnowledgeTrialPrompt,
    startMemoryPrison, startKnowledgeTrial, tickMemoryPrison, selectMemoryAnswer, confirmMemoryAnswer,
    flashScreen, showLevelUp, rarityColor,
    panel, roundRect, text, boldText, bar,
    get mainMenuSel() { return mainMenuSel; },
    set mainMenuSel(v) { mainMenuSel = v; },
    get pauseSel() { return pauseSel; },
    set pauseSel(v) { pauseSel = v; },
    get invSel() { return invSel; },
    set invSel(v) { invSel = v; },
    get talentTab() { return talentTab; },
    set talentTab(v) { talentTab = v; },
    get talentSel() { return talentSel; },
    set talentSel(v) { talentSel = v; },
    get journalSel() { return journalSel; },
    set journalSel(v) { journalSel = v; },
    get charCreateClass() { return charCreateClass; },
    set charCreateClass(v) { charCreateClass = v; },
    get charCreateName() { return charCreateName; },
    set charCreateName(v) { charCreateName = v; },
    classOpts,
    get quizState() { return quizState; },
    get playerNameSel() { return playerNameSel; },
    set playerNameSel(v) { playerNameSel = v; },
    get statsProfile() { return statsProfile; },
    set statsProfile(v) { statsProfile = v; },
    get statsScroll() { return statsScroll; },
    set statsScroll(v) { statsScroll = v; },
    get statsTab() { return statsTab; },
    set statsTab(v) { statsTab = v; },
    dialogueChoice: 0,
  };
})();
