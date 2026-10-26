// The landing hallway: a white L-shaped corridor the camera walks down as you
// scroll, passing framed works (with museum labels) and ending at a title card.
// Loaded only on the landing page, only on wide screens with motion allowed.
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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
  wash: HTMLElement;
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

const COLOR = {
  wall: 0xf3f0ea,
  floor: 0xe6e1d8,
  ceiling: 0xf7f5f1,
  ink: 0x161616,
};

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

async function titleCardTexture(title: string, subtitle: string, tagline: string) {
  await Promise.all([
    document.fonts.load('400 160px "Instrument Serif"'),
    document.fonts.load('italic 400 64px "Instrument Serif"'),
    document.fonts.load('400 30px "IBM Plex Mono"'),
  ]);
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1536;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#f3f0ea';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Wrap the title onto as many lines as it needs.
  ctx.font = '400 168px "Instrument Serif"';
  const lines: string[] = [];
  for (const word of title.split(' ')) {
    const last = lines[lines.length - 1];
    if (last && ctx.measureText(`${last} ${word}`).width < 1700) lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  }
  const lineHeight = 160;
  const top = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2 - 90;
  ctx.fillStyle = '#161616';
  lines.forEach((line, i) => ctx.fillText(line, canvas.width / 2, top + i * lineHeight));

  const below = top + (lines.length - 1) * lineHeight;
  ctx.font = 'italic 400 64px "Instrument Serif"';
  ctx.fillText(subtitle, canvas.width / 2, below + 150);
  ctx.font = '400 30px "IBM Plex Mono"';
  ctx.fillStyle = '#6b675f';
  ctx.fillText(tagline, canvas.width / 2, below + 250);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export async function createHallway(opts: Options) {
  const { section, canvas, labels, hero, wash, frames, onProgress } = opts;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(COLOR.wall);
  scene.fog = new THREE.Fog(COLOR.wall, 10, 36);

  const camera = new THREE.PerspectiveCamera(55, 1, 0.05, 80);

  // --- Lights: soft overall fill plus pools of light along the ceiling ---
  scene.add(new THREE.HemisphereLight(0xffffff, 0xf1ece4, 3.1));
  for (const [x, z] of [
    [0, -3],
    [0, -11],
    [0, -19],
    [0, -27],
    [7, B_MID],
    [13, B_MID],
  ]) {
    const light = new THREE.PointLight(0xfff4e6, 4, 8, 1.6);
    light.position.set(x, HEIGHT - 0.3, z);
    scene.add(light);
  }

  // --- The corridor ---
  const wallMat = new THREE.MeshStandardMaterial({ color: COLOR.wall, roughness: 1 });
  const floorMat = new THREE.MeshStandardMaterial({ color: COLOR.floor, roughness: 0.85 });
  const ceilingMat = new THREE.MeshStandardMaterial({ color: COLOR.ceiling, roughness: 1 });
  const lampMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  const aLength = A_START - A_END;
  const aCenter = (A_START + A_END) / 2;
  const bLength = B_END - WIDTH / 2;
  const bCenter = (B_END + WIDTH / 2) / 2;

  const add = (mesh: THREE.Mesh, x: number, y: number, z: number, rx = 0, ry = 0) => {
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, 0);
    scene.add(mesh);
  };

  add(plane(WIDTH, aLength, floorMat), 0, 0, aCenter, -Math.PI / 2);
  add(plane(bLength, WIDTH, floorMat), bCenter, 0, B_MID, -Math.PI / 2);
  add(plane(WIDTH, aLength, ceilingMat), 0, HEIGHT, aCenter, Math.PI / 2);
  add(plane(bLength, WIDTH, ceilingMat), bCenter, HEIGHT, B_MID, Math.PI / 2);

  add(plane(aLength, HEIGHT, wallMat), -WIDTH / 2, HEIGHT / 2, aCenter, 0, Math.PI / 2); // A left
  add(plane(A_START - B_NEAR, HEIGHT, wallMat), WIDTH / 2, HEIGHT / 2, (A_START + B_NEAR) / 2, 0, -Math.PI / 2); // A right
  add(plane(B_END + WIDTH / 2, HEIGHT, wallMat), (B_END - WIDTH / 2) / 2, HEIGHT / 2, A_END, 0, 0); // B back
  add(plane(bLength, HEIGHT, wallMat), bCenter, HEIGHT / 2, B_NEAR, 0, Math.PI); // B near
  add(plane(WIDTH, HEIGHT, wallMat), B_END, HEIGHT / 2, B_MID, 0, -Math.PI / 2); // end wall

  // Ceiling light panels
  for (let z = A_START - 3; z > A_END + 2; z -= 4) add(plane(0.5, 2, lampMat), 0, HEIGHT - 0.01, z, Math.PI / 2);
  for (let x = 4; x < B_END - 1; x += 4) add(plane(2, 0.5, lampMat), x, HEIGHT - 0.01, B_MID, Math.PI / 2);

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
    titleCardTexture(opts.title, opts.subtitle, opts.tagline).finally(tick),
  ]);

  const frameMat = new THREE.MeshStandardMaterial({ color: COLOR.ink, roughness: 0.6 });
  const anisotropy = renderer.capabilities.getMaxAnisotropy();

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
      picture = plane(w, h, new THREE.MeshBasicMaterial({ color: 0xd6d2ca }));
    }
    picture.position.z = 0.03;
    group.add(picture);

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
  const cardFace = plane(cardW, cardH, new THREE.MeshBasicMaterial({ map: cardTexture }));
  cardFace.position.z = 0.03;
  card.add(cardFace);
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
      new THREE.Vector3(B_END - 1.05, EYE, B_MID),
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

    hung.forEach((frame, i) => {
      const el = labels[i];
      if (!el) return;
      const d = camera.position.distanceTo(frame.center);
      const inFront = toFrame.subVectors(frame.center, camera.position).dot(facing) > 0;
      const opacity = inFront ? smoothstep(7.5, 5.5, d) * smoothstep(2.2, 3.1, d) : 0;
      el.style.opacity = opacity.toFixed(3);
      if (opacity === 0) return;
      projected.copy(frame.anchor).project(camera);
      const x = ((projected.x + 1) / 2) * width;
      const y = ((1 - projected.y) / 2) * height;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(${frame.alignEnd ? '-100%' : '0'}, -100%)`;
    });

    renderer.render(scene, camera);
  }

  const state = { t: 0 };

  function resize() {
    width = section.clientWidth;
    height = section.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
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
    .to(wash, { opacity: 1, duration: 0.05, ease: 'none' }, 0.95);

  return { render: () => render(state.t) };
}
