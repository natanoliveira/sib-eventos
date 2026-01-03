import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function generateMockData() {
  const mockCustomers = [
    { id: '1', name: 'Maria Silva', email: 'maria@email.com', phone: '(11) 99999-9999' },
    { id: '2', name: 'João Santos', email: 'joao@email.com', phone: '(11) 88888-8888' },
    { id: '3', name: 'Ana Costa', email: 'ana@email.com', phone: '(11) 77777-7777' },
    { id: '4', name: 'Pedro Oliveira', email: 'pedro@email.com', phone: '(11) 66666-6666' }
  ];

  const mockServices = [
    {
      id: '1',
      customerId: '1',
      title: 'Bolo de Chocolate',
      description: 'Bolo de chocolate com recheio de brigadeiro',
      value: 80.00,
      status: 'completed',
      dueDate: new Date('2024-12-25')
    },
    {
      id: '2',
      customerId: '2',
      title: 'Conjunto de Semijoias',
      description: 'Colar e brincos folheados a ouro',
      value: 150.00,
      status: 'pending',
      dueDate: new Date('2024-12-30')
    }
  ];

  const mockRevenues = [
    {
      id: '1',
      customerId: '1',
      title: 'Pagamento - Bolo de Chocolate',
      amount: 80.00,
      category: 'vendas',
      paymentDate: new Date('2024-12-20'),
      method: 'pix'
    },
    {
      id: '2',
      customerId: '3',
      title: 'Venda de Docinhos',
      amount: 45.00,
      category: 'vendas',
      paymentDate: new Date('2024-12-19'),
      method: 'cash'
    }
  ];

  const mockExpenses = [
    {
      id: '1',
      title: 'Ingredientes para Bolos',
      description: 'Chocolate, ovos, farinha',
      amount: 35.00,
      category: 'ingredientes',
      expenseDate: new Date('2024-12-18'),
      method: 'card'
    },
    {
      id: '2',
      title: 'Material para Semijoias',
      description: 'Correntes e pingentes',
      amount: 75.00,
      category: 'material',
      expenseDate: new Date('2024-12-15'),
      method: 'pix'
    }
  ];

  return {
    customers: mockCustomers,
    services: mockServices,
    revenues: mockRevenues,
    expenses: mockExpenses
  };
}

/**
 * Formata um documento (CPF/CNPJ) no padrão brasileiro.
 * 
 * @param {string} value - Valor do documento.
 * @returns {string} Documento formatado.
 */
export function formatDocumentCpfCnpj(value: string): string {
  const digits = value.replace(/\D/g, "");

  // CPF → 000.000.000-00
  if (digits.length <= 11) {
    return digits
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2")
      .slice(0, 14);
  }

  // CNPJ → 00.000.000/0000-00
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .slice(0, 18);
}

/**
 * Formata um número de telefone celular no padrão brasileiro.
 * 
 * @param {string} value - Número de telefone celular.
 * @returns {string} Número de telefone celular formatado.
 */
export function formatCellPhone(value: string): string {
  const digits = value.replace(/\D/g, "");

  // (99) 9
  if (digits.length <= 2) {
    return digits;
  }

  // (99) 9XXXX
  if (digits.length <= 6) {
    return digits.replace(/^(\d{2})(\d+)/, "($1) $2");
  }

  // (99) 9XXXX-XXXX
  if (digits.length <= 11) {
    return digits.replace(/^(\d{2})(\d{5})(\d+)/, "($1) $2-$3").slice(0, 15);
  }

  return digits.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
}

/**
 * Retorna uma string contendo apenas dígitos.
 * 
 * @param {string | null | undefined} value - Valor a ser processado.
 * @returns {string} String contendo apenas dígitos.
 */
export function onlyDigits(value?: string | null): string {
  if (!value) return "";
  return value.replace(/\D/g, "");
}

/**
 * Verifica se um CPF é válido.
 *
 * @param {string} cpf - CPF a ser verificado.
 * @returns {boolean} true se o CPF for válido, false caso contrário.
 */
