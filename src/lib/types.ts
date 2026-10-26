export type Phrase = {
  id: string;
  kn: string;      // Kannada script
  tr: string;      // transliteration (how it sounds)
  en: string;      // English meaning
  tip?: string;    // cultural or usage tip
};

export type Turn = { who: "you" | "them"; kn: string; tr: string; en: string };

export type Situation = {
  id: string;
  p: string;             // prefix for phrase ids, e.g. "auto" -> auto-1
  name: string;
  kn: string;            // Kannada name of the situation
  icon: string;          // key into lib/icons.ts
  blurb: string;
  phrases: Phrase[];
  conversation: Turn[];  // sample two-way conversation
  tips: string[];        // cultural tips
  avoid: string[];       // "better not to say / do" notes
};

export type PhraseWithSituation = Phrase & { situationId: string };

// Shape Gemini returns (see src/lib/server/gemini.ts). Empty `kannada` means "I'm not sure".
export type AIRelated = { kannada: string; transliteration: string; meaning_english: string };
export type AIAnswer = {
  kannada: string;
  transliteration: string;
  meaning_english: string;
  usage_tip: string;
  related_phrases: AIRelated[];
};

// Chat (Ask + Coach). A superset of AIAnswer: empty strings mean "not used this turn".
export type ChatReply = {
  message: string;                                                        // short English line
  kannada: string; transliteration: string; meaning_english: string;      // the phrase / the character's line
  usage_tip: string;                                                      // cultural tip
  correction: { kannada: string; transliteration: string; why: string };  // gentle fix of the learner's last line
  next_hint: AIRelated;                                                   // what the learner could say next
  learn_next: string;                                                     // what to learn next
  related_phrases: AIRelated[];
};
export type ChatTurn = { role: "user" | "model"; text: string };

// Signboard reader result. `found` is false when no Kannada text could be read.
export type AIScan = {
  found: boolean;
  kannada: string; transliteration: string; meaning_english: string; usage_tip: string;
  other_text: AIRelated[];
};
