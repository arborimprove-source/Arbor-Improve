import {
  Badge,
  Goal,
  PlanType,
  Profile,
  TREE_LEVEL_NAMES,
  TREE_TYPES,
  TreeLevel,
  TreeState,
  TreeType,
  WeeklyEntry,
} from '../types';
import { calculatePostingStreak } from './calculations';
import { formatShortDate } from './dateUtils';

export type StoryCardTemplateId =
  | 'botanical-root'
  | 'emerald-harvest'
  | 'milestone-scroll'
  | 'quiet-consistency';

export interface StoryCardTemplate {
  id: StoryCardTemplateId;
  name: string;
  subtitle: string;
  isPaid: boolean;
  bgTop: string;
  bgBottom: string;
  accent: string;
  cardSurface: string;
  textPrimary: string;
  textMuted: string;
}

export const STORY_CARD_TEMPLATES: StoryCardTemplate[] = [
  {
    id: 'botanical-root',
    name: 'Botanical Root',
    subtitle: 'Obsidian ground & fresh botanical green spotlight',
    isPaid: false,
    bgTop: '#090b09',
    bgBottom: '#101310',
    accent: '#b6ed65',
    cardSurface: '#151915',
    textPrimary: '#f3f5f0',
    textMuted: '#a0a69e',
  },
  {
    id: 'emerald-harvest',
    name: 'Emerald Harvest',
    subtitle: 'Deep emerald canopy for weekly momentum',
    isPaid: true,
    bgTop: '#0a1c15',
    bgBottom: '#090b09',
    accent: '#20b889',
    cardSurface: '#112119',
    textPrimary: '#f3f5f0',
    textMuted: '#a0a69e',
  },
  {
    id: 'milestone-scroll',
    name: 'Milestone Scroll',
    subtitle: 'Warm olive amber & charcoal collector edition',
    isPaid: true,
    bgTop: '#16130e',
    bgBottom: '#090b09',
    accent: '#d7a85e',
    cardSurface: '#1c1812',
    textPrimary: '#f3f5f0',
    textMuted: '#b5aa98',
  },
  {
    id: 'quiet-consistency',
    name: 'Quiet Consistency',
    subtitle: 'Minimalist streak & reflection poster',
    isPaid: true,
    bgTop: '#101310',
    bgBottom: '#151915',
    accent: '#b6ed65',
    cardSurface: '#1a201a',
    textPrimary: '#f3f5f0',
    textMuted: '#a0a69e',
  },
];

export const STORY_REFLECTION_PRESETS = [
  'Slow roots grow the strongest trees. Showing up with barakah.',
  'Consistent weekly creation, zero comparison.',
  "Alhamdulillah for steady steps and a growing community.",
  'Every beneficial post waters the garden.',
] as const;

export const STORY_CAPTION_MAX_LENGTH = 90;

export interface StoryCardVisibility {
  showFollowers: boolean;
  showReach: boolean;
  showStreak: boolean;
}

export interface StoryCardPayload {
  template: StoryCardTemplate;
  creatorName: string;
  treeType: TreeType;
  treeName: string;
  level: TreeLevel;
  levelName: string;
  isThirsty: boolean;
  growthPoints: number;
  followers: number | null;
  weeklyReach: number | null;
  streakWeeks: number;
  badgesCount: number;
  activeGoalTitle: string | null;
  weekLabel: string;
  note: string;
}

export function isStoryTemplateUnlocked(
  templateId: StoryCardTemplateId,
  plan: PlanType
): boolean {
  const def = STORY_CARD_TEMPLATES.find((t) => t.id === templateId);
  if (!def) return false;
  return !def.isPaid || plan === 'paid';
}

export function getAccessibleStoryTemplate(
  templateId: StoryCardTemplateId,
  plan: PlanType
): StoryCardTemplate {
  const requested = STORY_CARD_TEMPLATES.find((t) => t.id === templateId);
  if (requested && (!requested.isPaid || plan === 'paid')) {
    return requested;
  }
  return STORY_CARD_TEMPLATES[0];
}