function isValidCPF(cpf: string): boolean {
  if (!cpf || cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number(cpf[i]) * (10 - i);
  }

  let check = (sum * 10) % 11;
  if (check === 10) check = 0;
  if (check !== Number(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += Number(cpf[i]) * (11 - i);
  }

  check = (sum * 10) % 11;
  if (check === 10) check = 0;

  return check === Number(cpf[10]);
}

/**
 * Verifica se um CNPJ é válido.
 *
 * @param {string} cnpj - CNPJ a ser verificado.
 * @returns {boolean} true se o CNPJ for válido, false caso contrário.
 */
function isValidCNPJ(cnpj: string): boolean {
  if (!cnpj || cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

  const calcDigit = (base: string, weights: number[]) => {
    const sum = base
      .split("")
      .reduce((acc, num, i) => acc + Number(num) * weights[i], 0);

    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const firstDigit = calcDigit(
    cnpj.slice(0, 12),
    [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  );
  const secondDigit = calcDigit(
    cnpj.slice(0, 13),
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  );

  return firstDigit === Number(cnpj[12]) && secondDigit === Number(cnpj[13]);
}

/**
 * Formata e valida um documento (CPF/CNPJ) no padrão brasileiro.
 * 
 * @param {string} value - Valor do documento.
 * @returns {object} Objeto com as seguintes propriedades:
 *   - type: O tipo de documento ('CPF' ou 'CNPJ').
 *   - formatted: O documento formatado.
 *   - isValid: Se o documento é válido.
 *   - raw: O valor do documento sem formatação.
 */
export function formatAndValidateDocument(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.length <= 11) {
    const formatted = digits
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2")
      .slice(0, 14);

    return {
      type: digits.length === 11 ? "CPF" : null,
      formatted,
      isValid: digits.length === 11 ? isValidCPF(digits) : false,
      raw: digits,
    };
  }

  const formatted = digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .slice(0, 18);

  return {
    type: digits.length === 14 ? "CNPJ" : null,
    formatted,
    isValid: digits.length === 14 ? isValidCNPJ(digits) : false,
    raw: digits,
  };
}

/**
 * Valida um endereço de email verificando formato, caracteres permitidos e domínios populares.
 *
 * @param {string} email - Email a ser validado.
 * @returns {object} Objeto com as seguintes propriedades:
 *   - isValid: Se o email é válido.
 *   - errors: Array de erros encontrados.
 *   - warnings: Array de avisos (como sugestões de domínios populares).
 */
export function validateEmail(email: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Verifica se o email está vazio
  if (!email || email.trim() === '') {
    return { isValid: true, errors: [], warnings: [] };
  }

  const trimmedEmail = email.trim().toLowerCase();

  // Verifica se contém @
  if (!trimmedEmail.includes('@')) {
    errors.push('E-mail deve conter o caractere @');
    return { isValid: false, errors, warnings };
  }

  // Divide em nome de usuário e domínio
  const parts = trimmedEmail.split('@');

  if (parts.length !== 2) {
    errors.push('E-mail deve conter apenas um caractere @');
    return { isValid: false, errors, warnings };
  }

  const [localPart, domain] = parts;

  // Valida parte local (antes do @)
  if (!localPart || localPart.length === 0) {
    errors.push('E-mail deve ter um nome de usuário antes do @');
  } else {
    // Verifica caracteres válidos na parte local
    // Permitido: letras, números, pontos, hífens, underscores
    const localPartRegex = /^[a-z0-9._+-]+$/;
    if (!localPartRegex.test(localPart)) {
      errors.push('Nome de usuário contém caracteres inválidos. Use apenas letras, números, pontos, hífens e underscores');
    }

    // Não pode começar ou terminar com ponto
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
      errors.push('Nome de usuário não pode começar ou terminar com ponto');
    }

    // Não pode ter pontos consecutivos
    if (localPart.includes('..')) {
      errors.push('Nome de usuário não pode ter pontos consecutivos');
    }

    // Verifica tamanho (máximo 64 caracteres)
    if (localPart.length > 64) {
      errors.push('Nome de usuário muito longo (máximo 64 caracteres)');
    }
  }

  // Valida domínio (depois do @)
  if (!domain || domain.length === 0) {
    errors.push('E-mail deve ter um domínio após o @');
  } else {
    // Verifica se contém ponto
    if (!domain.includes('.')) {
      errors.push('Domínio deve conter pelo menos um ponto');
    }

    // Verifica caracteres válidos no domínio
    const domainRegex = /^[a-z0-9.-]+$/;
    if (!domainRegex.test(domain)) {
      errors.push('Domínio contém caracteres inválidos');
    }

    // Não pode começar ou terminar com ponto ou hífen
    if (domain.startsWith('.') || domain.startsWith('-') ||
      domain.endsWith('.') || domain.endsWith('-')) {
      errors.push('Domínio não pode começar ou terminar com ponto ou hífen');
    }

    // Verifica tamanho do domínio (máximo 253 caracteres)
    if (domain.length > 253) {
      errors.push('Domínio muito longo (máximo 253 caracteres)');
    }

    // Verifica se a extensão (TLD) tem pelo menos 2 caracteres
    const domainParts = domain.split('.');
    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2) {
      errors.push('Extensão do domínio deve ter pelo menos 2 caracteres');
    }

    // Lista de domínios populares para sugestões
    const popularDomains = [
      'gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com',
      'live.com', 'msn.com', 'bol.com.br', 'uol.com.br', 'terra.com.br',
      'ig.com.br', 'globo.com', 'r7.com', 'oi.com.br'
    ];

    // Verifica se o domínio é parecido com algum domínio popular (typos comuns)
    const typoMap: Record<string, string> = {
      'gmail.com.br': 'gmail.com',
      'gmial.com': 'gmail.com',
      'gmai.com': 'gmail.com',
      'gnail.com': 'gmail.com',
      'hotmail.com.br': 'hotmail.com',
      'hotmial.com': 'hotmail.com',
      'outloock.com': 'outlook.com',
      'outlok.com': 'outlook.com',
      'yahooo.com': 'yahoo.com',
      'yaho.com': 'yahoo.com'
    };

    if (typoMap[domain]) {
      warnings.push(`Você quis dizer ${typoMap[domain]}?`);
    }

    // Verifica se é um domínio reconhecido
    const isPopularDomain = popularDomains.includes(domain);

    // Se não for um domínio popular, adiciona um aviso
    if (!isPopularDomain && !domain.endsWith('.com.br') && !domain.endsWith('.gov.br') && !domain.endsWith('.edu.br')) {
      warnings.push('Domínio não é amplamente reconhecido. Verifique se está correto.');
    }
  }

  // Validação regex final completa
  if (errors.length === 0) {
    const emailRegex = /^[a-z0-9._+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      errors.push('Formato de email inválido');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Verifica se um domínio de email existe (requer chamada à API).
 * Esta função deve ser usada no lado do cliente para chamar a API de verificação.
 *
 * @param {string} email - Email a ser verificado.
 * @returns {Promise<object>} Objeto com resultado da verificação.
 */
export async function checkEmailDomainExists(email: string): Promise<{
  exists: boolean;
  error?: string;
}> {
  try {
    const response = await fetch('/api/utils/validate-email-domain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      return { exists: false, error: 'Erro ao verificar domínio' };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao verificar domínio:', error);
    return { exists: false, error: 'Erro ao conectar com o servidor' };
  }
}