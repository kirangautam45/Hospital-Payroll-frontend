/**
 * Preeti to Unicode Nepali Converter
 * Converts text typed in Preeti font encoding to proper Unicode Devanagari
 */

// Extended mapping for common ligatures and combinations
const ligatureMap: Record<string, string> = {
  '\\': 'ू',
  'Ø': 'क्र',
  '|m': 'फ',
  '|': 'र्',
  '^': '६',
  'ß': 'द्व',
  'Î': 'द्य',
  'å': 'द्ध',
  '›': 'दृ',
  'ê': 'क्त',
  '‹': 'ट्ट',
  'Ý': 'ट्ठ',
  'ç': 'न्न',
  'í': 'न्ह',
  'ì': 'ह्न',
  'Í': 'ड्ड',
  'Ë': 'ड्ढ',
  '§': 'ञ्ज',
  '‰': 'ट्र',
  'Ú': 'ठ्ठ',
  'é': 'ड्र',
  'ë': 'ढ्य',
  'Ò': 'द्घ',
  'ƒ': 'ह्य',
  '‡': 'द्द',
  'N': 'ल',
  '•': '.',
  '\u2018': '\u2018',
  '\u201C': '\u201C',
  '\u201D': '\u201D',
};

/**
 * Check if text appears to be Preeti encoded
 * @param text - The text to check
 * @returns true if the text appears to be Preeti encoded
 */
export function isPreetiEncoded(text: string): boolean {
  if (!text) return false;

  // Check if the text contains Unicode Devanagari characters
  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  if (hasDevanagari) return false;

  // Check for common Preeti patterns
  const preetiPatterns = /[;sf]|km|cf|em|if|f]|f}|\[|\]|\{|\}/;
  return preetiPatterns.test(text);
}

/**
 * Convert Preeti encoded text to Unicode Nepali
 * @param preetiText - Text in Preeti encoding
 * @returns Unicode Nepali text
 */
export function preetiToUnicode(preetiText: string): string {
  if (!preetiText) return '';

  // If already contains Devanagari, return as is
  if (/[\u0900-\u097F]/.test(preetiText)) {
    return preetiText;
  }

  let result = preetiText;

  // First, handle multi-character mappings (longer patterns first)
  const sortedLigatures = Object.entries(ligatureMap)
    .sort((a, b) => b[0].length - a[0].length);

  for (const [preeti, unicode] of sortedLigatures) {
    result = result.split(preeti).join(unicode);
  }

  // Handle two-character combinations
  const twoCharMappings: Record<string, string> = {
    'cf': 'आ', 'O{': 'ई', 'pm': 'ऊ', 'P]': 'ऐ', 'cf]': 'ओ', 'cf}': 'औ',
    'em': 'झ', 'km': 'फ', 'if': 'ष', 'If': 'क्ष', 'f]': 'ो', 'f}': 'ौ',
  };

  for (const [preeti, unicode] of Object.entries(twoCharMappings)) {
    result = result.split(preeti).join(unicode);
  }

  // Handle single character mappings
  const singleCharMappings: Record<string, string> = {
    'c': 'अ', 'O': 'इ', 'p': 'उ', 'P': 'ए', 'C': 'ऋ',
    's': 'क', 'v': 'ख', 'u': 'ग', '3': 'घ', 'ª': 'ङ',
    'r': 'च', '5': 'छ', 'h': 'ज', '`': 'ञ',
    '6': 'ट', '7': 'ठ', '8': 'ड', '9': 'ढ', '0': 'ण',
    't': 'त', 'y': 'थ', 'b': 'द', 'w': 'ध', 'g': 'न',
    'k': 'प', 'a': 'ब', 'e': 'भ', 'd': 'म',
    'o': 'य', '/': 'र', 'n': 'ल', 'j': 'व',
    'z': 'श', ';': 'स', 'x': 'ह',
    'q': 'त्र', '1': 'ज्ञ',
    'f': 'ा', 'L': 'ि', 'l': 'ी', 'F': 'ी',
    ']': 'े', '}': 'ै', '[': 'ु', '\\': 'ू', '{': 'ू',
    "'": 'ृ', '|': '्र',
    ')': '०', '!': '१', '@': '२', '#': '३', '$': '४',
    '%': '५', '&': '७', '*': '८', '(': '९',
    '.': '।', ':': 'ः', 'M': ':',
  };

  let converted = '';
  for (let i = 0; i < result.length; i++) {
    const char = result[i];
    converted += singleCharMappings[char] || char;
  }

  // Fix vowel sign positioning (i-matra should come before consonant visually but after in Unicode)
  converted = fixVowelPositioning(converted);

  return converted;
}

/**
 * Fix vowel positioning in converted text
 * In Preeti, ि (i-matra) is typed before the consonant, but in Unicode it comes after
 */
function fixVowelPositioning(text: string): string {
  // Swap ि with preceding consonant
  return text.replace(/ि(.)/g, '$1ि');
}

/**
 * Convert a record object's string fields from Preeti to Unicode
 * @param record - Object with string fields that may be Preeti encoded
 * @param fields - Array of field names to convert
 * @returns New object with converted fields
 */
export function convertRecordFields<T extends Record<string, unknown>>(
  record: T,
  fields: (keyof T)[]
): T {
  const converted = { ...record };

  for (const field of fields) {
    const value = record[field];
    if (typeof value === 'string' && isPreetiEncoded(value)) {
      (converted as Record<string, unknown>)[field as string] = preetiToUnicode(value);
    }
  }

  return converted;
}

export default preetiToUnicode;
