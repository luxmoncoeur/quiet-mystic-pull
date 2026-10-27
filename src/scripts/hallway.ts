// The landing hallway: a white L-shaped corridor the camera walks down as you
// scroll, passing framed works (with museum labels) and ending at a title card.
// Loaded only on the landing page, only on wide screens with motion allowed.
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { splitAccent } from '../lib/accent';

gsap.registerPlugin(ScrollTrigger);

export interface Frame {
  src: string;
  number: string;
  title: string;
  part: string;
  date?: string;
  medium: string;
}

interface Options {
  section: HTMLElement;
  canvas: HTMLCanvasElement;
  labels: HTMLElement[];
  hero: HTMLElement;
  finale: HTMLElement; // full-screen title card shown at the end of the walk
  frames: Frame[];
  title: string;
  subtitle: string;
  tagline: string;
  onProgress: (fraction: number) => void;
}

// Corridor A runs from the entrance down -z; corridor B turns right and runs +x
// to the end wall where the title card hangs.
const WIDTH = 4;
const HEIGHT = 3.2;
const EYE = 1.6;
const A_START = 4;
const A_END = -32; // back wall of the corner (z)
const B_NEAR = -28; // near wall of corridor B (z)
const B_END = 16; // end wall (x)
const B_MID = (A_END + B_NEAR) / 2;

// Colors come from the site palette (CSS variables), so the hallway follows
// the light / dark theme: walls and ceiling are `surface`, the floor is
// `border`, the fog fades into `bg`, and frames are `ink`.
type Palette = Record<'bg' | 'surface' | 'border' | 'ink' | 'muted' | 'accent', string>;

function readPalette(): Palette {
  const css = getComputedStyle(document.documentElement);
  const get = (name: string) => css.getPropertyValue(`--${name}`).trim();
  return {
    bg: get('bg'),
    surface: get('surface'),
    border: get('border'),
    ink: get('ink'),
    muted: get('muted'),
    accent: get('accent'),
  };
}

type Side = 'left' | 'right' | 'back';

// Wall slots in walking order: alternate sides down corridor A, then the back wall of B.
const SLOTS: { side: Side; along: number }[] = [
  { side: 'left', along: -5 },
  { side: 'right', along: -9 },
  { side: 'left', along: -13 },
  { side: 'right', along: -17 },
  { side: 'left', along: -21 },
  { side: 'right', along: -25 },
  { side: 'back', along: 0 }, // end of corridor A, seen all the way down
  { side: 'back', along: 9 },
];

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

function wallTransform(side: Side, along: number) {
  const inset = 0.02;
  if (side === 'left') return { pos: new THREE.Vector3(-WIDTH / 2 + inset, 0, along), rotY: Math.PI / 2 };
  if (side === 'right') return { pos: new THREE.Vector3(WIDTH / 2 - inset, 0, along), rotY: -Math.PI / 2 };
  return { pos: new THREE.Vector3(along, 0, A_END + inset), rotY: 0 };
}

function plane(w: number, h: number, material: THREE.Material) {
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
}

// --- Procedural textures (drawn in code, nothing extra to download) ---

// A seeded random so the marble looks the same on every visit.
function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

