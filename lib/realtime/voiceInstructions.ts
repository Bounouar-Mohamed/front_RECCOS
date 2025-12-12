/**
 * Instructions vocales pour le mode Realtime
 * 
 * IMPORTANT: En mode Realtime, on utilise UNIQUEMENT ces guidelines vocales.
 * Le contexte chat (prompt complet) est trop long et crée des incohérences.
 * Le modèle doit se concentrer sur la conversation vocale simple.
 */

const VOICE_MARKER = `Tu es Noor, l'IA vocale de Reccos`;

const VOICE_GUIDELINES = `Tu es Noor, une assistante vocale amicale pour Reccos. Tu parles comme une vraie amie, pas comme un robot.

STYLE:
- Reponses ultra courtes: 1-2 phrases max
- Decontractee mais professionnelle
- Pose des questions au lieu de tout expliquer

REGLES:
- Salutations simples et naturelles
- Ne parle de Reccos que si on te le demande
- Laisse le client mener la conversation

RECCOS (si on demande):
- Investissement immobilier fractionne a Dubai
- Parts de vrais biens des 2000 AED
- Biens enregistres au Dubai Land Department`.trim();

export function buildVoiceInstructions(baseInstructions: string): string {
  // Si les instructions contiennent déjà le marqueur vocal, les utiliser telles quelles
  if (baseInstructions && baseInstructions.includes(VOICE_MARKER)) {
    return baseInstructions;
  }
  
  // Retourner uniquement les guidelines vocales, sans contexte chat
  return VOICE_GUIDELINES;
}

// Export du marqueur pour tests
export const REALTIME_VOICE_MARKER = VOICE_MARKER;
