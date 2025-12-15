/**
 * Type représentant un utilisateur dans l'application
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  role: 'CLIENT' | 'AGENT' | 'ADMIN' | 'admin' | 'superadmin';
  emailVerified: boolean;
  isActive: boolean;
  dateOfBirth?: string;
  country?: string;
  createdAt?: string;
  updatedAt?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  twoFactorEnabled?: boolean;
  // Informations bancaires pour le wallet
  bankAccountHolder?: string;
  bankName?: string;
  iban?: string;
  swiftCode?: string;
  payoutMethod?: string;
}

