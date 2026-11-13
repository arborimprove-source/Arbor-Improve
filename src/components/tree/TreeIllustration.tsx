import { TREE_LEVEL_NAMES, TREE_TYPES, TreeLevel, TreeType } from '../../types';

interface TreeIllustrationProps {
  treeType: TreeType;
  level: TreeLevel;
  isThirsty?: boolean;
  className?: string;
}

interface Palette {
  canopyLight: string;
  canopyMain: string;
  canopyDeep: string;
  trunk: string;
  trunkShade: string;
  groundFill: string;
  groundRim: string;
  haloFill: string;
  blossomPetal: string;
  blossomCenter: string;
  oliveFruit: string;
  dateFruit: string;
  pomegranateFruit: string;
  figFruit: string;
  fruitAccent: string;
}

function getPalette(isThirsty: boolean): Palette {
  if (isThirsty) {
    return {
      canopyLight: '#9c6626',
      canopyMain: '#d7a85e',
      canopyDeep: '#784c1b',
      trunk: '#8c5323',
      trunkShade: '#693c16',
      groundFill: 'rgba(215, 168, 94, 0.09)',
      groundRim: 'rgba(215, 168, 94, 0.42)',
      haloFill: 'rgba(215, 168, 94, 0.14)',
      blossomPetal: '#f3f5f0',
      blossomCenter: '#d7a85e',
      oliveFruit: '#e9c383',
      dateFruit: '#d97706',
      pomegranateFruit: '#e11d48',
      figFruit: '#b45309',
      fruitAccent: '#fef3c7',
    };
  }

  return {
    canopyLight: '#178c68',
    canopyMain: '#20b889',
    canopyDeep: '#0f5c44',
    trunk: '#8c5323',
    trunkShade: '#693c16',
    groundFill: 'rgba(255, 255, 255, 0.05)',
    groundRim: 'rgba(182, 237, 101, 0.45)',
    haloFill: 'rgba(182, 237, 101, 0.14)',
    blossomPetal: '#f3f5f0',
    blossomCenter: '#d7a85e',
    oliveFruit: '#b6ed65',
    dateFruit: '#d7a85e',
    pomegranateFruit: '#e11d48',
    figFruit: '#d7a85e',
    fruitAccent: '#f3f5f0',
  };
}

function Blossom({ cx, cy, scale = 1, palette }: { cx: number; cy: number; scale?: number; palette: Palette }) {
  return (
    <g transform={`translate(${cx}, ${cy}) scale(${scale})`}>
      <circle cx="0" cy="-4.2" r="2.8" fill={palette.blossomPetal} />
      <circle cx="4" cy="-1.2" r="2.8" fill={palette.blossomPetal} />
      <circle cx="2.5" cy="3.5" r="2.8" fill={palette.blossomPetal} />
      <circle cx="-2.5" cy="3.5" r="2.8" fill={palette.blossomPetal} />
      <circle cx="-4" cy="-1.2" r="2.8" fill={palette.blossomPetal} />
      <circle cx="0" cy="0" r="2" fill={palette.blossomCenter} />
    </g>
  );
}