// One square marble floor tile: soft grey clouds, dark branching veins, and a
// faint grout line on its edges (which also hides the seams when it repeats).
function marbleTexture(anisotropy: number) {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const rand = seeded(7);

  ctx.fillStyle = '#ecebea';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 40; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 80 + rand() * 260;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(170,170,174,${0.05 + rand() * 0.08})`);
    g.addColorStop(1, 'rgba(170,170,174,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }

  // Veins: long, gently curving strokes (smoothed through midpoints) that
  // occasionally branch; each gets a soft blurred halo.
  const vein = (x: number, y: number, angle: number, width: number, steps: number, depth: number) => {
    const points: [number, number][] = [[x, y]];
    for (let i = 0; i < steps; i++) {
      angle += (rand() - 0.5) * 0.45;
      x += Math.cos(angle) * 22;
      y += Math.sin(angle) * 22;
      points.push([x, y]);
      if (depth < 2 && rand() < 0.04) vein(x, y, angle + (rand() < 0.5 ? -1 : 1) * (0.5 + rand()), width * 0.6, steps / 2.5, depth + 1);
    }
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length - 1; i++) {
      const [px, py] = points[i];
      const [nx, ny] = points[i + 1];
      ctx.quadraticCurveTo(px, py, (px + nx) / 2, (py + ny) / 2);
    }
    ctx.lineWidth = width;
    ctx.stroke();
  };
  ctx.lineCap = ctx.lineJoin = 'round';
  // Faint, wide veins first, then the sharper dark ones on top.
  ctx.filter = 'blur(2.5px)';
  for (let i = 0; i < 14; i++) {
    ctx.strokeStyle = `rgba(110,110,118,${0.12 + rand() * 0.12})`;
    vein(rand() * size, rand() * size, rand() * Math.PI * 2, 2 + rand() * 4, 60, 1);
  }
  ctx.filter = 'blur(0.6px)';
  for (let i = 0; i < 7; i++) {
    ctx.strokeStyle = `rgba(52,52,60,${0.4 + rand() * 0.35})`;
    vein(rand() * size, rand() * size, rand() * Math.PI * 2, 0.9 + rand() * 1.4, 55, 0);
  }
  ctx.filter = 'none';

  ctx.strokeStyle = 'rgba(120,120,126,0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = anisotropy;
  return texture;
}

// Fine plaster grain for the walls (very subtle; it just stops them looking flat).
function plasterTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(size, size);
  const rand = seeded(3);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 236 + rand() * 19;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// The pool of light a picture lamp throws down the wall: bright under the lamp,
// spreading and fading toward the floor.
function glowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  // An ellipse stretched 4× downward that fits inside the canvas, so the pool
  // fades out on every side instead of ending in hard edges.
  ctx.translate(128, 0);
  ctx.scale(1, 4);
  const g = ctx.createRadialGradient(0, 6, 0, 0, 6, 122);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.3, 'rgba(255,255,255,0.6)');
  g.addColorStop(0.7, 'rgba(255,255,255,0.15)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(-128, 0, 256, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}


async function titleCardTexture(title: string, subtitle: string, tagline: string, color: Palette) {
  await Promise.all([
    document.fonts.load('400 160px "Instrument Serif"'),
    document.fonts.load('italic 400 64px "Instrument Serif"'),
    document.fonts.load('400 30px "IBM Plex Mono"'),
  ]);
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1536;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = color.surface;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Wrap the title onto as many lines as it needs; the *marked* word is drawn
  // in the accent color, like on the page.
  ctx.font = '400 168px "Instrument Serif"';
  type Word = { text: string; accent: boolean; attached?: boolean };
  const toWords = (text: string): Word[] => text.split(' ').filter(Boolean).map((t) => ({ text: t, accent: false }));
  const { before, accent, after } = splitAccent(title);
  // Punctuation right after the marked word ("Becoming?") stays attached to it.
  const tail = after.match(/^\S+/)?.[0] ?? '';
  const words: Word[] = [
    ...toWords(before),
    ...(accent ? [{ text: accent, accent: true }] : []),
    ...(tail ? [{ text: tail, accent: false, attached: true }] : []),
    ...toWords(after.slice(tail.length)),
  ];

  const space = ctx.measureText(' ').width;
  const widthOf = (line: Word[]) =>
    line.reduce((sum, w, i) => sum + ctx.measureText(w.text).width + (i && !w.attached ? space : 0), 0);
  const lines: Word[][] = [];
  for (const word of words) {
    const last = lines[lines.length - 1];
    if (last && (word.attached || widthOf([...last, word]) < 1700)) last.push(word);
    else lines.push([word]);
  }

  const lineHeight = 160;
  const top = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2 - 90;
  ctx.textAlign = 'left';
  lines.forEach((line, i) => {
    let x = (canvas.width - widthOf(line)) / 2;
    line.forEach((w, j) => {
      if (j && !w.attached) x += space;
      ctx.fillStyle = w.accent ? color.accent : color.ink;
      ctx.fillText(w.text, x, top + i * lineHeight);
      x += ctx.measureText(w.text).width;
    });
  });
  ctx.textAlign = 'center';
  ctx.fillStyle = color.ink;

  const below = top + (lines.length - 1) * lineHeight;
  ctx.font = 'italic 400 64px "Instrument Serif"';
  ctx.fillText(subtitle, canvas.width / 2, below + 150);
  ctx.font = '400 30px "IBM Plex Mono"';
  ctx.fillStyle = color.muted;
  ctx.fillText(tagline, canvas.width / 2, below + 250);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export async function createHallway(opts: Options) {
  const { section, canvas, labels, hero, finale, frames, onProgress } = opts;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });

  const scene = new THREE.Scene();
  const background = new THREE.Color();
  const fog = new THREE.Fog(0, 10, 36);
  scene.background = background;
  scene.fog = fog;

  const camera = new THREE.PerspectiveCamera(55, 1, 0.05, 80);

  // --- Lights: a soft fill, a few warm lights down the corridor; the picture
  // lamps (below) add the bright pools on the walls ---
  const ambient = new THREE.HemisphereLight(0xffffff, 0xffffff, 2.2);
  scene.add(ambient);
  for (const [x, z] of [
    [0, -6],
    [0, -18],
    [0, -28],
    [9, B_MID],
  ]) {
    const light = new THREE.PointLight(0xfff1de, 3, 10, 1.6);
    light.position.set(x, HEIGHT - 0.3, z);
    scene.add(light);
  }

  // --- The corridor: plaster walls, a marble floor, a dark ceiling ---
  const anisotropy = renderer.capabilities.getMaxAnisotropy();
  const TILE = 2; // marble tile size (m)
  const marble = marbleTexture(anisotropy);
  const plaster = plasterTexture();
  const wallMat = new THREE.MeshStandardMaterial({ roughness: 0.95, map: plaster });
  const floorMat = new THREE.MeshStandardMaterial({ roughness: 0.32, metalness: 0.05, map: marble });
  const ceilingMat = new THREE.MeshStandardMaterial({ roughness: 1, color: 0x121012 });
  const fixtureMat = new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0.4, color: 0x141214 });
  const baseboardMat = new THREE.MeshStandardMaterial({ roughness: 0.7 });
  const lampMat = new THREE.MeshBasicMaterial({ color: 0xfff6e8 });
  const glow = glowTexture();
  const glowMat = new THREE.MeshBasicMaterial({
    map: glow,
    color: 0xfff0d8,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  // Texture repeats follow each surface's size, so tiles and grain keep their scale.
  const tiled = (texture: THREE.Texture, w: number, h: number, unit: number) => {
    const t = texture.clone();
    t.repeat.set(w / unit, h / unit);
    t.needsUpdate = true;
    return t;
  };
  const floorPlane = (w: number, h: number) =>
    plane(w, h, Object.assign(floorMat.clone(), { map: tiled(marble, w, h, TILE) }));
  const wallPlane = (w: number, h: number) =>
    plane(w, h, Object.assign(wallMat.clone(), { map: tiled(plaster, w, h, 1.5) }));
  const floors: THREE.Mesh[] = [];
  const walls: THREE.Mesh[] = [];

  const aLength = A_START - A_END;
  const aCenter = (A_START + A_END) / 2;
  const bLength = B_END - WIDTH / 2;
  const bCenter = (B_END + WIDTH / 2) / 2;

  const add = (mesh: THREE.Mesh, x: number, y: number, z: number, rx = 0, ry = 0) => {
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, 0);
    scene.add(mesh);
  };

  const addFloor = (w: number, h: number, x: number, z: number) => {
    const mesh = floorPlane(w, h);
    floors.push(mesh);
    add(mesh, x, 0, z, -Math.PI / 2);
  };
  addFloor(WIDTH, aLength, 0, aCenter);
  addFloor(bLength, WIDTH, bCenter, B_MID);
  add(plane(WIDTH, aLength, ceilingMat), 0, HEIGHT, aCenter, Math.PI / 2);
  add(plane(bLength, WIDTH, ceilingMat), bCenter, HEIGHT, B_MID, Math.PI / 2);

  // Walls, each with a baseboard along its foot.
  const BASE_H = 0.14;
  const addWall = (length: number, x: number, z: number, ry: number) => {
    const wall = wallPlane(length, HEIGHT);
    walls.push(wall);
    add(wall, x, HEIGHT / 2, z, 0, ry);
    const base = new THREE.Mesh(new THREE.BoxGeometry(length, BASE_H, 0.03), baseboardMat);
    base.position.set(x, BASE_H / 2, z);
    base.rotation.y = ry;
    base.translateZ(0.015);
    scene.add(base);
  };
  addWall(aLength, -WIDTH / 2, aCenter, Math.PI / 2); // A left
  addWall(A_START - B_NEAR, WIDTH / 2, (A_START + B_NEAR) / 2, -Math.PI / 2); // A right
  addWall(B_END + WIDTH / 2, (B_END - WIDTH / 2) / 2, A_END, 0); // B back
  addWall(bLength, bCenter, B_NEAR, Math.PI); // B near
  addWall(WIDTH, B_END, B_MID, -Math.PI / 2); // end wall

  // A dark track rail down the middle of the ceiling.
  const rail = (length: number, x: number, z: number, alongX: boolean) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(alongX ? length : 0.06, 0.05, alongX ? 0.06 : length), fixtureMat);
    mesh.position.set(x, HEIGHT - 0.12, z);
    scene.add(mesh);
  };
  rail(aLength - 2, 0, aCenter, false);
  rail(bLength - 2, bCenter, B_MID, true);

  // A picture lamp above a frame (in the frame's own space): a dark bar on two
  // arms, its lit underside, and the pool of light it throws down the wall.
  const pictureLamp = (group: THREE.Group, w: number, h: number) => {
    const barW = Math.max(0.5, w * 0.45);
    const y = h / 2 + 0.3;
    const bar = new THREE.Mesh(new THREE.BoxGeometry(barW, 0.05, 0.07), fixtureMat);
    bar.position.set(0, y, 0.26);
    group.add(bar);
    const lit = plane(barW * 0.92, 0.04, lampMat);
    lit.rotation.x = Math.PI / 2;
    lit.position.set(0, y - 0.026, 0.26);
    group.add(lit);
    for (const side of [-1, 1]) {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.025, 0.26), fixtureMat);
      arm.position.set((side * barW) / 3, y + 0.02, 0.13);
      group.add(arm);
    }
    const pool = plane(w + 1.3, h + 1.6, glowMat);
    pool.position.set(0, y - (h + 1.6) / 2 + 0.05, -0.012);
    group.add(pool);
  };


  // --- Load every texture; this drives the loader's percentage ---
  const manager = new THREE.LoadingManager();
  const loader = new THREE.TextureLoader(manager);
  const shown = frames.slice(0, SLOTS.length);
  let loaded = 0;
  const total = shown.length + 1;
  const tick = () => onProgress(++loaded / total);

  const [textures, cardTexture] = await Promise.all([
    Promise.all(
      shown.map((f) =>
        loader
          .loadAsync(f.src)
          .catch(() => null)
          .finally(tick),
      ),
    ),
    titleCardTexture(opts.title, opts.subtitle, opts.tagline, readPalette()).finally(tick),
  ]);

  const frameMat = new THREE.MeshStandardMaterial({ roughness: 0.6 });
  const emptyMat = new THREE.MeshBasicMaterial();

  // --- Hang the frames ---
  const hung = shown.map((frame, i) => {
    const texture = textures[i];
    const slot = SLOTS[i];
    const image = texture?.image as { width: number; height: number } | undefined;
    const aspect = image ? image.width / image.height : 4 / 3;
    const maxW = 2.1;
    const maxH = 1.75;
    const w = Math.min(maxW, maxH * aspect);
    const h = w / aspect;

    const group = new THREE.Group();
    const border = new THREE.Mesh(new THREE.BoxGeometry(w + 0.12, h + 0.12, 0.05), frameMat);
    group.add(border);

    let picture: THREE.Mesh;
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = anisotropy;
      picture = plane(w, h, new THREE.MeshBasicMaterial({ map: texture }));
    } else {
      picture = plane(w, h, emptyMat);
    }
    picture.position.z = 0.03;
    group.add(picture);
    pictureLamp(group, w, h);

    const { pos, rotY } = wallTransform(slot.side, slot.along);
    group.position.set(pos.x, EYE + 0.05, pos.z);
    group.rotation.y = rotY;
    scene.add(group);

    // The label sits beside the frame on the side deeper into the corridor,
    // so it lands toward the middle of the screen.
    const deeper = slot.side === 'right' ? -1 : 1;
    const anchor = new THREE.Vector3(deeper * (w / 2 + 0.22), -h / 2, 0.03);
    group.updateMatrixWorld();
    return {
      center: group.getWorldPosition(new THREE.Vector3()),
      anchor: anchor.applyMatrix4(group.matrixWorld),
      alignEnd: slot.side === 'right',
    };
  });

  // --- The title card on the end wall ---
  const cardW = 3.6;
  const cardH = 2.7;
  const card = new THREE.Group();
  card.add(new THREE.Mesh(new THREE.BoxGeometry(cardW + 0.12, cardH + 0.12, 0.05), frameMat));
  // The card's paper, and its printed title on top. At the end of the walk the
  // printed title fades out as the big page title fades in, as if it lifts off the wall.
  const cardMat = new THREE.MeshBasicMaterial();
  const cardFace = plane(cardW, cardH, cardMat);
  cardFace.position.z = 0.03;
  card.add(cardFace);
  const cardTextMat = new THREE.MeshBasicMaterial({ map: cardTexture, transparent: true });
  const cardText = plane(cardW, cardH, cardTextMat);
  cardText.position.z = 0.032;
  card.add(cardText);
  pictureLamp(card, cardW, cardH);
  card.position.set(B_END - 0.03, EYE, B_MID);
  card.rotation.y = -Math.PI / 2;
  scene.add(card);
  const cardCenter = new THREE.Vector3(B_END, EYE, B_MID);

  // --- Camera path ---
  const path = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(0, EYE, A_START),
      new THREE.Vector3(0, EYE, -8),
      new THREE.Vector3(0, EYE, -20),
      new THREE.Vector3(0, EYE, -26.4),
      new THREE.Vector3(1.1, EYE, -29.2),
      new THREE.Vector3(4, EYE, B_MID),
      new THREE.Vector3(10, EYE, B_MID),
      new THREE.Vector3(B_END - 3.4, EYE, B_MID), // stops a few steps back, so the lit end wall frames the title
    ],
    false,
    'centripetal',
  );

  const look = new THREE.Vector3();
  const projected = new THREE.Vector3();
  const toFrame = new THREE.Vector3();
  const facing = new THREE.Vector3();
  let width = 0;
  let height = 0;

  function render(t: number) {
    path.getPointAt(t, camera.position);
    if (t < 0.94) path.getPointAt(t + 0.06, look);
    else look.copy(cardCenter);
    camera.lookAt(look);
    camera.updateMatrixWorld();
    camera.getWorldDirection(facing);

    const opacities = hung.map((frame) => {
      const d = camera.position.distanceTo(frame.center);
      const inFront = toFrame.subVectors(frame.center, camera.position).dot(facing) > 0;
      return inFront ? smoothstep(7.5, 5.5, d) * smoothstep(2.2, 3.1, d) : 0;
    });
    // Phones: one label at a time (the nearest frame's), as a caption near the bottom.
    const narrow = width < 768;
    const nearest = opacities.indexOf(Math.max(...opacities));

    hung.forEach((frame, i) => {
      const el = labels[i];
      if (!el) return;
      const opacity = narrow && i !== nearest ? 0 : opacities[i];
      el.style.opacity = opacity.toFixed(3);
      if (opacity === 0) return;
      if (narrow) {
        el.style.transform = `translate3d(16px, ${height - el.offsetHeight - 72}px, 0)`;
        return;
      }
      projected.copy(frame.anchor).project(camera);
      // Keep the whole label on screen.
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const margin = 12;
      let x = ((projected.x + 1) / 2) * width - (frame.alignEnd ? w : 0);
      let y = ((1 - projected.y) / 2) * height - h;
      x = Math.min(Math.max(x, margin), width - w - margin);
      y = Math.min(Math.max(y, 72), height - h - margin);
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });

    renderer.render(scene, camera);
  }

  const state = { t: 0 };

  function resize() {
    width = section.clientWidth;
    height = section.clientHeight;
    // Phones: a lower render resolution keeps it smooth and easy on the battery.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, width < 768 ? 1.25 : 1.75));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // On a tall, narrow screen widen the view so the walls (and frames) stay in
    // sight: keep about 50° across, up to 90° top to bottom.
    camera.fov =
      camera.aspect < 1
        ? Math.min(90, (2 * Math.atan(Math.tan((25 * Math.PI) / 180) / camera.aspect) * 180) / Math.PI)
        : 55;
    camera.updateProjectionMatrix();
    render(state.t);
  }
  resize();
  window.addEventListener('resize', resize);

  // --- Scroll: walk the path while the section is pinned ---
  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => `+=${window.innerHeight * 6}`,
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
    },
  });
  timeline
    .to(state, { t: 1, duration: 1, ease: 'none', onUpdate: () => render(state.t) }, 0)
    .to(hero, { autoAlpha: 0, y: -40, duration: 0.06, ease: 'power1.in' }, 0)
    // Near the card, its printed title hands over to the big page title, which holds.
    .to(cardTextMat, { opacity: 0, duration: 0.07, ease: 'power1.inOut', onUpdate: () => render(state.t) }, 0.88)
    .to(finale, { autoAlpha: 1, duration: 0.07, ease: 'power1.inOut' }, 0.88)
    .to({}, { duration: 0.12 }, 0.95);

  // Repaint in the current theme; runs now and whenever the nav toggle or the
  // system setting switches light / dark.
  let themeVersion = 0;
  async function applyTheme(redrawCard: boolean) {
    const version = ++themeVersion;
    const color = readPalette();
    background.set(color.bg);
    fog.color.set(color.bg);
    const dark = new THREE.Color(color.bg).getHSL({ h: 0, s: 0, l: 0 }).l < 0.5;
    ambient.groundColor.set(color.surface);
    ambient.intensity = dark ? 1.5 : 1.45;
    for (const wall of walls) (wall.material as THREE.MeshStandardMaterial).color.set(color.surface);
    // Light marble by day; the same marble, dimmed, at night.
    for (const floor of floors) (floor.material as THREE.MeshStandardMaterial).color.set(dark ? '#4a4447' : '#ffffff');
    baseboardMat.color.set(color.border);
    glowMat.opacity = dark ? 0.5 : 0.8;
    frameMat.color.set(color.ink);
    emptyMat.color.set(color.border);
    cardMat.color.set(color.surface);
    if (redrawCard) {
      const texture = await titleCardTexture(opts.title, opts.subtitle, opts.tagline, color);
      if (version !== themeVersion) return texture.dispose(); // a newer switch won
      cardTextMat.map?.dispose();
      cardTextMat.map = texture;
      cardTextMat.needsUpdate = true;
    }
    render(state.t);
  }
  applyTheme(false);
  window.addEventListener('themechange', () => applyTheme(true));

  return { render: () => render(state.t) };
}
