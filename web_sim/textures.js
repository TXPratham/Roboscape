/**
 * Procedural Canvas Texture Generator for Photorealistic Amazon Warehouse
 * Creates high-detail textures dynamically for zero asset load dependencies
 */

const WarehouseTextures = {
  // Amazon Kraft Cardboard Box Texture
  createBoxTexture(sku = 'AMZ-BOX-A12', category = 'ELECTRONICS') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base kraft paper cardboard background
    ctx.fillStyle = '#caa472';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle cardboard fibers and noise
    for (let i = 0; i < 6000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const val = Math.random() > 0.5 ? 255 : 0;
      ctx.fillStyle = `rgba(${val},${val},${val},0.035)`;
      ctx.fillRect(x, y, Math.random() * 3 + 1, 1);
    }

    // Kraft tape strip across the top seam
    ctx.fillStyle = '#b58e5a';
    ctx.fillRect(0, 240, 512, 32);
    ctx.fillStyle = '#a8814d';
    ctx.fillRect(0, 254, 512, 4);

    // White shipping label sticker
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(40, 60, 220, 140);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(40, 60, 220, 24);

    // Barcode on label
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('PRIORITY LOGISTICS', 48, 76);

    // Barcode lines
    let bx = 50;
    while (bx < 240) {
      const w = Math.random() > 0.4 ? (Math.random() > 0.5 ? 3 : 2) : 1;
      ctx.fillRect(bx, 88, w, 55);
      bx += w + (Math.random() > 0.5 ? 3 : 2);
    }

    // SKU & Tracking Text
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(sku, 50, 160);
    ctx.font = '9px monospace';
    ctx.fillText(`CATEGORY: ${category}`, 50, 176);
    ctx.fillText('TRACK: 9400 1000 8292 01', 50, 190);

    // Amazon Smile / Delivery stencil on side
    ctx.fillStyle = '#1e293b';
    ctx.font = '900 24px sans-serif';
    ctx.fillText(sku, 60, 360);

    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText(category, 62, 385);

    // Handling icons (Fragile wine glass & Up arrows)
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    // Up arrows
    ctx.beginPath();
    ctx.moveTo(340, 380); ctx.lineTo(340, 340);
    ctx.moveTo(330, 355); ctx.lineTo(340, 340); ctx.lineTo(350, 355);
    ctx.moveTo(380, 380); ctx.lineTo(380, 340);
    ctx.moveTo(370, 355); ctx.lineTo(380, 340); ctx.lineTo(390, 355);
    ctx.stroke();

    // Box border / ambient shadow
    ctx.strokeStyle = '#a07d4b';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 508, 508);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    return texture;
  },

  // Blue Amazon Tote Box Texture
  createToteTexture(id = 'TOTE-B5') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Industrial polypropylene blue
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, 0, 512, 512);

    // Ribbed structural reinforcement lines
    ctx.fillStyle = '#0369a1';
    for (let y = 30; y < 512; y += 40) {
      ctx.fillRect(0, y, 512, 8);
    }

    // White label plate
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(80, 180, 352, 160);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.strokeRect(80, 180, 352, 160);

    // Text on tote
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(id, 256, 250);

    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#e11d48';
    ctx.fillText('FRAGILE ITEMS', 256, 285);

    // Barcode on tote label
    ctx.fillStyle = '#1e293b';
    let bx = 110;
    while (bx < 400) {
      const w = Math.random() > 0.4 ? 3 : 1.5;
      ctx.fillRect(bx, 300, w, 28);
      bx += w + 2;
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  },

  // Concrete Industrial Warehouse Floor with Markings
  createFloorTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');

    // Polished concrete epoxy floor color
    ctx.fillStyle = '#1e2430';
    ctx.fillRect(0, 0, 2048, 2048);

    // Concrete micro-grit noise
    for (let i = 0; i < 20000; i++) {
      const x = Math.random() * 2048;
      const y = Math.random() * 2048;
      const val = Math.random() > 0.5 ? 255 : 0;
      ctx.fillStyle = `rgba(${val},${val},${val},0.025)`;
      ctx.fillRect(x, y, 2, 2);
    }

    // Floor expansion joint grid lines (slab tiles)
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.lineWidth = 3;
    const tileSize = 2048 / 16;
    for (let i = 0; i <= 2048; i += tileSize) {
      ctx.beginPath();
      ctx.moveTo(i, 0); ctx.lineTo(i, 2048);
      ctx.moveTo(0, i); ctx.lineTo(2048, i);
      ctx.stroke();
    }

    // Safety yellow warehouse lane demarcation borders
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 12;
    ctx.strokeRect(60, 60, 2048 - 120, 2048 - 120);

    // Yellow hazard diagonal zebra striping at loading dock zones
    const drawHazardStripe = (x, y, w, h) => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();
      ctx.fillStyle = '#eab308';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#18181b';
      const stripeW = 28;
      for (let sx = -h; sx < w + h; sx += stripeW * 2) {
        ctx.beginPath();
        ctx.moveTo(x + sx, y);
        ctx.lineTo(x + sx + stripeW, y);
        ctx.lineTo(x + sx + stripeW - h, y + h);
        ctx.lineTo(x + sx - h, y + h);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    };

    // Dock staging zones stripes
    drawHazardStripe(80, 1880, 1888, 48);
    drawHazardStripe(80, 80, 1888, 48);

    // Stencil warehouse floor markings
    ctx.font = '900 48px monospace';
    ctx.fillStyle = 'rgba(234, 179, 8, 0.7)';
    ctx.textAlign = 'center';

    // AMR Zone Markings
    ctx.fillText('AMR ZONE - RESTRICTED ACCESS', 1024, 1820);
    ctx.fillText('AUTOMATED HIGHWAY - AISLE 10-14', 1024, 250);

    // Delivery bay labels
    ctx.font = 'bold 36px monospace';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
    ctx.fillText('DELIVERY BAY 1', 350, 1980);
    ctx.fillText('DELIVERY BAY 2', 800, 1980);
    ctx.fillText('DELIVERY BAY 3', 1250, 1980);
    ctx.fillText('DELIVERY BAY 4', 1700, 1980);

    // Navigation guide dashes across primary robot highway
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 6;
    ctx.setLineDash([20, 20]);
    // Horizontal main highway
    ctx.beginPath();
    ctx.moveTo(100, 1024); ctx.lineTo(1948, 1024);
    ctx.moveTo(100, 1400); ctx.lineTo(1948, 1400);
    ctx.moveTo(100, 650); ctx.lineTo(1948, 650);
    ctx.stroke();
    ctx.setLineDash([]);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.anisotropy = 8;
    return texture;
  },

  // Loading Dock Overhead Signboard Texture
  createSignTexture(text = 'DOCK 4') {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 256, 128);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, 250, 122);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '900 38px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 64);

    return new THREE.CanvasTexture(canvas);
  }
};