export function buildStoryCardPayload(params: {
  templateId: StoryCardTemplateId;
  profile: Profile;
  treeState: TreeState;
  entries: WeeklyEntry[];
  badges: Badge[];
  goals: Goal[];
  visibility: StoryCardVisibility;
  customNote: string;
}): StoryCardPayload {
  const template = getAccessibleStoryTemplate(params.templateId, params.profile.plan);
  const sorted = [...params.entries].sort((a, b) =>
    a.weekStart.localeCompare(b.weekStart)
  );
  const latest = sorted.length > 0 ? sorted[sorted.length - 1] : null;
  const treeDef =
    TREE_TYPES.find((t) => t.id === params.profile.treeType) ?? TREE_TYPES[0];
  const streakWeeks = calculatePostingStreak(sorted);
  const activeGoal = params.goals.find((g) => g.status === 'active') ?? null;

  const trimmedNote = params.customNote.trim().slice(0, STORY_CAPTION_MAX_LENGTH);
  const note = trimmedNote || STORY_REFLECTION_PRESETS[0];

  return {
    template,
    creatorName: params.profile.displayName,
    treeType: params.profile.treeType,
    treeName: treeDef.name,
    level: params.treeState.level,
    levelName: TREE_LEVEL_NAMES[params.treeState.level],
    isThirsty: params.treeState.isThirsty,
    growthPoints: params.treeState.growthPoints,
    followers:
      params.visibility.showFollowers && latest ? latest.followers : null,
    weeklyReach:
      params.visibility.showReach && latest ? latest.reach : null,
    streakWeeks: params.visibility.showStreak ? streakWeeks : 0,
    badgesCount: params.badges.length,
    activeGoalTitle: activeGoal ? activeGoal.title : null,
    weekLabel: latest ? `Week of ${formatShortDate(latest.weekStart)}` : 'Seed stage',
    note,
  };
}

export function buildInstagramCaption(payload: StoryCardPayload): string {
  const parts: string[] = [
    `Growing my ${payload.treeName} on Arbor Improve — Level ${payload.level} (${payload.levelName}).`,
  ];
  if (payload.streakWeeks > 0) {
    parts.push(
      `${payload.streakWeeks} ${
        payload.streakWeeks === 1 ? 'week' : 'weeks'
      } of steady showing up.`
    );
  }
  if (payload.followers !== null) {
    parts.push(`Grateful for ${payload.followers.toLocaleString()} followers.`);
  }
  parts.push(payload.note);
  return parts.join(' ');
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(/\s+/);
  let line = '';
  let cursorY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, cursorY);
      line = words[i];
      cursorY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, cursorY);
    cursorY += lineHeight;
  }
  return cursorY;
}

