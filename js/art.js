// Thư viện hình minh họa SVG (vẽ tay bằng code) — phong cách phẳng, viền nâu ấm.

const O = '#3b2414';            // màu viền
const NS = 'http://www.w3.org/2000/svg';

export function svg(viewBox, w, h, inner, extra = '') {
  return `<svg xmlns="${NS}" viewBox="${viewBox}" width="${w}" height="${h}" ${extra}>${inner}</svg>`;
}

export function starPath(cx, cy, R, r, n = 5, rot = -90) {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const rad = i % 2 ? r : R;
    const a = ((rot + (i * 180) / n) * Math.PI) / 180;
    d += `${i ? 'L' : 'M'}${(cx + rad * Math.cos(a)).toFixed(1)} ${(cy + rad * Math.sin(a)).toFixed(1)}`;
  }
  return d + 'Z';
}

const tube = (d, color, w = 10) =>
  `<path d="${d}" stroke="${O}" stroke-width="${w + 7}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<path d="${d}" stroke="${color}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;

const sparkle = (x, y, s = 1, c = '#ffd770') =>
  `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -12 Q2 -2 12 0 Q2 2 0 12 Q-2 2 -12 0 Q-2 -2 0 -12Z" fill="${c}"/>`;

// =========================================================
// MŨ NGHỀ — viewBox 0 0 300 200, đáy mũ ở khoảng y = 190
// =========================================================
const HATS = {
  doctor: `
    <defs><radialGradient id="mirD" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#dfe5ee"/><stop offset="1" stop-color="#93a0b4"/></radialGradient></defs>
    <path d="M22 188 Q150 128 278 188 L278 164 Q150 104 22 164 Z" fill="#f4f6fa" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
    <rect x="141" y="102" width="18" height="36" rx="6" fill="#cfd6e2" stroke="${O}" stroke-width="4"/>
    <circle cx="150" cy="76" r="50" fill="url(#mirD)" stroke="${O}" stroke-width="5"/>
    <circle cx="150" cy="76" r="37" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="3"/>
    <circle cx="150" cy="76" r="9" fill="#5b6475"/>
    <path d="M122 58 Q132 44 148 42" stroke="#fff" stroke-width="6" stroke-linecap="round" fill="none" opacity=".85"/>
    <g transform="translate(224 160) rotate(14)"><rect x="-14" y="-5" width="28" height="10" rx="2.5" fill="#d94b45"/><rect x="-5" y="-14" width="10" height="28" rx="2.5" fill="#d94b45"/></g>`,

  astronaut: `
    <path d="M10 196 A140 140 0 0 1 290 196 L254 196 A104 104 0 0 0 46 196 Z" fill="#f1f3f8" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M30 196 A120 120 0 0 1 270 196" fill="none" stroke="#c9d0dc" stroke-width="5"/>
    <path d="M213 74 L238 26" stroke="${O}" stroke-width="5" stroke-linecap="round"/>
    <circle cx="240" cy="22" r="11" fill="#d6423a" stroke="${O}" stroke-width="4"/>
    <rect x="130" y="50" width="40" height="16" rx="5" fill="#ffcf7a" stroke="${O}" stroke-width="4"/>
    <circle cx="58" cy="150" r="18" fill="#2a4677" stroke="${O}" stroke-width="4"/>
    <path d="${starPath(58, 151, 10, 4.5)}" fill="#fff"/>
    <rect x="228" y="138" width="30" height="12" rx="3" fill="#d6423a" stroke="${O}" stroke-width="3"/>
    <rect x="230" y="156" width="26" height="10" rx="3" fill="#3f8fd9" stroke="${O}" stroke-width="3"/>
    <path d="M70 92 Q104 66 140 60" stroke="#fff" stroke-width="7" stroke-linecap="round" fill="none"/>`,

  chef: (() => {
    const puffs = [[95, 100, 46], [150, 70, 58], [205, 100, 46], [122, 110, 40], [178, 110, 40]];
    return puffs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fffdf8" stroke="${O}" stroke-width="5"/>`).join('') +
      puffs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r - 3}" fill="#fffdf8"/>`).join('') + `
      <path d="M78 96 Q84 72 104 66" stroke="#e7e2d6" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M150 44 Q168 46 178 62" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>
      <rect x="68" y="120" width="164" height="64" rx="10" fill="#fffdf8" stroke="${O}" stroke-width="5"/>
      <path d="M110 128 V176 M150 128 V176 M190 128 V176" stroke="#e2ddd0" stroke-width="5" stroke-linecap="round"/>`;
  })(),

  firefighter: `
    <defs><linearGradient id="badgeF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe19a"/><stop offset="1" stop-color="#d9a441"/></linearGradient></defs>
    <ellipse cx="150" cy="178" rx="142" ry="18" fill="#a92e27" stroke="${O}" stroke-width="5"/>
    <path d="M48 178 Q44 64 150 56 Q256 64 252 178 Z" fill="#d6423a" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M150 60 V176" stroke="#a92e27" stroke-width="16"/>
    <path d="M150 60 V176" stroke="#e85a50" stroke-width="6"/>
    <path d="M86 84 Q74 122 78 168" stroke="#f08a80" stroke-width="8" fill="none" stroke-linecap="round" opacity=".75"/>
    <path d="M116 92 H184 V128 Q184 158 150 172 Q116 158 116 128 Z" fill="url(#badgeF)" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
    <path d="${starPath(150, 128, 20, 9)}" fill="#d6423a" stroke="${O}" stroke-width="2.5" stroke-linejoin="round"/>`,

  painter: `
    <path d="M36 168 Q18 118 92 96 Q170 72 248 106 Q292 128 272 160 Q262 176 236 176 L70 178 Q44 180 36 168Z" fill="#b8334a" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M60 166 Q150 186 252 164" stroke="#8c2236" stroke-width="13" fill="none" stroke-linecap="round"/>
    <path d="M150 84 q4 -18 20 -22" stroke="${O}" stroke-width="9" stroke-linecap="round" fill="none"/>
    <path d="M90 112 Q140 92 196 98" stroke="#d9566b" stroke-width="8" fill="none" stroke-linecap="round" opacity=".85"/>
    <circle cx="214" cy="126" r="9" fill="#ffc23d" stroke="${O}" stroke-width="3"/>
    <circle cx="236" cy="142" r="7" fill="#3f8fd9" stroke="${O}" stroke-width="3"/>
    <circle cx="196" cy="146" r="6" fill="#4caf6e" stroke="${O}" stroke-width="3"/>`,

  singer: `
    ${tube('M95 140 q-14 -10 0 -20 q14 -10 0 -20 q-14 -10 0 -20 q14 -10 0 -20', '#c9d1dd', 4)}
    ${tube('M205 140 q14 -10 0 -20 q-14 -10 0 -20 q14 -10 0 -20 q-14 -10 0 -20', '#c9d1dd', 4)}
    ${tube('M28 192 Q150 100 272 192', '#e05a9a', 16)}
    <path d="${starPath(95, 44, 34, 15)}" fill="#ffd25e" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
    <g transform="translate(205 46)">
      <ellipse cx="-6" cy="16" rx="17" ry="13" transform="rotate(-22 -6 16)" fill="#8a5cd6" stroke="${O}" stroke-width="5"/>
      <path d="M9 12 V-30 Q26 -22 32 -4" stroke="${O}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    ${sparkle(50, 92, 0.9)}${sparkle(252, 96, 0.8, '#fbe7b5')}`,

  police: `
    <path d="M58 140 L32 92 Q150 42 268 92 L242 140 Z" fill="#26375f" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M60 96 Q150 60 240 96" stroke="#3a5088" stroke-width="7" fill="none" stroke-linecap="round"/>
    <rect x="56" y="132" width="188" height="34" rx="6" fill="#141c30" stroke="${O}" stroke-width="5"/>
    <path d="M62 149 H238" stroke="#f2c46d" stroke-width="3"/>
    <path d="M50 162 Q150 212 250 162 Q150 184 50 162 Z" fill="#0d1220" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M150 72 L174 82 L172 108 Q168 124 150 132 Q132 124 128 108 L126 82 Z" fill="#f2c46d" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
    <path d="${starPath(150, 103, 13, 6)}" fill="#26375f"/>`,

  teacher: `
    <path d="M84 104 L84 158 Q150 190 216 158 L216 104 Z" fill="#232a3d" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M150 40 L292 88 L150 136 L8 88 Z" fill="#2f374f" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M150 54 L262 88" stroke="#4a5576" stroke-width="5" stroke-linecap="round"/>
    <path d="M150 88 Q228 92 252 102 L252 148" stroke="${O}" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M150 88 Q228 92 252 102 L252 148" stroke="#f2c46d" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="150" cy="88" r="9" fill="#f2c46d" stroke="${O}" stroke-width="3"/>
    <path d="M242 144 H262 L268 180 H236 Z" fill="#f2c46d" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>`,

  generic: `
    <defs><linearGradient id="crownG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a8"/><stop offset="1" stop-color="#e0a940"/></linearGradient></defs>
    <path d="M40 180 L26 78 L92 126 L150 50 L208 126 L274 78 L260 180 Z" fill="url(#crownG)" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
    <rect x="38" y="158" width="224" height="26" rx="7" fill="#d9a441" stroke="${O}" stroke-width="5"/>
    <circle cx="26" cy="78" r="11" fill="#fbe7b5" stroke="${O}" stroke-width="4"/>
    <circle cx="150" cy="50" r="11" fill="#fbe7b5" stroke="${O}" stroke-width="4"/>
    <circle cx="274" cy="78" r="11" fill="#fbe7b5" stroke="${O}" stroke-width="4"/>
    <circle cx="150" cy="136" r="13" fill="#d6423a" stroke="${O}" stroke-width="4"/>
    <circle cx="96" cy="146" r="9" fill="#3f8fd9" stroke="${O}" stroke-width="3.5"/>
    <circle cx="204" cy="146" r="9" fill="#4caf6e" stroke="${O}" stroke-width="3.5"/>`,
};

// =========================================================
// ĐẠO CỤ — viewBox 0 0 200 200
// =========================================================
const PROPS = {
  doctor: `
    <defs><radialGradient id="chestD" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#9aa6b8"/></radialGradient></defs>
    ${tube('M58 30 Q50 82 96 106 M142 30 Q150 82 104 106', '#3f4a5e', 9)}
    ${tube('M100 106 Q100 166 140 164 Q178 160 166 124', '#3f4a5e', 9)}
    <circle cx="58" cy="26" r="10" fill="#c9d1dd" stroke="${O}" stroke-width="4"/>
    <circle cx="142" cy="26" r="10" fill="#c9d1dd" stroke="${O}" stroke-width="4"/>
    <circle cx="100" cy="106" r="11" fill="#c9d1dd" stroke="${O}" stroke-width="4"/>
    <circle cx="166" cy="114" r="24" fill="url(#chestD)" stroke="${O}" stroke-width="5"/>
    <circle cx="166" cy="114" r="12" fill="#e8edf3" stroke="#9aa6b8" stroke-width="3"/>`,

  astronaut: `
    <g transform="rotate(32 100 100)">
      <path d="M84 150 Q100 200 116 150 Z" fill="#ffb347" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M92 150 Q100 180 108 150 Z" fill="#fff1a8"/>
      <path d="M76 116 L50 154 L80 148 Z" fill="#d6423a" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M124 116 L150 154 L120 148 Z" fill="#d6423a" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M100 16 Q138 50 128 150 L72 150 Q62 50 100 16 Z" fill="#f4f6fa" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M100 16 Q120 32 127 58 L73 58 Q80 32 100 16 Z" fill="#d6423a" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
      <circle cx="100" cy="92" r="17" fill="#5fb0e8" stroke="${O}" stroke-width="5"/>
      <circle cx="94" cy="86" r="5" fill="#fff" opacity=".85"/>
      <path d="M80 70 Q78 110 82 140" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".9"/>
    </g>
    ${sparkle(30, 40)}${sparkle(170, 170, 0.7, '#fbe7b5')}`,

  chef: `
    <rect x="128" y="112" width="70" height="20" rx="10" transform="rotate(-22 128 122)" fill="#7a4e2c" stroke="${O}" stroke-width="5"/>
    <circle cx="84" cy="112" r="64" fill="#2e3440" stroke="${O}" stroke-width="5"/>
    <circle cx="84" cy="112" r="52" fill="#474f5e"/>
    <path d="M54 104 Q50 74 80 74 Q110 70 112 96 Q124 124 96 136 Q60 146 54 120 Z" fill="#fff" stroke="${O}" stroke-width="3.5"/>
    <circle cx="84" cy="106" r="16" fill="#ffc23d" stroke="${O}" stroke-width="3.5"/>
    <circle cx="79" cy="100" r="5" fill="#fff3c4"/>
    ${sparkle(160, 50, 0.8)}`,

  firefighter: `
    ${tube('M112 46 Q176 50 162 112 Q156 142 176 156', '#1d222c', 9)}
    <rect x="170" y="148" width="16" height="26" rx="4" transform="rotate(-20 178 160)" fill="#3f4a5e" stroke="${O}" stroke-width="4"/>
    <rect x="84" y="34" width="28" height="26" rx="5" fill="#3f4a5e" stroke="${O}" stroke-width="4"/>
    ${tube('M86 40 L56 28', '#3f4a5e', 6)}
    <rect x="64" y="56" width="66" height="130" rx="28" fill="#d6423a" stroke="${O}" stroke-width="5"/>
    <path d="M78 74 V168" stroke="#f08a80" stroke-width="7" stroke-linecap="round" opacity=".8"/>
    <rect x="86" y="104" width="38" height="40" rx="6" fill="#fdf6e7" stroke="${O}" stroke-width="3"/>
    <path d="M105 136 Q92 130 96 118 Q100 124 104 116 Q108 108 106 104 Q120 116 114 130 Q112 136 105 136Z" fill="#ff8a3d"/>`,

  painter: `
    <path d="M100 30 C40 30 16 80 28 120 C38 156 70 172 104 170 C132 168 130 146 120 136 C110 126 118 114 134 116 C162 120 184 106 182 80 C180 50 146 30 100 30 Z" fill="#e9c48f" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
    <ellipse cx="70" cy="132" rx="14" ry="11" fill="#c99c62" stroke="${O}" stroke-width="3.5"/>
    <circle cx="62" cy="76" r="13" fill="#d6423a" stroke="${O}" stroke-width="3.5"/>
    <circle cx="100" cy="58" r="13" fill="#ffc23d" stroke="${O}" stroke-width="3.5"/>
    <circle cx="140" cy="64" r="13" fill="#3f8fd9" stroke="${O}" stroke-width="3.5"/>
    <circle cx="158" cy="94" r="12" fill="#4caf6e" stroke="${O}" stroke-width="3.5"/>
    <circle cx="46" cy="108" r="11" fill="#8a5cd6" stroke="${O}" stroke-width="3.5"/>
    <g transform="rotate(38 150 150)">
      <rect x="144" y="92" width="13" height="92" rx="6" fill="#8a5a33" stroke="${O}" stroke-width="4"/>
      <rect x="142" y="78" width="17" height="18" rx="3" fill="#c9d1dd" stroke="${O}" stroke-width="4"/>
      <path d="M143 80 Q150 46 158 80 Z" fill="#d6423a" stroke="${O}" stroke-width="3.5" stroke-linejoin="round"/>
    </g>`,

  singer: `
    <defs>
      <radialGradient id="micS" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#c9d1dd"/><stop offset="1" stop-color="#7c879a"/></radialGradient>
      <clipPath id="micClip"><circle cx="100" cy="66" r="38"/></clipPath>
    </defs>
    <path d="M86 110 L114 110 L107 188 L93 188 Z" fill="#2a2f3a" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
    <rect x="82" y="100" width="36" height="18" rx="5" fill="#f2c46d" stroke="${O}" stroke-width="4"/>
    <circle cx="100" cy="66" r="40" fill="url(#micS)" stroke="${O}" stroke-width="5"/>
    <g clip-path="url(#micClip)" stroke="#7c879a" stroke-width="2.5" fill="none" opacity=".7">
      <path d="M50 46 H150 M50 60 H150 M50 74 H150 M50 88 H150"/>
      <path d="M72 20 V110 M88 20 V110 M104 20 V110 M120 20 V110 M136 20 V110"/>
    </g>
    ${sparkle(36, 40, 1.1)}${sparkle(166, 34, 0.8, '#fbe7b5')}${sparkle(170, 104, 0.7)}`,

  police: `
    <defs><linearGradient id="badgeP" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe9a8"/><stop offset="1" stop-color="#d49a36"/></linearGradient></defs>
    <path d="M100 18 L166 42 L160 112 Q152 160 100 186 Q48 160 40 112 L34 42 Z" fill="url(#badgeP)" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M100 38 L148 55 L144 110 Q138 146 100 166 Q62 146 56 110 L52 55 Z" fill="none" stroke="#b8862f" stroke-width="4" stroke-linejoin="round"/>
    <path d="${starPath(100, 100, 32, 14)}" fill="#26375f" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M64 56 Q70 90 66 118" stroke="#fff6d6" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8"/>`,

  teacher: `
    <rect x="28" y="142" width="144" height="30" rx="4" fill="#3f8fd9" stroke="${O}" stroke-width="5"/>
    <rect x="150" y="148" width="16" height="18" fill="#fdf6e7"/>
    <rect x="42" y="114" width="124" height="30" rx="4" fill="#d6423a" stroke="${O}" stroke-width="5"/>
    <rect x="46" y="120" width="14" height="18" fill="#fdf6e7"/>
    <rect x="34" y="88" width="132" height="28" rx="4" fill="#4caf6e" stroke="${O}" stroke-width="5"/>
    <rect x="146" y="94" width="14" height="16" fill="#fdf6e7"/>
    <path d="M100 46 C82 34 60 48 66 70 C70 88 88 92 100 84 C112 92 130 88 134 70 C140 48 118 34 100 46 Z" fill="#d6423a" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M100 46 L97 30" stroke="${O}" stroke-width="5" stroke-linecap="round"/>
    <path d="M102 42 Q106 26 124 24 Q120 40 102 42 Z" fill="#4caf6e" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M80 56 Q78 66 84 74" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>`,

  generic: giftInner('#d6423a', '#f2c46d', 2, 1),
};

function giftInner(box, ribbon, s = 2, k = 1) {
  // hộp quà trong khung 200x200 (s=2) hoặc 100x100 (s=1)
  const t = (v) => v * s;
  const lid = shade(box, 0.12);
  return `
    <rect x="${t(12)}" y="${t(42)}" width="${t(76)}" height="${t(52)}" rx="${t(4)}" fill="${box}" stroke="${O}" stroke-width="${t(2.2) * k}"/>
    <rect x="${t(44)}" y="${t(42)}" width="${t(12)}" height="${t(52)}" fill="${ribbon}"/>
    <rect x="${t(6)}" y="${t(30)}" width="${t(88)}" height="${t(16)}" rx="${t(4)}" fill="${lid}" stroke="${O}" stroke-width="${t(2.2) * k}"/>
    <rect x="${t(44)}" y="${t(30)}" width="${t(12)}" height="${t(16)}" fill="${ribbon}"/>
    <path d="M${t(50)} ${t(30)} C${t(38)} ${t(10)} ${t(18)} ${t(14)} ${t(28)} ${t(28)} Z" fill="${ribbon}" stroke="${O}" stroke-width="${t(2) * k}" stroke-linejoin="round"/>
    <path d="M${t(50)} ${t(30)} C${t(62)} ${t(10)} ${t(82)} ${t(14)} ${t(72)} ${t(28)} Z" fill="${ribbon}" stroke="${O}" stroke-width="${t(2) * k}" stroke-linejoin="round"/>
    <circle cx="${t(50)}" cy="${t(29)}" r="${t(5)}" fill="${ribbon}" stroke="${O}" stroke-width="${t(2) * k}"/>`;
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c) => Math.round(c + (255 - c) * amt);
  const r = mix(n >> 16), g = mix((n >> 8) & 255), b = mix(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

export const hatSVG = (key, w = 300, h = 200) => svg('0 0 300 200', w, h, HATS[key] || HATS.generic);
export const propSVG = (key, w = 200, h = 200) => svg('0 0 200 200', w, h, PROPS[key] || PROPS.generic);

// =========================================================
// NHÂN VẬT BÉ MẶC ĐỒ NGHỀ — viewBox 0 0 460 540
// gender: 'boy' | 'girl'
// =========================================================
const SKIN = '#f8d6bb', HAIR = '#4a2c1a';

// Áo theo nghề: [màu áo, màu tay áo, chi tiết vẽ thêm trên thân]
const OUTFITS = {
  doctor: ['#f7f9fc', '#e6ebf2', `
    <path d="M172 322 L200 392 L228 322 Z" fill="#9fd0e8" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M160 324 L200 410 M240 324 L200 410" stroke="${O}" stroke-width="5" stroke-linecap="round"/>
    <rect x="234" y="420" width="44" height="34" rx="6" fill="#fff" stroke="${O}" stroke-width="4"/>
    <rect x="250" y="426" width="12" height="22" rx="2" fill="#d6423a"/><rect x="245" y="431" width="22" height="12" rx="2" fill="#d6423a"/>`],
  astronaut: ['#eef1f6', '#dfe4ec', `
    <ellipse cx="200" cy="328" rx="62" ry="16" fill="#c9d0dc" stroke="${O}" stroke-width="4"/>
    <rect x="160" y="388" width="80" height="54" rx="10" fill="#26375f" stroke="${O}" stroke-width="4"/>
    <circle cx="180" cy="408" r="8" fill="#d6423a"/><circle cx="202" cy="408" r="8" fill="#ffd25e"/><circle cx="224" cy="408" r="8" fill="#4caf6e"/>
    <rect x="172" y="424" width="56" height="8" rx="4" fill="#9fb0cc"/>`],
  chef: ['#fffdf8', '#f1ece0', `
    <path d="M166 322 L200 362 L234 322 Z" fill="#d6423a" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M200 362 L188 392 L212 392 Z" fill="#d6423a" stroke="${O}" stroke-width="3.5" stroke-linejoin="round"/>
    ${[400, 436, 472].map((y) => `<circle cx="178" cy="${y}" r="6" fill="#c9b99a"/><circle cx="222" cy="${y}" r="6" fill="#c9b99a"/>`).join('')}`],
  firefighter: ['#d6423a', '#c43a33', `
    <path d="M100 436 H300 M104 470 H296" stroke="#ffd25e" stroke-width="12"/>
    <path d="M100 436 H300 M104 470 H296" stroke="#fff3c4" stroke-width="3"/>
    <path d="M200 330 V500" stroke="#3b2414" stroke-width="5"/>
    <path d="M170 326 L200 346 L230 326" stroke="#3b2414" stroke-width="5" fill="none" stroke-linejoin="round"/>`],
  painter: ['#3f8f7a', '#357a68', `
    <path d="M200 340 L168 322 Q160 350 176 360 Z M200 340 L232 322 Q240 350 224 360 Z" fill="#d6423a" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="200" cy="342" r="10" fill="#d6423a" stroke="${O}" stroke-width="4"/>
    <circle cx="150" cy="420" r="11" fill="#ffd25e"/><circle cx="246" cy="452" r="9" fill="#fdf6e7"/><circle cx="178" cy="476" r="8" fill="#d6423a"/><circle cx="262" cy="404" r="7" fill="#f2c46d"/>`],
  singer: ['#8a5cd6', '#7a4ec4', `
    <path d="M200 338 L170 322 L170 356 Z M200 338 L230 322 L230 356 Z" fill="#f2c46d" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="200" cy="339" r="8" fill="#f2c46d" stroke="${O}" stroke-width="4"/>
    ${sparkle(150, 420, 0.9)}${sparkle(252, 450, 1.1)}${sparkle(196, 488, 0.7, '#fbe7b5')}`],
  police: ['#26375f', '#1f2e52', `
    <path d="M172 322 L200 358 L228 322 Z" fill="#dfe6f3" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M200 358 L190 372 L200 452 L210 372 Z" fill="#141c30" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M248 392 L270 400 L268 424 Q264 438 248 444 Q232 438 228 424 L226 400 Z" fill="#f2c46d" stroke="${O}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="${starPath(248, 418, 10, 4.5)}" fill="#26375f"/>`],
  teacher: ['#2f7d5b', '#286b4e', `
    <path d="M200 334 L164 322 L172 354 Z M200 334 L236 322 L228 354 Z" fill="#fdf6e7" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M200 340 V500" stroke="#1e5a40" stroke-width="5"/>
    ${[392, 428, 464].map((y) => `<circle cx="214" cy="${y}" r="6" fill="#fdf6e7"/>`).join('')}`],
  generic: ['#c8473f', '#b63c35', `
    <path d="M104 420 H296" stroke="#fdf6e7" stroke-width="20"/>
    <path d="M104 420 l12 -8 l12 8 l12 -8 l12 8 l12 -8 l12 8 l12 -8 l12 8 l12 -8 l12 8 l12 -8 l12 8 l12 -8 l12 8 l12 -8 l12 8" stroke="#2f7d5b" stroke-width="5" fill="none" stroke-linejoin="round"/>
    <path d="M168 324 Q200 344 232 324" stroke="#fdf6e7" stroke-width="12" fill="none" stroke-linecap="round"/>
    <circle cx="150" cy="466" r="6" fill="#fdf6e7"/><circle cx="200" cy="474" r="6" fill="#fdf6e7"/><circle cx="250" cy="466" r="6" fill="#fdf6e7"/>`],
};

function kidBody(key, gender) {
  const [coat, sleeve, detail] = OUTFITS[key] || OUTFITS.generic;
  const girl = gender === 'girl';
  const hairBack = girl ? `
    <path d="M102 210 Q84 300 116 336 L136 312 Q114 270 118 214 Z" fill="${HAIR}" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M298 210 Q316 300 284 336 L264 312 Q286 270 282 214 Z" fill="${HAIR}" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>` : '';
  const pigtails = girl ? [[78, 262, 1], [322, 262, -1]].map(([x, y, f]) => `
    <circle cx="${x}" cy="${y}" r="30" fill="${HAIR}" stroke="${O}" stroke-width="4"/>
    <g transform="translate(${x + f * 18} ${y - 26})">
      <path d="M0 0 L-20 -14 L-20 14 Z M0 0 L20 -14 L20 14 Z" fill="#d6423a" stroke="${O}" stroke-width="3.5" stroke-linejoin="round"/>
      <circle r="6" fill="#d6423a" stroke="${O}" stroke-width="3.5"/>
    </g>`).join('') : '';
  const fringe = girl
    ? `M102 222 Q92 116 200 108 Q308 116 298 222 Q286 166 240 158 Q214 176 200 160 Q184 178 156 162 Q116 170 102 222Z`
    : `M102 222 Q92 118 200 108 Q308 118 298 222 Q290 180 262 168 Q240 186 210 172 Q182 190 154 172 Q124 182 102 222Z`;
  return `
    ${hairBack}
    <path d="M92 500 L96 414 Q100 344 160 322 L240 322 Q300 344 304 414 L308 500 Z" fill="${coat}" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
    ${detail}
    <path d="M112 352 Q84 400 90 452" stroke="${O}" stroke-width="46" fill="none" stroke-linecap="round"/>
    <path d="M112 352 Q84 400 90 452" stroke="${sleeve}" stroke-width="37" fill="none" stroke-linecap="round"/>
    <circle cx="90" cy="462" r="20" fill="${SKIN}" stroke="${O}" stroke-width="4.5"/>
    <path d="M288 352 Q322 370 334 404" stroke="${O}" stroke-width="46" fill="none" stroke-linecap="round"/>
    <path d="M288 352 Q322 370 334 404" stroke="${sleeve}" stroke-width="37" fill="none" stroke-linecap="round"/>
    <circle cx="100" cy="230" r="17" fill="${SKIN}" stroke="${O}" stroke-width="4.5"/>
    <circle cx="300" cy="230" r="17" fill="${SKIN}" stroke="${O}" stroke-width="4.5"/>
    <circle cx="200" cy="222" r="100" fill="${SKIN}" stroke="${O}" stroke-width="5"/>
    <path d="${fringe}" fill="${HAIR}" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
    ${pigtails}
    <ellipse cx="166" cy="222" rx="9" ry="12" fill="${O}"/><ellipse cx="234" cy="222" rx="9" ry="12" fill="${O}"/>
    <circle cx="169" cy="217" r="3.2" fill="#fff"/><circle cx="237" cy="217" r="3.2" fill="#fff"/>
    <ellipse cx="146" cy="254" rx="17" ry="10" fill="#f29a9a" opacity=".6"/><ellipse cx="254" cy="254" rx="17" ry="10" fill="#f29a9a" opacity=".6"/>
    <path d="M178 262 Q200 284 222 262" stroke="${O}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
}

export function kidSVG(key, gender = 'boy', w = '100%', h = '100%') {
  const hat = HATS[key] || HATS.generic;
  const prop = PROPS[key] || PROPS.generic;
  return svg('0 0 460 540', w, h, `<g transform="translate(0 40)">
    ${kidBody(key, gender)}
    <svg x="75" y="-8" width="250" height="167" viewBox="0 0 300 200">${hat}</svg>
    <svg x="292" y="296" width="150" height="150" viewBox="0 0 200 200">${prop}</svg>
    <circle cx="338" cy="410" r="20" fill="${SKIN}" stroke="${O}" stroke-width="4.5"/>
  </g>`);
}

// Thẻ chọn nghề: bé trai/bé gái xen kẽ cho sinh động
export const careerCardSVG = (key, i = 0) => kidSVG(key, i % 2 ? 'girl' : 'boy');

// =========================================================
// ĐỒ TRANG TRÍ CÂY THÔNG — viewBox 0 0 100 110, móc treo ở trên
// =========================================================
const hook = `<path d="M50 3 a5 5 0 1 0 0.1 0" fill="none" stroke="#d9a441" stroke-width="3"/>`;
const ORN = {
  'red-ball': `${hook}<rect x="41" y="10" width="18" height="12" rx="3" fill="#d9a441" stroke="${O}" stroke-width="3"/>
    <circle cx="50" cy="60" r="36" fill="#d6423a" stroke="${O}" stroke-width="4"/>
    <path d="M16 58 Q50 76 84 58" stroke="#f2c46d" stroke-width="6" fill="none"/>
    <circle cx="32" cy="68" r="3.5" fill="#fbe7b5"/><circle cx="50" cy="73" r="3.5" fill="#fbe7b5"/><circle cx="68" cy="68" r="3.5" fill="#fbe7b5"/>
    <ellipse cx="36" cy="44" rx="7" ry="11" transform="rotate(35 36 44)" fill="#fff" opacity=".45"/>`,
  'gold-ball': `${hook}<rect x="41" y="10" width="18" height="12" rx="3" fill="#c9d1dd" stroke="${O}" stroke-width="3"/>
    <circle cx="50" cy="60" r="36" fill="#f2c46d" stroke="${O}" stroke-width="4"/>
    <path d="M18 50 L30 58 L42 50 L50 58 L58 50 L70 58 L82 50" stroke="#c98a2a" stroke-width="5" fill="none" stroke-linejoin="round"/>
    <path d="M18 68 L30 76 L42 68 L50 76 L58 68 L70 76 L82 68" stroke="#c98a2a" stroke-width="5" fill="none" stroke-linejoin="round"/>
    <ellipse cx="36" cy="42" rx="7" ry="11" transform="rotate(35 36 42)" fill="#fff" opacity=".55"/>`,
  bell: `${hook}<path d="M50 14 C30 14 26 38 26 56 C26 72 18 80 12 88 L88 88 C82 80 74 72 74 56 C74 38 70 14 50 14Z" fill="#f2c46d" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
    <rect x="10" y="84" width="80" height="10" rx="5" fill="#d9a441" stroke="${O}" stroke-width="4"/>
    <circle cx="50" cy="100" r="8" fill="#d9a441" stroke="${O}" stroke-width="4"/>
    <path d="M38 30 Q32 46 34 64" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".6"/>
    <path d="M50 18 C40 6 28 10 34 20 Z M50 18 C60 6 72 10 66 20 Z" fill="#d6423a" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>`,
  candy: `<path d="M62 104 L62 40 Q62 14 40 14 Q20 14 20 36" fill="none" stroke="${O}" stroke-width="21" stroke-linecap="round"/>
    <path d="M62 104 L62 40 Q62 14 40 14 Q20 14 20 36" fill="none" stroke="#fffdf8" stroke-width="14" stroke-linecap="round"/>
    <path d="M62 104 L62 40 Q62 14 40 14 Q20 14 20 36" fill="none" stroke="#d6423a" stroke-width="14" stroke-dasharray="9 9"/>`,
  snowman: `<circle cx="50" cy="78" r="25" fill="#fffdf8" stroke="${O}" stroke-width="4"/>
    <circle cx="50" cy="42" r="18" fill="#fffdf8" stroke="${O}" stroke-width="4"/>
    <rect x="35" y="6" width="30" height="20" rx="3" fill="#26375f" stroke="${O}" stroke-width="3.5"/>
    <rect x="28" y="23" width="44" height="7" rx="3.5" fill="#26375f" stroke="${O}" stroke-width="3.5"/>
    <circle cx="44" cy="40" r="2.6" fill="${O}"/><circle cx="56" cy="40" r="2.6" fill="${O}"/>
    <path d="M50 45 L64 48 L50 50 Z" fill="#ff8a3d"/>
    <path d="M32 58 Q50 66 68 58" stroke="#d6423a" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M60 60 L66 76" stroke="#d6423a" stroke-width="7" stroke-linecap="round"/>
    <circle cx="50" cy="74" r="3" fill="${O}"/><circle cx="50" cy="86" r="3" fill="${O}"/>`,
  star: `${hook}<path d="${starPath(50, 60, 42, 19)}" fill="#ffd25e" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M40 42 L46 54" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/>`,
  stocking: `<path d="M50 4 Q40 4 40 12" stroke="#d9a441" stroke-width="3" fill="none"/>
    <path d="M30 24 H68 V64 L84 76 Q98 88 86 100 Q76 108 62 98 L38 82 Q30 76 30 66 Z" fill="#d6423a" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M70 76 Q76 86 86 88" stroke="#fffdf8" stroke-width="6" fill="none" stroke-linecap="round" opacity=".85"/>
    <rect x="24" y="10" width="50" height="20" rx="8" fill="#fffdf8" stroke="${O}" stroke-width="4"/>`,
  mitten: `<path d="M50 4 Q44 4 44 10" stroke="#d9a441" stroke-width="3" fill="none"/>
    <ellipse cx="24" cy="56" rx="11" ry="17" transform="rotate(-32 24 56)" fill="#2f7d5b" stroke="${O}" stroke-width="4"/>
    <path d="M30 42 Q30 14 54 14 Q76 14 76 42 L76 84 L30 84 Z" fill="#2f7d5b" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="46" cy="38" r="3" fill="#fffdf8"/><circle cx="60" cy="50" r="3" fill="#fffdf8"/><circle cx="46" cy="62" r="3" fill="#fffdf8"/><circle cx="62" cy="28" r="3" fill="#fffdf8"/>
    <rect x="26" y="80" width="54" height="20" rx="8" fill="#fffdf8" stroke="${O}" stroke-width="4"/>`,
};

export const ORNAMENTS = [
  { type: 'red-ball', name: 'Quả châu đỏ' },
  { type: 'gold-ball', name: 'Quả châu vàng' },
  { type: 'bell', name: 'Chuông' },
  { type: 'candy', name: 'Kẹo gậy' },
  { type: 'snowman', name: 'Người tuyết' },
  { type: 'star', name: 'Ngôi sao nhỏ' },
  { type: 'stocking', name: 'Tất Noel' },
  { type: 'mitten', name: 'Găng tay' },
];
export const ornamentSVG = (type) => svg('0 0 100 110', '100%', '100%', ORN[type] || ORN['red-ball']);

const GIFT_COLORS = [
  ['#d6423a', '#f2c46d'], ['#f2c46d', '#d6423a'], ['#2f7d5b', '#fbe7b5'], ['#fdf6e7', '#d6423a'],
  ['#1f5a43', '#f2c46d'], ['#b8334a', '#fdf6e7'], ['#e9a23b', '#2f7d5b'],
];
export function giftSVG(i = 0) {
  const [box, ribbon] = GIFT_COLORS[i % GIFT_COLORS.length];
  return svg('0 0 100 100', '100%', '100%', giftInner(box, ribbon, 1, 1.4));
}

// =========================================================
// CÂY THÔNG LỚN — viewBox 0 0 600 720
// =========================================================
const TIERS = [
  // [apexY, bottomY, halfWidth]
  [350, 610, 260],
  [230, 460, 190],
  [130, 320, 130],
  [70, 200, 80],
];
const GARLANDS = [
  // [x1,y1, cx,cy, x2,y2, số đèn]
  [242, 170, 300, 205, 352, 158, 4],
  [204, 275, 300, 330, 385, 258, 6],
  [154, 410, 300, 480, 432, 392, 8],
  [94, 560, 300, 640, 488, 540, 10],
];
const LIGHT_COLORS = ['#ffcf7a', '#fff1c4', '#ff9a7a', '#ffd770', '#ffe6b0'];

export function treeSVG() {
  const tiers = TIERS.map(([a, b, hw], i) => {
    const d = `M300 ${a} L${300 + hw} ${b} Q300 ${b + 34} ${300 - hw} ${b} Z`;
    const fill = ['#1d5640', '#22604a', '#26684f', '#2b7055'][i];
    const snow = `M${300 - hw * 0.72} ${b - hw * 0.1} Q${300 - hw * 0.45} ${b + 10} ${300 - hw * 0.2} ${b + 6}
                  M${300 + hw * 0.15} ${b + 8} Q${300 + hw * 0.45} ${b + 12} ${300 + hw * 0.7} ${b - hw * 0.08}`;
    const shadeSide = `M300 ${a + 8} L${300 + hw * 0.92} ${b - 2} Q${300 + hw * 0.5} ${b + 18} 300 ${b + 16} Z`;
    return `<path class="tree-hit" d="${d}" fill="${fill}" stroke="#123a2c" stroke-width="4" stroke-linejoin="round"/>
      <path d="${shadeSide}" fill="#0f2f24" opacity=".22" pointer-events="none"/>
      <path d="${snow}" stroke="#eef4fb" stroke-width="7" fill="none" stroke-linecap="round" opacity=".75" pointer-events="none"/>`;
  }).join('');

  let lights = '';
  let li = 0;
  const garlands = GARLANDS.map(([x1, y1, cx, cy, x2, y2, n]) => {
    for (let k = 1; k <= n; k++) {
      const t = k / (n + 1);
      const x = (1 - t) ** 2 * x1 + 2 * (1 - t) * t * cx + t * t * x2;
      const y = (1 - t) ** 2 * y1 + 2 * (1 - t) * t * cy + t * t * y2;
      const c = LIGHT_COLORS[li % LIGHT_COLORS.length];
      const delay = ((li * 0.73) % 3.2).toFixed(2);
      const dur = (2.4 + ((li * 0.37) % 1.6)).toFixed(2);
      lights += `<circle class="light" cx="${x.toFixed(1)}" cy="${(y + 5).toFixed(1)}" r="8" style="--c:${c};--d:${delay}s;--t:${dur}s"/>`;
      li++;
    }
    return `<path d="M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}" stroke="#e8b85a" stroke-width="4" fill="none" stroke-dasharray="1 9" stroke-linecap="round" opacity=".85" pointer-events="none"/>`;
  }).join('');

  return svg('0 0 600 720', '100%', '100%', `
    <ellipse cx="300" cy="700" rx="250" ry="16" fill="#000" opacity=".25"/>
    <rect x="272" y="612" width="56" height="70" rx="6" fill="#6b4428" stroke="${O}" stroke-width="4"/>
    <path d="M244 668 H356 L348 710 H252 Z" fill="#9e2f2a" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M244 676 H356" stroke="#f2c46d" stroke-width="5"/>
    ${tiers}
    <g pointer-events="none">${garlands}${lights}</g>
    <g class="tree-star" pointer-events="none">
      <circle class="star-halo" cx="300" cy="60" r="70" fill="url(#halo)"/>
      <path d="${starPath(300, 62, 46, 20)}" stroke-width="4" stroke-linejoin="round"/>
    </g>
    <defs><radialGradient id="halo"><stop offset="0" stop-color="#ffd770" stop-opacity=".75"/><stop offset="1" stop-color="#ffd770" stop-opacity="0"/></radialGradient></defs>
  `, 'class="tree-svg"');
}

// =========================================================
// BÁNH GỪNG — viewBox 0 0 200 240
// =========================================================
export function gingerSVG(w = '100%', h = '100%') {
  return svg('0 0 200 240', w, h, `
    <path d="M70 92 Q40 92 26 104 Q12 118 26 130 Q38 138 64 128 L66 160 Q46 196 44 210 Q42 228 60 228 Q74 228 84 206 L100 180 L116 206 Q126 228 140 228 Q158 228 156 210 Q154 196 134 160 L136 128 Q162 138 174 130 Q188 118 174 104 Q160 92 130 92 Z"
      fill="#c8814a" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
    <circle cx="100" cy="56" r="40" fill="#c8814a" stroke="${O}" stroke-width="5"/>
    <path d="M30 108 q6 6 0 12 M170 108 q-6 6 0 12 M56 206 q6 6 12 0 M132 206 q6 6 12 0" stroke="#fffdf8" stroke-width="4" fill="none" stroke-linecap="round"/>
    <circle cx="86" cy="50" r="5.5" fill="${O}"/><circle cx="114" cy="50" r="5.5" fill="${O}"/>
    <circle cx="88" cy="48" r="1.8" fill="#fff"/><circle cx="116" cy="48" r="1.8" fill="#fff"/>
    <ellipse cx="74" cy="66" rx="8" ry="5" fill="#e8a07a" opacity=".9"/><ellipse cx="126" cy="66" rx="8" ry="5" fill="#e8a07a" opacity=".9"/>
    <path d="M86 70 Q100 82 114 70" stroke="#fffdf8" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M86 98 L100 104 L86 110 Z M114 98 L100 104 L114 110 Z" fill="#2f7d5b" stroke="${O}" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="100" cy="124" r="7" fill="#d6423a" stroke="#fffdf8" stroke-width="3"/>
    <circle cx="100" cy="148" r="7" fill="#f2c46d" stroke="#fffdf8" stroke-width="3"/>`);
}

// =========================================================
// THẺ GAME Ở TRANG CHÍNH
// =========================================================
export function cardArt(name) {
  if (name === 'card-photobooth') {
    const back = `<g transform="rotate(-9 110 130)">
        <rect x="46" y="36" width="128" height="176" rx="14" fill="#9e2630" stroke="${O}" stroke-width="5"/>
        <rect x="56" y="46" width="108" height="156" rx="9" fill="none" stroke="#f2c46d" stroke-width="3"/>
        <path d="${starPath(110, 124, 30, 13)}" fill="#f2c46d" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
      </g>`;
    const front = `<g transform="rotate(7 200 130)">
        <rect x="132" y="28" width="140" height="190" rx="14" fill="#fdf3df" stroke="${O}" stroke-width="5"/>
        <rect x="142" y="38" width="120" height="170" rx="9" fill="#1d4532" stroke="#f2c46d" stroke-width="3"/>
        <circle cx="202" cy="118" r="52" fill="#ffcf7a" opacity=".22"/>
        <svg x="146" y="52" width="116" height="136" viewBox="0 0 460 540">${kidSVG('chef', 'girl').replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg>
        <rect x="158" y="184" width="88" height="14" rx="7" fill="#f2c46d" opacity=".85"/>
      </g>`;
    return svg('0 0 320 240', '100%', '100%', `${back}${front}
      ${sparkle(34, 40, 1.2)}${sparkle(292, 46, 0.9, '#fbe7b5')}${sparkle(296, 206, 0.7)}`);
  }
  if (name === 'card-tree') {
    return svg('0 0 320 240', '100%', '100%', `
      <path d="M160 34 L230 140 Q160 156 90 140 Z" fill="#26684f" stroke="#123a2c" stroke-width="4" stroke-linejoin="round"/>
      <path d="M160 74 L252 196 Q160 214 68 196 Z" fill="#22604a" stroke="#123a2c" stroke-width="4" stroke-linejoin="round"/>
      <path d="M160 34 L230 140 Q160 156 90 140 Z" fill="#26684f" stroke="#123a2c" stroke-width="4" stroke-linejoin="round"/>
      <path d="${starPath(160, 32, 22, 10)}" fill="#ffd25e" stroke="${O}" stroke-width="3.5" stroke-linejoin="round"/>
      <circle cx="130" cy="120" r="9" fill="#d6423a" stroke="${O}" stroke-width="3"/>
      <circle cx="184" cy="104" r="8" fill="#f2c46d" stroke="${O}" stroke-width="3"/>
      <circle cx="110" cy="180" r="10" fill="#f2c46d" stroke="${O}" stroke-width="3"/>
      <circle cx="168" cy="168" r="10" fill="#d6423a" stroke="${O}" stroke-width="3"/>
      <circle cx="218" cy="184" r="9" fill="#fbe7b5" stroke="${O}" stroke-width="3"/>
      <svg x="34" y="168" width="64" height="64" viewBox="0 0 100 100">${giftInner('#d6423a', '#f2c46d', 1, 1.4)}</svg>
      <svg x="222" y="176" width="56" height="56" viewBox="0 0 100 100">${giftInner('#f2c46d', '#d6423a', 1, 1.4)}</svg>
      ${sparkle(258, 60, 1)}${sparkle(60, 80, 0.8, '#fbe7b5')}`);
  }
  // card-oven
  return svg('0 0 320 240', '100%', '100%', `
    <rect x="40" y="40" width="200" height="180" rx="20" fill="#4f7a52" stroke="${O}" stroke-width="5"/>
    <rect x="40" y="40" width="200" height="40" rx="20" fill="#3d6342" stroke="${O}" stroke-width="5"/>
    <circle cx="80" cy="60" r="9" fill="#3b2414"/><circle cx="110" cy="60" r="9" fill="#3b2414"/>
    <rect x="160" y="52" width="56" height="16" rx="5" fill="#10291f"/>
    <rect x="62" y="98" width="156" height="100" rx="14" fill="#ff9a4d" stroke="${O}" stroke-width="5"/>
    <rect x="70" y="106" width="140" height="84" rx="10" fill="#ffc27a" opacity=".55"/>
    <rect x="96" y="88" width="88" height="10" rx="5" fill="#d9a441" stroke="${O}" stroke-width="3"/>
    <svg x="186" y="96" width="120" height="144" viewBox="0 0 200 240">${gingerSVG().replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg>
    ${sparkle(282, 70, 1.1)}${sparkle(28, 30, 0.8, '#fbe7b5')}`);
}

// =========================================================
// VIỀN NOEL CHO ẢNH 1600x1200
// =========================================================
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
const holly = (x, y, rot, s = 1) => `
  <g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    <path d="M0 0 Q10 -18 20 -10 Q30 -24 40 -12 Q52 -26 60 -10 Q72 -20 84 0 Q72 20 60 10 Q52 26 40 12 Q30 24 20 10 Q10 18 0 0Z" fill="#2f7d5b" stroke="#173f2e" stroke-width="3"/>
    <path d="M4 0 H78" stroke="#173f2e" stroke-width="2.5"/>
  </g>`;
const hollyCluster = (x, y, flip = 1) => `
  ${holly(x, y, flip > 0 ? -30 : 210, 1.25)}${holly(x, y, flip > 0 ? -95 : 275, 1.15)}${holly(x, y, flip > 0 ? 25 : 155, 1.05)}
  <circle cx="${x - 4}" cy="${y - 6}" r="13" fill="#d6423a" stroke="#7a1f1a" stroke-width="3"/>
  <circle cx="${x + 16}" cy="${y + 6}" r="12" fill="#d6423a" stroke="#7a1f1a" stroke-width="3"/>
  <circle cx="${x - 8}" cy="${y + 16}" r="11" fill="#d6423a" stroke="#7a1f1a" stroke-width="3"/>
  <circle cx="${x - 8}" cy="${y - 10}" r="4" fill="#fff" opacity=".6"/>`;
const flake = (x, y, s, o = 0.7) => `
  <g transform="translate(${x} ${y}) scale(${s})" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity="${o}">
    <path d="M0 -12 V12 M-10.4 -6 L10.4 6 M-10.4 6 L10.4 -6 M-3 -9 L0 -6 L3 -9 M-3 9 L0 6 L3 9"/>
  </g>`;

export function frameSVG() {
  const r = rng(20261225);
  const greens = ['#1f5a43', '#24684d', '#2f7d5b', '#163f30', '#2b7055'];
  let needles = '', lights = '', baubles = '';
  const swags = [[-30, 34, 400, 196, 800, 58], [800, 58, 1200, 196, 1630, 34]];
  const at = ([x1, y1, cx, cy, x2, y2], t) => [
    (1 - t) ** 2 * x1 + 2 * (1 - t) * t * cx + t * t * x2,
    (1 - t) ** 2 * y1 + 2 * (1 - t) * t * cy + t * t * y2,
  ];
  swags.forEach((sw, si) => {
    for (let i = 0; i <= 80; i++) {
      const [x, y] = at(sw, i / 80);
      for (let k = 0; k < 4; k++) {
        const ang = Math.round(r() * 360);
        needles += `<ellipse cx="${(x + (r() - 0.5) * 22).toFixed(0)}" cy="${(y + (r() - 0.5) * 18).toFixed(0)}" rx="${(18 + r() * 10).toFixed(0)}" ry="6" transform="rotate(${ang} ${x.toFixed(0)} ${y.toFixed(0)})" fill="${greens[Math.floor(r() * greens.length)]}"/>`;
      }
    }
    for (let i = 1; i < 10; i++) {
      const [x, y] = at(sw, i / 10);
      lights += `<circle cx="${x.toFixed(0)}" cy="${(y + 6).toFixed(0)}" r="16" fill="#ffcf7a" opacity=".28"/><circle cx="${x.toFixed(0)}" cy="${(y + 6).toFixed(0)}" r="6.5" fill="#fff1c4"/>`;
    }
    [0.22, 0.5, 0.78].forEach((t, bi) => {
      const [x, y] = at(sw, t);
      const len = 40 + ((bi + si) % 2) * 34;
      const rad = 22 + ((bi + si) % 3) * 3;
      const col = (bi + si) % 2 ? '#f2c46d' : '#d6423a';
      baubles += `<path d="M${x.toFixed(0)} ${y.toFixed(0)} V${(y + len).toFixed(0)}" stroke="#d9a441" stroke-width="3"/>
        <rect x="${(x - 8).toFixed(0)}" y="${(y + len - 4).toFixed(0)}" width="16" height="10" rx="2" fill="#d9a441"/>
        <circle cx="${x.toFixed(0)}" cy="${(y + len + rad + 2).toFixed(0)}" r="${rad}" fill="${col}" stroke="${O}" stroke-width="3"/>
        <ellipse cx="${(x - rad * 0.35).toFixed(0)}" cy="${(y + len + rad * 0.7).toFixed(0)}" rx="5" ry="8" transform="rotate(30 ${(x - rad * 0.35).toFixed(0)} ${(y + len + rad * 0.7).toFixed(0)})" fill="#fff" opacity=".5"/>`;
    });
  });
  const bow = `<g transform="translate(800 70)">
    <path d="M0 0 C-40 -46 -92 -30 -70 6 C-60 22 -30 16 0 0Z" fill="#d6423a" stroke="#7a1f1a" stroke-width="4"/>
    <path d="M0 0 C40 -46 92 -30 70 6 C60 22 30 16 0 0Z" fill="#d6423a" stroke="#7a1f1a" stroke-width="4"/>
    <path d="M-6 6 L-34 74 L-16 66 L-6 86 L4 10Z" fill="#c43a33" stroke="#7a1f1a" stroke-width="4" stroke-linejoin="round"/>
    <path d="M6 6 L34 74 L16 66 L6 86 L-4 10Z" fill="#c43a33" stroke="#7a1f1a" stroke-width="4" stroke-linejoin="round"/>
    <circle r="16" fill="#e0524a" stroke="#7a1f1a" stroke-width="4"/>
  </g>`;
  const flakes = [[70, 330, 1.4], [44, 520, 1], [92, 700, 1.6], [56, 880, 1.1], [1530, 340, 1.2], [1556, 540, 1.6], [1510, 720, 1], [1548, 900, 1.3], [210, 1150, 0.9], [1390, 1150, 0.9]]
    .map(([x, y, s]) => flake(x, y, s)).join('');
  const mask = 'M0 0H1600V1200H0Z M44 14 H1556 A30 30 0 0 1 1586 44 V1156 A30 30 0 0 1 1556 1186 H44 A30 30 0 0 1 14 1156 V44 A30 30 0 0 1 44 14Z';
  return svg('0 0 1600 1200', 1600, 1200, `
    <path d="${mask}" fill="#7a1d26" fill-rule="evenodd"/>
    <rect x="14" y="14" width="1572" height="1172" rx="30" fill="none" stroke="#f2c46d" stroke-width="8"/>
    <rect x="32" y="32" width="1536" height="1136" rx="20" fill="none" stroke="#fbe7b5" stroke-width="2" opacity=".75"/>
    ${flakes}
    <g>${needles}</g>${lights}${baubles}${bow}
    ${hollyCluster(96, 1100, 1)}${hollyCluster(1504, 1100, -1)}`);
}

// =========================================================
// Tiện ích: SVG → Image (để vẽ lên canvas)
// =========================================================
export function svgToImage(str) {
  return loadImage('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(str));
}
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
