import { TreeType } from '../../types';

interface TreePreviewIllustrationProps {
  treeType: TreeType;
  className?: string;
}

export function TreePreviewIllustration({
  treeType,
  className = 'h-16 w-16',
}: TreePreviewIllustrationProps) {
  if (treeType === 'datePalm') {
    return (
      <svg
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        <ellipse cx="40" cy="70" rx="18" ry="3.5" fill="rgba(255,255,255,0.08)" />
        <path
          d="M38 69C38 55 39 42 42 29"
          stroke="#92400E"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <path
          d="M37.5 58L41.5 56M38.5 50L42.2 48.2M39.5 42L43 40.5"
          stroke="#E5A95E"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.65"
        />
        <path d="M42 28C32 20 20 22 14 29C22 27 32 27 42 30Z" fill="#20b889" />
        <path d="M42 28C34 15 24 12 17 15C26 17 34 21 41 29Z" fill="#0f5c44" />
        <path d="M42 28C52 19 63 22 68 29C60 27 51 27 42 30Z" fill="#20b889" />
        <path d="M42 28C50 15 60 12 66 16C57 17 49 22 43 29Z" fill="#0f5c44" />
        <path d="M42 28C40 16 42 10 46 8C45 14 45 20 43 28Z" fill="#b6ed65" />
        <circle cx="38" cy="33" r="2.1" fill="#d7a85e" />
        <circle cx="40.5" cy="35" r="2.1" fill="#d7a85e" />
        <circle cx="45" cy="33.5" r="2.1" fill="#d7a85e" />
      </svg>
    );
  }

  if (treeType === 'pomegranate') {
    return (
      <svg
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        <ellipse cx="40" cy="70" rx="18" ry="3.5" fill="rgba(255,255,255,0.06)" />
        <path
          d="M40 69V45M40 50L30 39M40 48L50 38"
          stroke="#8c5323"
          strokeWidth="3.6"
          strokeLinecap="round"
        />
        <circle cx="40" cy="30" r="15" fill="#178c68" />
        <circle cx="29" cy="36" r="11" fill="#20b889" opacity="0.92" />
        <circle cx="51" cy="36" r="11" fill="#20b889" opacity="0.92" />
        <circle cx="40" cy="28" r="13" fill="#0f5c44" />
        <circle cx="32" cy="35" r="3" fill="#E11D48" />
        <circle cx="46" cy="27" r="2.8" fill="#E11D48" />
        <circle cx="48" cy="39" r="3" fill="#E11D48" />
        <circle cx="32" cy="35" r="1.2" fill="#F3F5F0" />
        <circle cx="48" cy="39" r="1.2" fill="#F3F5F0" />
      </svg>
    );
  }

  if (treeType === 'fig') {
    return (
      <svg
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        <ellipse cx="40" cy="70" rx="20" ry="3.5" fill="rgba(255,255,255,0.06)" />
        <path
          d="M40 69V46M40 53L28 43M40 51L53 42"
          stroke="#8c5323"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <ellipse cx="40" cy="33" rx="22" ry="14" fill="#178c68" />
        <ellipse cx="30" cy="36" rx="12" ry="10" fill="#20b889" />
        <ellipse cx="50" cy="36" rx="12" ry="10" fill="#20b889" />
        <ellipse cx="40" cy="29" rx="15" ry="11" fill="#0f5c44" />
        <path d="M31 39C31 37 33 35.5 33 35.5C33 35.5 35 37 35 39C35 40.3 34.1 41.2 33 41.2C31.9 41.2 31 40.3 31 39Z" fill="#d7a85e" />
        <path d="M46 35C46 33 48 31.5 48 31.5C48 31.5 50 33 50 35C50 36.3 49.1 37.2 48 37.2C46.9 37.2 46 36.3 46 35Z" fill="#d7a85e" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <ellipse cx="40" cy="70" rx="18" ry="3.5" fill="rgba(255,255,255,0.06)" />
      <path
        d="M40 69C38.5 60 41.5 53 40 44M40 48L31 39M40 47L49 38"
        stroke="#8c5323"
        strokeWidth="3.8"
        strokeLinecap="round"
      />
      <ellipse cx="40" cy="30" rx="17" ry="12" fill="#178c68" />
      <ellipse cx="30" cy="35" rx="10" ry="8" fill="#20b889" />
      <ellipse cx="50" cy="35" rx="10" ry="8" fill="#20b889" />
      <ellipse cx="40" cy="27" rx="12" ry="9" fill="#0f5c44" />
      <ellipse cx="33" cy="34" rx="1.8" ry="2.4" fill="#b6ed65" />
      <ellipse cx="46" cy="29" rx="1.8" ry="2.4" fill="#b6ed65" />
      <ellipse cx="48" cy="38" rx="1.8" ry="2.4" fill="#b6ed65" />
    </svg>
  );
}