function drawTreeOnCanvas(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  groundY: number,
  payload: StoryCardPayload
) {
  const canopyMain = payload.isThirsty ? '#d7a85e' : '#20b889';
  const canopyDeep = payload.isThirsty ? '#784c1b' : '#0f5c44';
  const canopyLight = payload.isThirsty ? '#9c6626' : '#178c68';
  const oliveLeaf = payload.isThirsty ? '#e9c383' : '#b6ed65';
  const trunk = '#8c5323';

  // Ground shadow mound
  ctx.fillStyle = payload.isThirsty
    ? 'rgba(245, 158, 11, 0.16)'
    : 'rgba(255, 255, 255, 0.08)';
  ctx.beginPath();
  ctx.ellipse(centerX, groundY, 170, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  if (payload.level === 1) {
    // Seed base
    ctx.fillStyle = trunk;
    ctx.beginPath();
    ctx.ellipse(centerX, groundY - 8, 22, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    if (payload.treeType === 'datePalm') {
      ctx.strokeStyle = canopyMain;
      ctx.lineWidth = 11;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(centerX, groundY - 18);
      ctx.quadraticCurveTo(centerX + 8, groundY - 80, centerX + 4, groundY - 142);
      ctx.stroke();

      const blades = [
        { dx: -95, dy: 20, cy: -35, color: canopyMain },
        { dx: 95, dy: 16, cy: -35, color: canopyDeep },
        { dx: 18, dy: -75, cy: -50, color: oliveLeaf },
      ];
      for (const b of blades) {
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.moveTo(centerX + 4, groundY - 135);
        ctx.quadraticCurveTo(centerX + b.dx * 0.5, groundY - 135 + b.cy, centerX + b.dx, groundY - 135 + b.dy);
        ctx.quadraticCurveTo(centerX + b.dx * 0.4, groundY - 135 + b.cy * 0.3, centerX + 4, groundY - 125);
        ctx.closePath();
        ctx.fill();
      }
      return;
    }

    if (payload.treeType === 'pomegranate') {
      ctx.strokeStyle = trunk;
      ctx.lineWidth = 9;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(centerX, groundY - 16);
      ctx.lineTo(centerX - 24, groundY - 115);
      ctx.moveTo(centerX, groundY - 16);
      ctx.lineTo(centerX + 24, groundY - 115);
      ctx.stroke();

      ctx.fillStyle = canopyMain;
      ctx.beginPath();
      ctx.arc(centerX - 32, groundY - 124, 28, 0, Math.PI * 2);
      ctx.arc(centerX + 32, groundY - 126, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = canopyDeep;
      ctx.beginPath();
      ctx.arc(centerX, groundY - 146, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.arc(centerX, groundY - 154, 10, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (payload.treeType === 'fig') {
      ctx.strokeStyle = trunk;
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(centerX, groundY - 16);
      ctx.lineTo(centerX, groundY - 110);
      ctx.stroke();

      ctx.fillStyle = canopyMain;
      ctx.beginPath();
      ctx.ellipse(centerX - 44, groundY - 126, 44, 26, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = canopyDeep;
      ctx.beginPath();
      ctx.ellipse(centerX + 44, groundY - 126, 44, 26, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = canopyLight;
      ctx.beginPath();
      ctx.ellipse(centerX, groundY - 144, 32, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    // Olive seed sprout
    ctx.strokeStyle = canopyMain;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(centerX, groundY - 18);
    ctx.quadraticCurveTo(centerX - 10, groundY - 75, centerX, groundY - 130);
    ctx.stroke();

    ctx.fillStyle = canopyMain;
    ctx.beginPath();
    ctx.ellipse(centerX - 38, groundY - 122, 38, 16, -0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = canopyDeep;
    ctx.beginPath();
    ctx.ellipse(centerX + 38, groundY - 132, 38, 16, 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = oliveLeaf;
    ctx.beginPath();
    ctx.ellipse(centerX + 2, groundY - 160, 14, 28, 0.08, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (payload.level === 2) {
    if (payload.treeType === 'datePalm') {
      ctx.strokeStyle = trunk;
      ctx.lineWidth = 20;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(centerX - 6, groundY - 6);
      ctx.quadraticCurveTo(centerX - 10, groundY - 110, centerX + 10, groundY - 210);
      ctx.stroke();

      const crownX = centerX + 10;
      const crownY = groundY - 210;
      const fronds = [
        { dx: -130, dy: 28, cy: -36, color: canopyMain },
        { dx: 130, dy: 28, cy: -36, color: canopyMain },
        { dx: -105, dy: -55, cy: -78, color: canopyDeep },
        { dx: 105, dy: -55, cy: -78, color: canopyDeep },
        { dx: 12, dy: -108, cy: -72, color: oliveLeaf },
      ];
      for (const f of fronds) {
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.moveTo(crownX, crownY);
        ctx.quadraticCurveTo(crownX + f.dx * 0.55, crownY + f.cy, crownX + f.dx, crownY + f.dy);
        ctx.quadraticCurveTo(crownX + f.dx * 0.45, crownY + f.cy * 0.3, crownX, crownY + 10);
        ctx.closePath();
        ctx.fill();
      }
      return;
    }

    if (payload.treeType === 'pomegranate') {
      ctx.strokeStyle = trunk;
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(centerX, groundY - 6);
      ctx.lineTo(centerX, groundY - 135);
      ctx.moveTo(centerX, groundY - 105);
      ctx.lineTo(centerX - 52, groundY - 195);
      ctx.moveTo(centerX, groundY - 110);
      ctx.lineTo(centerX + 52, groundY - 195);
      ctx.stroke();

      ctx.fillStyle = canopyLight;
      ctx.beginPath();
      ctx.arc(centerX, groundY - 230, 62, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = canopyMain;
      ctx.beginPath();
      ctx.arc(centerX - 58, groundY - 195, 44, 0, Math.PI * 2);
      ctx.arc(centerX + 58, groundY - 195, 44, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.arc(centerX - 42, groundY - 198, 9, 0, Math.PI * 2);
      ctx.arc(centerX + 38, groundY - 220, 9, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (payload.treeType === 'fig') {
      ctx.strokeStyle = trunk;
      ctx.lineWidth = 22;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(centerX, groundY - 6);
      ctx.lineTo(centerX, groundY - 165);
      ctx.lineWidth = 14;
      ctx.moveTo(centerX, groundY - 115);
      ctx.lineTo(centerX - 80, groundY - 175);
      ctx.moveTo(centerX, groundY - 122);
      ctx.lineTo(centerX + 80, groundY - 178);
      ctx.stroke();

      ctx.fillStyle = canopyLight;
      ctx.beginPath();
      ctx.ellipse(centerX, groundY - 210, 108, 54, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = canopyMain;
      ctx.beginPath();
      ctx.ellipse(centerX - 84, groundY - 182, 58, 36, 0, 0, Math.PI * 2);
      ctx.ellipse(centerX + 84, groundY - 182, 58, 36, 0, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    // Olive sapling
    ctx.strokeStyle = trunk;
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(centerX, groundY - 6);
    ctx.quadraticCurveTo(centerX - 10, groundY - 95, centerX, groundY - 190);
    ctx.stroke();

    ctx.fillStyle = canopyLight;
    ctx.beginPath();
    ctx.ellipse(centerX, groundY - 235, 76, 52, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = canopyMain;
    ctx.beginPath();
    ctx.ellipse(centerX - 58, groundY - 190, 50, 34, 0, 0, Math.PI * 2);
    ctx.ellipse(centerX + 58, groundY - 198, 50, 34, 0, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  // Levels 3-5
  if (payload.treeType === 'datePalm') {
    ctx.strokeStyle = trunk;
    ctx.lineWidth = 28;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(centerX - 10, groundY - 6);
    ctx.quadraticCurveTo(centerX - 18, groundY - 160, centerX + 18, groundY - 310);
    ctx.stroke();

    const crownX = centerX + 18;
    const crownY = groundY - 315;
    const fronds = [
      { dx: -175, dy: 48, cy: -45, color: canopyMain },
      { dx: 175, dy: 48, cy: -45, color: canopyMain },
      { dx: -165, dy: -22, cy: -85, color: canopyDeep },
      { dx: 165, dy: -22, cy: -85, color: canopyDeep },
      { dx: -105, dy: -98, cy: -110, color: canopyMain },
      { dx: 105, dy: -98, cy: -110, color: canopyMain },
      { dx: 18, dy: -138, cy: -90, color: canopyLight },
    ];
    for (const f of fronds) {
      ctx.fillStyle = f.color;
      ctx.beginPath();
      ctx.moveTo(crownX, crownY);
      ctx.quadraticCurveTo(crownX + f.dx * 0.55, crownY + f.cy, crownX + f.dx, crownY + f.dy);
      ctx.quadraticCurveTo(crownX + f.dx * 0.45, crownY + f.cy * 0.3, crownX, crownY + 12);
      ctx.closePath();
      ctx.fill();
    }

    if (payload.level >= 5) {
      ctx.fillStyle = '#d97706';
      for (const offset of [-32, -16, 26, 42]) {
        ctx.beginPath();
        ctx.arc(crownX + offset, crownY + 42, 11, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    return;
  }

  if (payload.treeType === 'pomegranate') {
    ctx.strokeStyle = trunk;
    ctx.lineWidth = 22;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(centerX, groundY - 6);
    ctx.lineTo(centerX, groundY - 180);
    ctx.lineWidth = 16;
    ctx.moveTo(centerX, groundY - 130);
    ctx.lineTo(centerX - 88, groundY - 245);
    ctx.moveTo(centerX, groundY - 135);
    ctx.lineTo(centerX + 88, groundY - 248);
    ctx.stroke();

    ctx.fillStyle = canopyLight;
    ctx.beginPath();
    ctx.arc(centerX, groundY - 305, 112, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = canopyMain;
    ctx.beginPath();
    ctx.arc(centerX - 108, groundY - 245, 78, 0, Math.PI * 2);
    ctx.arc(centerX + 108, groundY - 245, 78, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = canopyDeep;
    ctx.beginPath();
    ctx.arc(centerX, groundY - 295, 92, 0, Math.PI * 2);
    ctx.fill();

    if (payload.level >= 4) {
      const blossoms = [
        { x: centerX - 90, y: groundY - 280 },
        { x: centerX, y: groundY - 360 },
        { x: centerX + 88, y: groundY - 280 },
      ];
      for (const b of blossoms) {
        ctx.fillStyle = '#f8f7f4';
        ctx.beginPath();
        ctx.arc(b.x, b.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(b.x, b.y, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (payload.level >= 5) {
      const fruits = [
        { x: centerX - 102, y: groundY - 245 },
        { x: centerX - 36, y: groundY - 305 },
        { x: centerX + 46, y: groundY - 265 },
        { x: centerX + 102, y: groundY - 245 },
      ];
      for (const f of fruits) {
        ctx.fillStyle = '#e11d48';
        ctx.beginPath();
        ctx.arc(f.x, f.y, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f8f7f4';
        ctx.beginPath();
        ctx.arc(f.x - 4.5, f.y - 4.5, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    return;
  }

  if (payload.treeType === 'fig') {
    ctx.strokeStyle = trunk;
    ctx.lineWidth = 36;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(centerX, groundY - 6);
    ctx.lineTo(centerX, groundY - 200);
    ctx.lineWidth = 20;
    ctx.moveTo(centerX, groundY - 145);
    ctx.quadraticCurveTo(centerX - 75, groundY - 175, centerX - 142, groundY - 220);
    ctx.moveTo(centerX, groundY - 150);
    ctx.quadraticCurveTo(centerX + 75, groundY - 180, centerX + 142, groundY - 222);
    ctx.stroke();

    ctx.fillStyle = canopyLight;
    ctx.beginPath();
    ctx.ellipse(centerX, groundY - 285, 205, 102, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = canopyMain;
    ctx.beginPath();
    ctx.ellipse(centerX - 135, groundY - 238, 112, 68, 0, 0, Math.PI * 2);
    ctx.ellipse(centerX + 135, groundY - 240, 112, 68, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = canopyDeep;
    ctx.beginPath();
    ctx.ellipse(centerX, groundY - 300, 140, 82, 0, 0, Math.PI * 2);
    ctx.fill();

    if (payload.level >= 4) {
      for (const b of [
        { x: centerX - 110, y: groundY - 265 },
        { x: centerX, y: groundY - 345 },
        { x: centerX + 110, y: groundY - 265 },
      ]) {
        ctx.fillStyle = '#f8f7f4';
        ctx.beginPath();
        ctx.arc(b.x, b.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(b.x, b.y, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (payload.level >= 5) {
      const figs = [
        { x: centerX - 135, y: groundY - 232 },
        { x: centerX - 52, y: groundY - 280 },
        { x: centerX + 54, y: groundY - 260 },
        { x: centerX + 135, y: groundY - 235 },
      ];
      for (const f of figs) {
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.moveTo(f.x, f.y - 16);
        ctx.quadraticCurveTo(f.x - 14, f.y, f.x, f.y + 16);
        ctx.quadraticCurveTo(f.x + 14, f.y, f.x, f.y - 16);
        ctx.fill();
      }
    }
    return;
  }

  // Olive mature tree: gnarled S-trunk + elongated olives
  ctx.strokeStyle = trunk;
  ctx.lineWidth = 28;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(centerX, groundY - 6);
  ctx.quadraticCurveTo(centerX - 14, groundY - 110, centerX, groundY - 210);
  ctx.stroke();

  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.moveTo(centerX, groundY - 155);
  ctx.lineTo(centerX - 95, groundY - 245);
  ctx.moveTo(centerX, groundY - 165);
  ctx.lineTo(centerX + 95, groundY - 250);
  ctx.stroke();

  ctx.fillStyle = canopyLight;
  ctx.beginPath();
  ctx.ellipse(centerX, groundY - 295, 165, 98, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = canopyMain;
  ctx.beginPath();
  ctx.ellipse(centerX - 108, groundY - 245, 95, 68, 0, 0, Math.PI * 2);
  ctx.ellipse(centerX + 108, groundY - 248, 95, 68, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = canopyDeep;
  ctx.beginPath();
  ctx.ellipse(centerX, groundY - 310, 122, 78, 0, 0, Math.PI * 2);
  ctx.fill();

  if (payload.level >= 4) {
    for (const b of [
      { x: centerX - 85, y: groundY - 285 },
      { x: centerX - 10, y: groundY - 350 },
      { x: centerX + 75, y: groundY - 300 },
      { x: centerX + 35, y: groundY - 240 },
    ]) {
      ctx.fillStyle = '#f8f7f4';
      ctx.beginPath();
      ctx.arc(b.x, b.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(b.x, b.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (payload.level >= 5) {
    ctx.fillStyle = oliveLeaf;
    ctx.strokeStyle = canopyDeep;
    ctx.lineWidth = 3;
    for (const f of [
      { x: centerX - 105, y: groundY - 245 },
      { x: centerX - 35, y: groundY - 290 },
      { x: centerX + 48, y: groundY - 265 },
      { x: centerX + 100, y: groundY - 240 },
    ]) {
      ctx.beginPath();
      ctx.ellipse(f.x, f.y, 10, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
}

export function renderStoryCardToCanvas(
  canvas: HTMLCanvasElement,
  payload: StoryCardPayload
): void {
  const W = 1080;
  const H = 1920;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, W, H);
  const { template } = payload;

  // Vertical gradient background
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, template.bgTop);
  grad.addColorStop(1, template.bgBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Subtle radial botanical spotlight
  const spot = ctx.createRadialGradient(W / 2, 760, 40, W / 2, 760, 500);
  spot.addColorStop(0, payload.isThirsty ? 'rgba(215, 168, 94, 0.16)' : 'rgba(182, 237, 101, 0.15)');
  spot.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = spot;
  ctx.fillRect(0, 0, W, H);

  // Outer editorial frame
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, 56, 56, W - 112, H - 112, 40);
  ctx.stroke();

  // Top Header Metadata
  ctx.fillStyle = template.accent;
  ctx.font = '600 26px "Manrope", "Inter", sans-serif';
  ctx.fillText('Arbor Improve', 112, 150);

  ctx.fillStyle = template.textMuted;
  ctx.font = '500 24px "Inter", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(payload.weekLabel, W - 112, 150);
  ctx.textAlign = 'left';

  // Creator Title
  ctx.fillStyle = template.textPrimary;
  ctx.font = '700 68px "Manrope", "Inter", sans-serif';
  ctx.fillText(payload.creatorName, 112, 248);

  ctx.fillStyle = template.textMuted;
  ctx.font = '500 32px "Inter", sans-serif';
  ctx.fillText(
    `${payload.treeName} · Level ${payload.level} (${payload.levelName})`,
    112,
    305
  );

  // Tree Spotlight Area
  drawTreeOnCanvas(ctx, W / 2, 980, payload);

  // Reflection Card
  ctx.fillStyle = template.cardSurface;
  drawRoundedRect(ctx, 96, 1080, W - 192, 230, 28);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = template.accent;
  ctx.font = '600 22px "Inter", sans-serif';
  ctx.fillText('Creator reflection', 142, 1142);

  ctx.fillStyle = template.textPrimary;
  ctx.font = '500 36px "Inter", sans-serif';
  wrapCanvasText(ctx, `"${payload.note}"`, 142, 1206, W - 284, 48);

  // Metrics Grid (only metrics the creator enabled)
  const metrics: { label: string; value: string }[] = [
    { label: 'TREE STAGE', value: `Lv.${payload.level} ${payload.levelName}` },
  ];
  if (payload.streakWeeks > 0) {
    metrics.push({
      label: 'POSTING STREAK',
      value: `${payload.streakWeeks} ${payload.streakWeeks === 1 ? 'week' : 'weeks'}`,
    });
  }
  if (payload.followers !== null) {
    metrics.push({
      label: 'FOLLOWERS',
      value: payload.followers.toLocaleString(),
    });
  }
  if (payload.weeklyReach !== null) {
    metrics.push({
      label: 'WEEKLY REACH',
      value: payload.weeklyReach.toLocaleString(),
    });
  }

  const cardY = 1350;
  const gap = 24;
  const totalInnerW = W - 192;
  const cardH = 165;
  const visibleMetrics = metrics.slice(0, 4);

  visibleMetrics.forEach((m, index) => {
    const isSingle = visibleMetrics.length === 1;
    const isFullRowForThree = visibleMetrics.length === 3 && index === 0;
    const spanFull = isSingle || isFullRowForThree;

    let col = 0;
    let row = 0;
    if (!spanFull) {
      if (visibleMetrics.length === 3) {
        col = index - 1;
        row = 1;
      } else {
        col = index % 2;
        row = Math.floor(index / 2);
      }
    }

    const cardW = spanFull ? totalInnerW : (totalInnerW - gap) / 2;
    const x = 96 + col * (cardW + gap);
    const y = cardY + row * (cardH + gap);

    ctx.fillStyle = template.cardSurface;
    drawRoundedRect(ctx, x, y, cardW, cardH, 24);
    ctx.fill();
    ctx.strokeStyle = 'rgba(248, 247, 244, 0.12)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = template.textMuted;
    ctx.font = '500 22px "Inter", sans-serif';
    ctx.fillText(m.label, x + 36, y + 58);

    ctx.fillStyle = template.textPrimary;
    ctx.font = '600 40px "Manrope", "Inter", sans-serif';
    ctx.fillText(m.value, x + 36, y + 118, cardW - 72);
  });

  // Footer
  ctx.fillStyle = template.textMuted;
  ctx.font = '500 24px "Inter", sans-serif';
  ctx.fillText('Consistent growth with barakah', 112, H - 110);

  ctx.fillStyle = template.accent;
  ctx.textAlign = 'right';
  ctx.fillText(`${payload.badgesCount} milestones`, W - 112, H - 110);
  ctx.textAlign = 'left';
}