function SeedStage({ treeType, palette, isThirsty }: { treeType: TreeType; palette: Palette; isThirsty: boolean }) {
  const leafDroop = isThirsty ? 'rotate(12 140 198)' : '';
  return (
    <g className="animate-arbor-sway">
      {/* Seed nestled in warm soil */}
      <ellipse cx="140" cy="218" rx="9" ry="6" fill={palette.trunk} />
      <ellipse cx="138" cy="216.5" rx="3.5" ry="1.8" fill={palette.groundFill} opacity="0.55" />

      {treeType === 'datePalm' && (
        <>
          <path d="M140 214 C140 198, 144 184, 142 164" stroke={palette.canopyMain} strokeWidth="4.5" strokeLinecap="round" fill="none" />
          <g transform={leafDroop}>
            <path d="M142 172 C126 160, 110 162, 102 174 C116 170, 129 172, 141 176 Z" fill={palette.canopyMain} />
            <path d="M142 168 C156 154, 172 156, 180 168 C166 166, 154 169, 142 174 Z" fill={palette.canopyDeep} />
            <path d="M142 166 C139 148, 143 136, 150 130 C149 142, 147 154, 143 167 Z" fill={palette.oliveFruit} />
          </g>
        </>
      )}

      {treeType === 'pomegranate' && (
        <>
          <path d="M140 214 C138 198, 134 186, 130 174" stroke={palette.trunk} strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M140 214 C142 198, 146 186, 150 174" stroke={palette.trunk} strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <g transform={leafDroop}>
            <circle cx="126" cy="168" r="11" fill={palette.canopyMain} />
            <circle cx="154" cy="166" r="11" fill={palette.canopyDeep} />
            <circle cx="140" cy="158" r="10" fill={palette.canopyLight} />
            <circle cx="140" cy="155" r="3.5" fill={palette.pomegranateFruit} />
          </g>
        </>
      )}

      {treeType === 'fig' && (
        <>
          <path d="M140 214 L140 176" stroke={palette.trunk} strokeWidth="5.5" strokeLinecap="round" fill="none" />
          <g transform={leafDroop}>
            <ellipse cx="123" cy="169" rx="17" ry="11" transform="rotate(-18 123 169)" fill={palette.canopyMain} />
            <ellipse cx="157" cy="169" rx="17" ry="11" transform="rotate(18 157 169)" fill={palette.canopyDeep} />
            <ellipse cx="140" cy="160" rx="12" ry="9" fill={palette.canopyLight} />
          </g>
        </>
      )}

      {treeType === 'olive' && (
        <>
          <path d="M140 214 C136 200, 143 186, 140 170" stroke={palette.canopyMain} strokeWidth="4" strokeLinecap="round" fill="none" />
          <g transform={leafDroop}>
            <path d="M140 184 C124 176, 114 166, 118 156 C127 160, 136 169, 140 182 Z" fill={palette.canopyMain} />
            <path d="M140 180 C156 172, 166 161, 161 151 C151 155, 142 165, 140 178 Z" fill={palette.canopyDeep} />
            <path d="M140 171 C135 158, 137 147, 141 142 C145 148, 144 160, 140 171 Z" fill={palette.oliveFruit} />
          </g>
        </>
      )}
    </g>
  );
}

function SaplingStage({ treeType, palette, isThirsty }: { treeType: TreeType; palette: Palette; isThirsty: boolean }) {
  if (treeType === 'datePalm') {
    return (
      <g className="animate-arbor-sway">
        <path d="M138 220 C137 195, 139 168, 144 140" stroke={palette.trunk} strokeWidth="8.5" strokeLinecap="round" fill="none" />
        <path d="M136 202 L143 199 M137 186 L144 183 M139 170 L145 167 M141 154 L147 151" stroke={palette.groundFill} strokeWidth="1.6" strokeLinecap="round" />
        <g transform={isThirsty ? 'translate(0, 4)' : ''}>
          <path d="M144 140 C125 128, 102 132, 92 146 C108 141, 125 141, 144 144 Z" fill={palette.canopyMain} />
          <path d="M144 140 C130 118, 110 112, 96 118 C114 122, 129 128, 143 141 Z" fill={palette.canopyDeep} />
          <path d="M144 140 C162 127, 184 132, 194 146 C178 140, 162 141, 144 144 Z" fill={palette.canopyMain} />
          <path d="M144 140 C158 118, 178 112, 190 119 C172 122, 158 128, 145 141 Z" fill={palette.canopyDeep} />
          <path d="M144 139 C140 114, 144 98, 152 92 C150 107, 149 124, 145 139 Z" fill={palette.oliveFruit} />
        </g>
      </g>
    );
  }

  if (treeType === 'pomegranate') {
    return (
      <g className="animate-arbor-sway">
        <path d="M140 220 V172 M140 184 L120 144 M140 180 L160 142" stroke={palette.trunk} strokeWidth="6" strokeLinecap="round" fill="none" />
        <g transform={isThirsty ? 'translate(0, 4)' : ''}>
          <circle cx="140" cy="126" r="26" fill={palette.canopyLight} />
          <circle cx="116" cy="142" r="19" fill={palette.canopyMain} />
          <circle cx="164" cy="140" r="19" fill={palette.canopyMain} />
          <circle cx="140" cy="122" r="21" fill={palette.canopyDeep} />
          <circle cx="122" cy="140" r="3.5" fill={palette.pomegranateFruit} />
          <circle cx="155" cy="130" r="3.5" fill={palette.pomegranateFruit} />
        </g>
      </g>
    );
  }

  if (treeType === 'fig') {
    return (
      <g className="animate-arbor-sway">
        <path d="M140 220 V156 M140 176 L108 152 M140 172 L172 150" stroke={palette.trunk} strokeWidth="8.5" strokeLinecap="round" fill="none" />
        <g transform={isThirsty ? 'translate(0, 4)' : ''}>
          <ellipse cx="140" cy="134" rx="44" ry="22" fill={palette.canopyLight} />
          <ellipse cx="106" cy="146" rx="24" ry="15" fill={palette.canopyMain} />
          <ellipse cx="174" cy="146" rx="24" ry="15" fill={palette.canopyMain} />
          <ellipse cx="140" cy="128" rx="30" ry="17" fill={palette.canopyDeep} />
        </g>
      </g>
    );
  }

  return (
    <g className="animate-arbor-sway">
      <path d="M140 220 C136 194, 144 168, 140 144" stroke={palette.trunk} strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M140 176 C130 166, 120 156, 114 148" stroke={palette.trunk} strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M140 168 C151 158, 161 150, 168 142" stroke={palette.trunk} strokeWidth="4" strokeLinecap="round" fill="none" />
      <g transform={isThirsty ? 'translate(0, 4)' : ''}>
        <ellipse cx="140" cy="126" rx="30" ry="20" fill={palette.canopyLight} />
        <ellipse cx="115" cy="144" rx="19" ry="13" fill={palette.canopyMain} />
        <ellipse cx="166" cy="141" rx="19" ry="13" fill={palette.canopyMain} />
        <ellipse cx="140" cy="124" rx="22" ry="15" fill={palette.canopyDeep} />
      </g>
    </g>
  );
}

