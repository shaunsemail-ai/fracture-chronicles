// Merchant system — Quill, the too-knowing shopkeeper
const Merchant = (() => {

  // ── Quill's permanent stock ───────────────────────────────────
  const QUILL_STOCK = [
    { id: 'herb_minor',       baseQty: 5, price: 8  },
    { id: 'herb_major',       baseQty: 3, price: 22 },
    { id: 'veil_shard',       baseQty: 3, price: 15 },
    { id: 'antidote',         baseQty: 4, price: 10 },
    { id: 'arrow',            baseQty: 5, price: 15  }, // qty = 20 per slot
    { id: 'iron_bolts',       baseQty: 3, price: 25 },
    { id: 'trail_rations',    baseQty: 4, price: 12 },
    { id: 'camp_remedy',      baseQty: 2, price: 35 },
    { id: 'reinforced_vest',  baseQty: 1, price: 85 },
    { id: 'leather_vest',     baseQty: 1, price: 25 },
    { id: 'bolt',             baseQty: 3, price: 18 },
  ];

  // ── Rotating specials pool ────────────────────────────────────
  // Two of these rotate each "visit" (seeded by day)
  const SPECIAL_POOL = [
    { id: 'veil_focus',      price: 55 },
    { id: 'thornkin_coat',   price: 62 },
    { id: 'hollow_fang',     price: 90 },
    { id: 'ashfen_blade',    price: 68 },
    { id: 'focus_band',      price: 48 },
    { id: 'revive_token',    price: 55 },
    { id: 'hunters_brew',    price: 40 },
    { id: 'iron_draught',    price: 38 },
    { id: 'swift_step',      price: 35 },
    { id: 'thornwood_spear', price: 48 },
    { id: 'crossbow',        price: 95 },
    { id: 'hunter_bow',      price: 72 },
  ];

  // ── Quill's ambient dialogue lines ───────────────────────────
  const QUILL_AMBIENT = [
    "quill_ambient_0",
    "quill_ambient_1",
    "quill_ambient_2",
    "quill_ambient_3",
    "quill_ambient_4",
  ];

  // ── State ─────────────────────────────────────────────────────
  let shopState = null;
  // shopState = {
  //   mode: 'buy' | 'sell',
  //   selectedIdx: 0,
  //   stock: [{ id, qty, price }],
  //   sessionBuys: 0,    // buys this session (every 5th = discount)
  //   ambientIdx: 0,
  // }

  let lastDaySeed = -1;
  let currentSpecials = [];

  function getDaySeed() {
    const d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }

  function seededRandFromSeed(seed) {
    let s = seed;
    return function() {
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      return (s >>> 0) / 0xffffffff;
    };
  }

  function getSpecials() {
    const seed = getDaySeed();
    if (seed !== lastDaySeed) {
      lastDaySeed = seed;
      const rng = seededRandFromSeed(seed);
      const pool = [...SPECIAL_POOL];
      // Pick 2
      currentSpecials = [];
      for (let i = 0; i < 2; i++) {
        const idx = Math.floor(rng() * pool.length);
        currentSpecials.push({ ...pool[idx], qty: 1, isSpecial: true });
        pool.splice(idx, 1);
      }
    }
    return currentSpecials;
  }

  function init() {
    // Called on zone entry to reset stock
    const specials = getSpecials();
    const stock = QUILL_STOCK.map(s => ({
      id: s.id,
      qty: s.baseQty,
      price: s.price,
      basePrice: s.price,
      isSpecial: false,
    }));
    specials.forEach(s => {
      stock.push({ id: s.id, qty: 1, price: s.price, basePrice: s.price, isSpecial: true });
    });
    if (shopState) {
      shopState.stock = stock;
    }
  }

  function openShop() {
    const specials = getSpecials();
    const stock = QUILL_STOCK.map(s => ({
      id: s.id,
      qty: s.baseQty,
      price: s.price,
      basePrice: s.price,
      isSpecial: false,
    }));
    specials.forEach(s => {
      stock.push({ id: s.id, qty: 1, price: s.price, basePrice: s.price, isSpecial: true });
    });

    shopState = {
      mode: 'buy',
      selectedIdx: 0,
      stock,
      sessionBuys: 0,
      ambientIdx: Math.floor(Math.random() * QUILL_AMBIENT.length),
    };
    return shopState;
  }

  function closeShop() {
    shopState = null;
  }

  function getEffectivePrice(stockEntry) {
    if (!shopState) return stockEntry.price;
    // Every 5th buy gets 20% off
    const nextBuy = shopState.sessionBuys + 1;
    if (nextBuy % 5 === 0) return Math.floor(stockEntry.price * 0.8);
    return stockEntry.price;
  }

  function handleInput(action) {
    if (!shopState) return null;

    const listLength = shopState.mode === 'buy'
      ? shopState.stock.filter(s => s.qty > 0).length
      : Player.state.inventory.filter(s => {
          const item = ITEMS[s.id];
          return item && item.type !== 'quest' && item.value > 0;
        }).length;

    if (action === 'up') {
      shopState.selectedIdx = Math.max(0, shopState.selectedIdx - 1);
    } else if (action === 'down') {
      shopState.selectedIdx = Math.min(listLength - 1, shopState.selectedIdx + 1);
    } else if (action === 'tab') {
      shopState.mode = shopState.mode === 'buy' ? 'sell' : 'buy';
      shopState.selectedIdx = 0;
    } else if (action === 'confirm') {
      if (shopState.mode === 'buy') return tryBuy();
      if (shopState.mode === 'sell') return trySell();
    } else if (action === 'cancel') {
      closeShop();
      return { closed: true };
    }
    return null;
  }

  function tryBuy() {
    if (!shopState) return null;
    const available = shopState.stock.filter(s => s.qty > 0);
    const entry = available[shopState.selectedIdx];
    if (!entry) return null;

    const price = getEffectivePrice(entry);
    if (Player.state.gold < price) {
      return { error: "Not enough gold." };
    }

    Player.state.gold -= price;
    Player.addItem(entry.id, entry.id === 'arrow' || entry.id === 'bolt' || entry.id === 'iron_bolts' ? 20 : 1);
    entry.qty--;
    shopState.sessionBuys++;

    const discountNext = shopState.sessionBuys % 5 === 4;
    const item = ITEMS[entry.id];
    return {
      bought: entry.id,
      name: item?.name || entry.id,
      price,
      discountNext,
      isDiscountPurchase: shopState.sessionBuys % 5 === 0,
    };
  }

  function trySell() {
    if (!shopState) return null;
    const sellable = Player.state.inventory.filter(s => {
      const item = ITEMS[s.id];
      return item && item.type !== 'quest' && item.value > 0;
    });
    const slot = sellable[shopState.selectedIdx];
    if (!slot) return null;

    const item = ITEMS[slot.id];
    if (!item) return null;

    const sellPrice = Math.max(1, Math.floor((item.value || 5) * 0.5));
    Player.state.gold += sellPrice;
    Player.removeItem(slot.id, 1);

    // Clamp selection
    const newLength = Player.state.inventory.filter(s => {
      const it = ITEMS[s.id];
      return it && it.type !== 'quest' && it.value > 0;
    }).length;
    shopState.selectedIdx = Math.min(shopState.selectedIdx, Math.max(0, newLength - 1));

    return { sold: slot.id, name: item.name, price: sellPrice };
  }

  // ── Draw ───────────────────────────────────────────────────────
  function draw(ctx, W, H) {
    if (!shopState) return;

    const panelW = Math.min(560, W - 30);
    const panelH = Math.min(460, H - 60);
    const panelX = (W - panelW) / 2;
    const panelY = (H - panelH) / 2;

    // Background
    ctx.save();
    ctx.globalAlpha = 0.97;
    ctx.fillStyle = PAL.uiBg;
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 10);
    ctx.fill();
    ctx.strokeStyle = '#5a4a28';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Header: Quill's name + gold glyph
    ctx.save();
    ctx.fillStyle = '#d4ac0d';
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('QUILL', panelX + 16, panelY + 22);
    ctx.fillStyle = PAL.textDim;
    ctx.font = '10px "Courier New", monospace';
    ctx.fillText('"Purveyor of things you didn\'t know you needed."', panelX + 72, panelY + 22);
    ctx.restore();

    // Glyph on wrist hint
    ctx.save();
    ctx.fillStyle = PAL.shrineGlow;
    ctx.globalAlpha = 0.7;
    ctx.font = '9px "Courier New", monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText('[wrist glyph visible]', panelX + panelW - 14, panelY + 22);
    ctx.restore();

    ctx.fillStyle = '#5a4a28';
    ctx.fillRect(panelX + 10, panelY + 34, panelW - 20, 1);

    // Player gold
    ctx.save();
    ctx.fillStyle = PAL.xpFill;
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Gold: ${Player.state.gold || 0}g`, panelX + panelW - 14, panelY + panelH - 18);
    ctx.restore();

    // Mode tabs
    const tabW = panelW / 2 - 20;
    ['BUY', 'SELL'].forEach((label, i) => {
      const tx = panelX + 10 + i * (tabW + 20);
      const ty = panelY + 38;
      const active = (i === 0 && shopState.mode === 'buy') || (i === 1 && shopState.mode === 'sell');
      ctx.save();
      ctx.fillStyle = active ? 'rgba(90,74,40,0.5)' : 'transparent';
      ctx.fillRect(tx, ty, tabW, 22);
      ctx.fillStyle = active ? PAL.xpFill : PAL.textDim;
      ctx.font = (active ? 'bold ' : '') + '12px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, tx + tabW / 2, ty + 11);
      if (active) {
        ctx.strokeStyle = '#5a4a28';
        ctx.lineWidth = 1;
        ctx.strokeRect(tx, ty, tabW, 22);
      }
      ctx.restore();
    });

    ctx.fillStyle = PAL.uiBorder;
    ctx.fillRect(panelX + 10, panelY + 62, panelW - 20, 1);

    const listY = panelY + 68;
    const itemH = 30;
    const maxVisible = Math.floor((panelH - 120) / itemH);

    if (shopState.mode === 'buy') {
      const available = shopState.stock.filter(s => s.qty > 0);
      const visStart = Math.max(0, shopState.selectedIdx - Math.floor(maxVisible / 2));

      available.slice(visStart, visStart + maxVisible).forEach((entry, i) => {
        const idx = i + visStart;
        const iy = listY + i * itemH;
        const sel = idx === shopState.selectedIdx;
        const item = ITEMS[entry.id];
        const price = getEffectivePrice(entry);
        const canAfford = (Player.state.gold || 0) >= price;

        if (sel) {
          ctx.fillStyle = 'rgba(80,60,20,0.45)';
          ctx.beginPath();
          ctx.roundRect(panelX + 10, iy - 2, panelW - 20, itemH - 2, 4);
          ctx.fill();
          ctx.strokeStyle = '#d4ac0d';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.save();
        ctx.fillStyle = canAfford ? (sel ? PAL.textHi : PAL.text) : PAL.textDim;
        ctx.font = (sel ? 'bold ' : '') + '11px "Courier New", monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(item?.name || entry.id, panelX + 18, iy + itemH / 2 - 2);

        // Special indicator
        if (entry.isSpecial) {
          ctx.fillStyle = '#d4ac0d';
          ctx.font = '8px "Courier New", monospace';
          ctx.fillText('[SPECIAL]', panelX + 18, iy + itemH - 8);
        }

        // Qty
        ctx.fillStyle = PAL.textDim;
        ctx.font = '10px "Courier New", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`x${entry.qty}`, panelX + panelW - 80, iy + itemH / 2 - 2);

        // Price
        ctx.fillStyle = canAfford ? PAL.xpFill : PAL.textRed;
        ctx.font = 'bold 11px "Courier New", monospace';
        ctx.fillText(`${price}g`, panelX + panelW - 20, iy + itemH / 2 - 2);

        // Discount indicator
        const nextBuy = shopState.sessionBuys + 1;
        if (nextBuy % 5 === 0 && sel) {
          ctx.fillStyle = '#27ae60';
          ctx.font = '8px "Courier New", monospace';
          ctx.fillText('20% OFF!', panelX + panelW - 80, iy + itemH - 8);
        }

        ctx.restore();
      });

      // "Every 5th" hint
      const remaining = 5 - (shopState.sessionBuys % 5);
      if (remaining < 5) {
        ctx.save();
        ctx.fillStyle = PAL.textGreen;
        ctx.font = '9px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          remaining === 1
            ? "Next buy gets 20% off — Quill likes you."
            : `${remaining} buys until Quill's discount.`,
          W / 2, panelY + panelH - 36
        );
        ctx.restore();
      }

    } else {
      // SELL mode
      const sellable = Player.state.inventory.filter(s => {
        const item = ITEMS[s.id];
        return item && item.type !== 'quest' && item.value > 0;
      });
      const visStart = Math.max(0, shopState.selectedIdx - Math.floor(maxVisible / 2));

      if (sellable.length === 0) {
        ctx.save();
        ctx.fillStyle = PAL.textDim;
        ctx.font = '11px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText("Nothing worth selling. Or: nothing you can bear to part with.", W / 2, listY + 40);
        ctx.restore();
      }

      sellable.slice(visStart, visStart + maxVisible).forEach((slot, i) => {
        const idx = i + visStart;
        const iy = listY + i * itemH;
        const sel = idx === shopState.selectedIdx;
        const item = ITEMS[slot.id];
        const sellPrice = Math.max(1, Math.floor((item?.value || 5) * 0.5));

        if (sel) {
          ctx.fillStyle = 'rgba(40,60,80,0.45)';
          ctx.beginPath();
          ctx.roundRect(panelX + 10, iy - 2, panelW - 20, itemH - 2, 4);
          ctx.fill();
          ctx.strokeStyle = '#5dade2';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.save();
        ctx.fillStyle = sel ? PAL.textHi : PAL.text;
        ctx.font = (sel ? 'bold ' : '') + '11px "Courier New", monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(item?.name || slot.id, panelX + 18, iy + itemH / 2 - 2);

        if (slot.qty > 1) {
          ctx.fillStyle = PAL.textDim;
          ctx.font = '10px "Courier New", monospace';
          ctx.textAlign = 'right';
          ctx.fillText(`x${slot.qty}`, panelX + panelW - 80, iy + itemH / 2 - 2);
        }

        ctx.fillStyle = PAL.xpFill;
        ctx.font = 'bold 11px "Courier New", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${sellPrice}g`, panelX + panelW - 20, iy + itemH / 2 - 2);
        ctx.restore();
      });
    }

    // Controls hint
    ctx.save();
    ctx.fillStyle = PAL.textDim;
    ctx.font = '10px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('[A] Confirm  [B] Close  [Up/Down] Select  [Tab/Left/Right] Switch Mode', W / 2, panelY + panelH - 18);
    ctx.restore();
  }

  // ── Ambient dialogue cycling ───────────────────────────────────
  function getNextAmbientId() {
    if (!shopState) return null;
    const id = QUILL_AMBIENT[shopState.ambientIdx % QUILL_AMBIENT.length];
    shopState.ambientIdx++;
    return id;
  }

  return {
    QUILL_STOCK,
    init,
    openShop,
    closeShop,
    handleInput,
    draw,
    getNextAmbientId,
    get shopState() { return shopState; },
  };
})();
