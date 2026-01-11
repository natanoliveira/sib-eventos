export const MEMBER_CATEGORY_OPTIONS = [
  { value: 'VISITANTE', label: 'Visitante' },
  { value: 'MEMBRO_NOVO', label: 'Membro Novo' },
  { value: 'ADULTO', label: 'Adulto' },
  { value: 'MEMBRO_REGULAR', label: 'Membro Regular' },
  { value: 'MEMBRO_ATIVO', label: 'Membro Ativo' },
  { value: 'MEMBRO_VISITANTE', label: 'Membro Visitante' },
  { value: 'JOVEM', label: 'Jovem' },
] as const;

export type MemberCategoryValue = typeof MEMBER_CATEGORY_OPTIONS[number]['value'];

const MEMBER_CATEGORY_LABELS: Record<MemberCategoryValue, string> = {
  VISITANTE: 'Visitante',
  MEMBRO_NOVO: 'Membro Novo',
  ADULTO: 'Adulto',
  MEMBRO_REGULAR: 'Membro Regular',
  MEMBRO_ATIVO: 'Membro Ativo',
  MEMBRO_VISITANTE: 'Membro Visitante',
  JOVEM: 'Jovem',
};

const MEMBER_CATEGORY_BY_LABEL = MEMBER_CATEGORY_OPTIONS.reduce((acc, option) => {
  acc[option.label.toLowerCase()] = option.value;
  return acc;
}, {} as Record<string, MemberCategoryValue>);

export function parseMemberCategoryInput(input: string | null | undefined) {
  if (input === undefined || input === null) {
    return { isValid: true, value: undefined as undefined };
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return { isValid: true, value: null as null };
  }

  if (MEMBER_CATEGORY_LABELS[trimmed as MemberCategoryValue]) {
    return { isValid: true, value: trimmed as MemberCategoryValue };
  }

  const byLabel = MEMBER_CATEGORY_BY_LABEL[trimmed.toLowerCase()];
  if (byLabel) {
    return { isValid: true, value: byLabel };
  }

  return { isValid: false, value: undefined as undefined };
}

export function formatMemberCategory(value: string | null | undefined) {
  if (!value) {
    return value ?? null;
  }

  const label = MEMBER_CATEGORY_LABELS[value as MemberCategoryValue];
  return label ?? value;
}