function MaturePalmTree({
  level,
  palette,
  isThirsty,
}: {
  level: TreeLevel;
  palette: Palette;
  isThirsty: boolean;
}) {
  const showBlossoms = level >= 4;
  const showFruit = level >= 5;

  return (
    <g className="animate-arbor-sway">
      <path d="M126 222 C133 218, 136 212, 137 204 M153 222 C146 218, 143 212, 142 204" stroke={palette.trunkShade} strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M137 221 C134 178, 138 130, 148 86" stroke={palette.trunk} strokeWidth="12" strokeLinecap="round" fill="none" />
      <path
        d="M132 204 L142 200 M132 188 L142 184 M133 172 L143 168 M135 156 L144 152 M137 140 L146 136 M139 124 L148 120 M142 108 L151 104"
        stroke={palette.groundFill}
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.85"
      />
      <g transform={isThirsty ? 'translate(0, 5)' : ''}>
        <path d="M148 86 C118 76, 86 88, 66 112 C90 98, 118 92, 148 90 Z" fill={palette.canopyMain} />
        <path d="M148 86 C178 76, 210 88, 228 112 C204 98, 178 92, 148 90 Z" fill={palette.canopyMain} />
        <path d="M148 85 C120 62, 86 60, 62 78 C92 72, 120 76, 147 88 Z" fill={palette.canopyDeep} />
        <path d="M148 85 C176 62, 210 60, 232 78 C202 72, 176 76, 149 88 Z" fill={palette.canopyDeep} />
        <path d="M148 84 C132 52, 108 40, 88 44 C112 52, 132 65, 146 85 Z" fill={palette.canopyMain} />
        <path d="M148 84 C164 52, 188 40, 208 44 C184 52, 164 65, 150 85 Z" fill={palette.canopyMain} />
        <path d="M148 84 C144 54, 148 34, 158 26 C156 44, 154 64, 150 84 Z" fill={palette.canopyLight} />
      </g>

      {showBlossoms && (
        <g>
          <Blossom cx={136} cy={80} scale={0.9} palette={palette} />
          <Blossom cx={160} cy={78} scale={0.9} palette={palette} />
          <Blossom cx={148} cy={66} scale={0.85} palette={palette} />
          <Blossom cx={120} cy={74} scale={0.8} palette={palette} />
          <Blossom cx={176} cy={74} scale={0.8} palette={palette} />
        </g>
      )}

      {showFruit && (
        <g>
          <path d="M144 90 C138 98, 134 104, 132 108" stroke={palette.trunkShade} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="131" cy="110" r="4" fill={palette.dateFruit} />
          <circle cx="137" cy="114" r="4" fill={palette.dateFruit} />
          <circle cx="129" cy="118" r="3.8" fill={palette.trunkShade} />
          <circle cx="135" cy="122" r="3.8" fill={palette.dateFruit} />
          <path d="M152 90 C158 98, 162 104, 164 108" stroke={palette.trunkShade} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="163" cy="110" r="4" fill={palette.dateFruit} />
          <circle cx="169" cy="114" r="4" fill={palette.dateFruit} />
          <circle cx="161" cy="118" r="3.8" fill={palette.trunkShade} />
          <circle cx="167" cy="122" r="3.8" fill={palette.dateFruit} />
        </g>
      )}
    </g>
  );
}

