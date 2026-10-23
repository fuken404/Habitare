export const C = {
  // Brand
  primary:      '#1F6B55',
  primaryDark:  '#14513F',
  primaryDeep:  '#0E3D2E',
  primarySoft:  '#E8F1ED',
  primaryMuted: '#C7DBD2',
  accent:       '#E8A968',
  accentDark:   '#C28244',
  accentSoft:   '#FBEEDC',

  // Surfaces
  bg:    '#F7F4EE',
  white: '#FFFFFF',

  // Neutrals (warm)
  gray50:  '#F8F6F1',
  gray100: '#EFECE5',
  gray200: '#E2DED4',
  gray300: '#C9C4B7',
  gray400: '#A39E8F',
  gray500: '#736E62',
  gray600: '#52503F',
  gray700: '#3A3830',
  gray800: '#26241D',
  gray900: '#16140E',

  // Semantic
  successBg:     '#E2F1E7',
  successText:   '#1E7D4D',
  successBorder: '#B6DCC2',
  warningBg:     '#FBF1D9',
  warningText:   '#9C6A00',
  warningBorder: '#EFDCA5',
  dangerBg:      '#FBE5E1',
  dangerText:    '#B23A33',
  dangerBorder:  '#F2C5BD',
  infoBg:        '#E2ECF7',
  infoText:      '#1F5AA0',
  infoBorder:    '#BAD0EA',
} as const;

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary' | 'accent';

export const BADGE_TONES: Record<BadgeTone, { bg: string; fg: string }> = {
  success: { bg: C.successBg, fg: C.successText },
  warning: { bg: C.warningBg, fg: C.warningText },
  danger:  { bg: C.dangerBg,  fg: C.dangerText  },
  info:    { bg: C.infoBg,    fg: C.infoText     },
  neutral: { bg: C.gray100,   fg: C.gray700      },
  primary: { bg: C.primarySoft, fg: C.primaryDark },
  accent:  { bg: C.accentSoft,  fg: C.accentDark  },
};
