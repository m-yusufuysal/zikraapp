/**
 * Ebced Calculation Utility
 * Maps Latin/Turkish characters to traditional Ebced values.
 */

const ebcedValues = {
  'a': 1, 'e': 1, 
  'b': 2, 'p': 2,
  'c': 3, 'ç': 3, 'j': 3,
  'd': 4,
  'h': 8,
  'v': 6, 'o': 6, 'ö': 6, 'u': 6, 'ü': 6, 'w': 6,
  'z': 7,
  't': 400,
  'y': 10, 'ı': 10, 'i': 10,
  'k': 20, 'g': 20, 'ğ': 1000, // G sometimes 20 (kaf) or 1000 (ghain)
  'l': 30,
  'm': 40,
  'n': 50,
  's': 60,
  'ş': 300,
  'f': 80,
  'q': 100,
  'r': 200,
};

/**
 * Calculates the Ebced value of a given text.
 * @param {string} text - The input text (name).
 * @returns {number} - The total Ebced value.
 */
export const calculateEbced = (text) => {
  if (!text) return 0;
  
  const lowerText = text.toLowerCase();
  let total = 0;

  for (let i = 0; i < lowerText.length; i++) {
    const char = lowerText[i];
    if (ebcedValues[char]) {
      total += ebcedValues[char];
    }
  }

  return total;
};