function MatureCanopyTree({
  treeType,
  level,
  palette,
  isThirsty,
}: {
  treeType: Exclude<TreeType, 'datePalm'>;
  level: TreeLevel;
  palette: Palette;
  isThirsty: boolean;
}) {
  const showBlossoms = level >= 4;
  const showFruit = level >= 5;

  if (treeType === 'pomegranate') {
    return (
      <g className="animate-arbor-sway">
        <path d="M124 222 C132 216, 135 208, 136 198 M156 222 C148 216, 145 208, 144 198" stroke={palette.trunkShade} strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <path d="M140 220 V156 M140 174 L106 122 M140 170 L174 120 M140 162 L140 112" stroke={palette.trunk} strokeWidth="10" strokeLinecap="round" fill="none" />
        <g transform={isThirsty ? 'translate(0, 4)' : ''}>
          <circle cx="140" cy="88" r="44" fill={palette.canopyLight} />
          <circle cx="96" cy="114" r="32" fill={palette.canopyMain} />
          <circle cx="184" cy="112" r="32" fill={palette.canopyMain} />
          <circle cx="116" cy="84" r="28" fill={palette.canopyMain} />
          <circle cx="166" cy="86" r="28" fill={palette.canopyMain} />
          <circle cx="140" cy="94" r="38" fill={palette.canopyDeep} />
        </g>

        {showBlossoms && (
          <g>
            <Blossom cx={102} cy={96} scale={0.95} palette={palette} />
            <Blossom cx={138} cy={66} scale={1.05} palette={palette} />
            <Blossom cx={176} cy={94} scale={0.95} palette={palette} />
            <Blossom cx={154} cy={112} scale={0.85} palette={palette} />
          </g>
        )}

        {showFruit && (
          <g>
            {[
              { x: 96, y: 112 },
              { x: 124, y: 86 },
              { x: 158, y: 108 },
              { x: 182, y: 104 },
              { x: 142, y: 120 },
            ].map((pos, idx) => (
              <g key={idx} transform={`translate(${pos.x}, ${pos.y})`}>
                <circle cx="0" cy="0" r="6.8" fill={palette.pomegranateFruit} />
                <path d="M-2.5 -6.5 L0 -9.5 L2.5 -6.5 Z" fill={palette.pomegranateFruit} />
                <circle cx="-2" cy="-2" r="2" fill={palette.fruitAccent} opacity="0.9" />
              </g>
            ))}
          </g>
        )}
      </g>
    );
  }

  if (treeType === 'fig') {
    return (
      <g className="animate-arbor-sway">
        <path d="M116 222 C128 216, 132 208, 134 196 M164 222 C152 216, 148 208, 146 196" stroke={palette.trunkShade} strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M140 220 V142 M140 166 C112 152, 92 140, 76 126 M140 162 C168 148, 188 138, 204 124" stroke={palette.trunk} strokeWidth="15" strokeLinecap="round" fill="none" />
        <g transform={isThirsty ? 'translate(0, 4)' : ''}>
          <ellipse cx="140" cy="96" rx="84" ry="42" fill={palette.canopyLight} />
          <ellipse cx="82" cy="116" rx="46" ry="28" fill={palette.canopyMain} />
          <ellipse cx="198" cy="114" rx="46" ry="28" fill={palette.canopyMain} />
          <ellipse cx="140" cy="90" rx="58" ry="33" fill={palette.canopyDeep} />
          <ellipse cx="118" cy="108" rx="34" ry="22" fill={palette.canopyMain} />
          <ellipse cx="164" cy="108" rx="34" ry="22" fill={palette.canopyMain} />
        </g>

        {showBlossoms && (
          <g>
            <Blossom cx={92} cy={104} scale={0.95} palette={palette} />
            <Blossom cx={140} cy={72} scale={1.05} palette={palette} />
            <Blossom cx={188} cy={104} scale={0.95} palette={palette} />
            <Blossom cx={162} cy={118} scale={0.85} palette={palette} />
          </g>
        )}

        {showFruit && (
          <g>
            {[
              { x: 84, y: 122 },
              { x: 118, y: 100 },
              { x: 162, y: 112 },
              { x: 196, y: 118 },
            ].map((pos, idx) => (
              <path
                key={idx}
                d={`M${pos.x} ${pos.y - 7} C${pos.x - 6} ${pos.y - 1}, ${pos.x - 6} ${pos.y + 7}, ${pos.x} ${pos.y + 7} C${pos.x + 6} ${pos.y + 7}, ${pos.x + 6} ${pos.y - 1}, ${pos.x} ${pos.y - 7} Z`}
                fill={palette.figFruit}
              />
            ))}
          </g>
        )}
      </g>
    );
  }

  // Olive tree: gnarled trunk + airy silver-emerald leaves + olives
  return (
    <g className="animate-arbor-sway">
      <path d="M122 222 C131 217, 134 210, 135 200 M158 222 C149 217, 146 210, 145 200" stroke={palette.trunkShade} strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M140 220 C134 192, 146 170, 139 140" stroke={palette.trunk} strokeWidth="12" strokeLinecap="round" fill="none" />
      <path d="M139 156 C120 142, 106 128, 96 116" stroke={palette.trunk} strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M141 152 C160 138, 174 126, 184 114" stroke={palette.trunk} strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M140 146 C138 128, 140 112, 142 98" stroke={palette.trunk} strokeWidth="5.5" strokeLinecap="round" fill="none" />

      <g transform={isThirsty ? 'translate(0, 4)' : ''}>
        <ellipse cx="140" cy="94" rx="64" ry="38" fill={palette.canopyLight} />
        <ellipse cx="96" cy="112" rx="34" ry="26" fill={palette.canopyMain} />
        <ellipse cx="184" cy="110" rx="34" ry="26" fill={palette.canopyMain} />
        <ellipse cx="140" cy="86" rx="46" ry="30" fill={palette.canopyDeep} />
        <ellipse cx="122" cy="102" rx="28" ry="18" fill={palette.canopyMain} />
        <ellipse cx="158" cy="102" rx="26" ry="18" fill={palette.canopyMain} />
      </g>

      {showBlossoms && (
        <g>
          <Blossom cx={106} cy={98} scale={0.95} palette={palette} />
          <Blossom cx={136} cy={72} scale={1.05} palette={palette} />
          <Blossom cx={170} cy={92} scale={0.95} palette={palette} />
          <Blossom cx={152} cy={112} scale={0.85} palette={palette} />
          <Blossom cx={118} cy={118} scale={0.85} palette={palette} />
        </g>
      )}

      {showFruit && (
        <g>
          <ellipse cx="96" cy="116" rx="4.2" ry="6" fill={palette.oliveFruit} stroke={palette.canopyDeep} strokeWidth="1.2" />
          <ellipse cx="122" cy="96" rx="4.2" ry="6" fill={palette.oliveFruit} stroke={palette.canopyDeep} strokeWidth="1.2" />
          <ellipse cx="146" cy="108" rx="4.2" ry="6" fill={palette.oliveFruit} stroke={palette.canopyDeep} strokeWidth="1.2" />
          <ellipse cx="176" cy="112" rx="4.2" ry="6" fill={palette.oliveFruit} stroke={palette.canopyDeep} strokeWidth="1.2" />
          <ellipse cx="160" cy="82" rx="4.2" ry="6" fill={palette.oliveFruit} stroke={palette.canopyDeep} strokeWidth="1.2" />
        </g>
      )}
    </g>
  );
}

