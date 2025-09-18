// HJS Admin Privilege System - Core 3 can never be locked out
export const HJS_CORE_ADMINS = [
  'christlahoward63@gmail.com',
  'christla@howardjanitorial.net', 
  'a.r.barnett11@gmail.com',
  'rickey@howardjanitorial.net' // Adding architect email
] as const;

export interface AdminUser {
  email: string;
  role: 'CEO' | 'VP_OPERATIONS' | 'ARCHITECT' | 'ADMIN' | 'USER';
  permissions: string[];
  canNeverBeLocked: boolean;
}

export const getAdminRole = (email: string): AdminUser => {
  const normalizedEmail = email.toLowerCase().trim();
  
  // Core 3 - Can never be locked out
  if (normalizedEmail === 'christlahoward63@gmail.com' || 
      normalizedEmail === 'christla@howardjanitorial.net') {
    return {
      email: normalizedEmail,
      role: 'CEO',
      permissions: ['ALL_ACCESS', 'FINANCIAL', 'HR', 'OPERATIONS', 'SYSTEM_ADMIN'],
      canNeverBeLocked: true
    };
  }
  
  if (normalizedEmail === 'a.r.barnett11@gmail.com') {
    return {
      email: normalizedEmail,
      role: 'VP_OPERATIONS',
      permissions: ['ALL_ACCESS', 'OPERATIONS', 'HR', 'SCHEDULING', 'PAYROLL'],
      canNeverBeLocked: true
    };
  }
  
  // Architect - Master of all systems
  if (normalizedEmail.includes('rickey') || normalizedEmail === 'architect@odyssey1.com') {
    return {
      email: normalizedEmail,
      role: 'ARCHITECT',
      permissions: ['MASTER_ACCESS', 'SYSTEM_CONTROL', 'ALL_ACCESS'],
      canNeverBeLocked: true
    };
  }
  
  // Regular users
  return {
    email: normalizedEmail,
    role: 'USER',
    permissions: ['BASIC_ACCESS'],
    canNeverBeLocked: false
  };
};

export const isHJSCoreAdmin = (email: string): boolean => {
  return HJS_CORE_ADMINS.some(admin => 
    admin.toLowerCase() === email.toLowerCase().trim()
  ) || email.toLowerCase().includes('rickey');
};

export const hasPermission = (userEmail: string, permission: string): boolean => {
  const user = getAdminRole(userEmail);
  return user.permissions.includes('ALL_ACCESS') || 
         user.permissions.includes('MASTER_ACCESS') ||
         user.permissions.includes(permission);
};