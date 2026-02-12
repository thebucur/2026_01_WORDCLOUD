// Profanity filter for Romanian and English words (client-side)

const PROFANITY_WORDS = new Set([
  // English profanity
  'fuck', 'shit', 'damn', 'bitch', 'ass', 'asshole', 'bastard', 'crap',
  'piss', 'dick', 'cock', 'pussy', 'cunt', 'whore', 'slut', 'fag', 'faggot',
  'nigger', 'nigga', 'retard', 'idiot', 'moron', 'stupid',
  
  // Romanian profanity
  'pula', 'pizda', 'muie', 'fut', 'futu', 'fute', 'futut', 'fută', 'futuți',
  'căcat', 'rahat', 'cacat', 'căcău', 'căcălău', 'căcărie',
  'cur', 'curu', 'curule', 'curist', 'curistă',
  'mamă', 'mă-sa', 'mă-sii', 'mă-ta', 'mă-tii', 'mă-să', 'mă-sii',
  'băga', 'bagă', 'baga', 'băgat', 'bagat',
  'prost', 'proastă', 'proști', 'proaste',
  'idiot', 'idiotă', 'idioți', 'idiotă',
  'măgar', 'măgară', 'măgari', 'măgare',
  'cretin', 'cretină', 'cretini', 'cretine',
  'imbecil', 'imbecilă', 'imbeci', 'imbeci',
  'tâmpit', 'tâmpită', 'tâmpiți', 'tâmpite',
  'dă-o', 'da-o', 'dă-o-n', 'da-o-n',
  'să-mi', 'sa-mi', 'să-ți', 'sa-ti',
  'bă', 'ba', 'băi', 'bai',
]);

/**
 * Checks if a word contains profanity
 * @param word - The word to check
 * @returns true if the word contains profanity, false otherwise
 */
export function isProfanity(word: string): boolean {
  const normalized = word.trim().toLowerCase();
  
  // Check exact match
  if (PROFANITY_WORDS.has(normalized)) {
    return true;
  }
  
  // Check if word contains any profanity word
  for (const profanity of PROFANITY_WORDS) {
    if (normalized.includes(profanity) || profanity.includes(normalized)) {
      return true;
    }
  }
  
  return false;
}
