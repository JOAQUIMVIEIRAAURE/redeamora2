// Códigos de acesso para cada papel hierárquico
// O Administrador pode alterar esses códigos conforme necessário
// IMPORTANTE: Em um sistema de produção real, esses códigos deveriam estar em variáveis de ambiente

export const ACCESS_CODES = {
  // Líder de Célula: acesso livre (sem código)
  celula_leader: null,
  
  // Supervisor: requer código
  supervisor: 'AMORA2026',
  
  // Coordenador: requer código
  coordenador: 'AMORA2026',
  
  // Líder de Rede: requer código
  rede_leader: 'AMORA2026',
  
  // Administrador: requer código
  admin: 'AMORA2026',
} as const;

export type RoleType = keyof typeof ACCESS_CODES;

export function requiresAccessCode(role: RoleType): boolean {
  return ACCESS_CODES[role] !== null;
}

export function validateAccessCode(role: RoleType, code: string): boolean {
  const expectedCode = ACCESS_CODES[role];
  if (expectedCode === null) return true;
  return code.toUpperCase() === expectedCode.toUpperCase();
}