export function TreeIllustration({
  treeType,
  level,
  isThirsty = false,
  className = 'h-60 w-64',
}: TreeIllustrationProps) {
  const palette = getPalette(isThirsty);
  const treeName = TREE_TYPES.find((t) => t.id === treeType)?.name ?? 'Olive Tree';
  const stageName = TREE_LEVEL_NAMES[level];

  return (
    <svg
      viewBox="0 0 280 250"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={`${treeName}, Level ${level} (${stageName})${isThirsty ? ', currently thirsty' : ''}`}
    >
      <ellipse cx="140" cy="224" rx="74" ry="11" fill={palette.groundFill} />
      <path
        d="M84 224 C112 219, 168 219, 196 224"
        stroke={palette.groundRim}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.7"
      />

      {isThirsty && (
        <g stroke="#CA8A04" strokeWidth="1.4" strokeLinecap="round" opacity="0.55">
          <path d="M98 227 L108 225 L114 228" />
          <path d="M168 226 L177 224 L184 227" />
        </g>
      )}

      {level === 1 && (
        <SeedStage treeType={treeType} palette={palette} isThirsty={isThirsty} />
      )}
      {level === 2 && (
        <SaplingStage treeType={treeType} palette={palette} isThirsty={isThirsty} />
      )}
      {level >= 3 && treeType === 'datePalm' && (
        <MaturePalmTree level={level} palette={palette} isThirsty={isThirsty} />
      )}
      {level >= 3 && treeType !== 'datePalm' && (
        <MatureCanopyTree
          treeType={treeType}
          level={level}
          palette={palette}
          isThirsty={isThirsty}
        />
      )}
    </svg>
  );
}
