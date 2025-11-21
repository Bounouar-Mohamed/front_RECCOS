import { z } from 'zod';

// Schéma de validation pour l'inscription
export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(/[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/]/, 'Le mot de passe doit contenir au moins un caractère spécial'),
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  username: z
    .string()
    .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères')
    .max(30, 'Le nom d\'utilisateur ne peut pas dépasser 30 caractères')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, points, tirets et underscores'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
  country: z.string().min(1, 'Le pays est requis'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// Schéma de validation pour la connexion
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
  twoFactorCode: z.string().length(6, 'Le code 2FA doit contenir 6 chiffres').optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Schéma de validation pour mot de passe oublié
export const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Schéma de validation pour réinitialisation mot de passe
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token requis'),
    newPassword: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
      .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
      .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
      .regex(/[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/]/, 'Le mot de passe doit contenir au moins un caractère spécial'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Schéma de validation pour 2FA
export const enable2FASchema = z.object({
  method: z.enum(['app', 'email'], {
    errorMap: () => ({ message: 'Méthode invalide. Utilisez "app" ou "email"' }),
  }),
});

export type Enable2FAFormData = z.infer<typeof enable2FASchema>;

export const verify2FASchema = z.object({
  code: z.string().length(6, 'Le code doit contenir 6 chiffres'),
});

export type Verify2FAFormData = z.infer<typeof verify2FASchema>;
















