const languages = require('../config/languages.json');
const translations = require('../config/translations.json');

/**
 * Detect user's preferred language from various sources
 * @param {Object} sources - Object containing potential language sources
 * @returns {string} - Language code (defaults to 'en')
 */
function detectLanguage(sources = {}) {
  const { 
    checkoutMetadata = {}, 
    acceptLanguage = '', 
    countryCode = '',
    userAgent = '' 
  } = sources;

  // Priority 1: Explicit language from checkout metadata
  if (checkoutMetadata.language) {
    const lang = checkoutMetadata.language.toLowerCase();
    if (isSupportedLanguage(lang)) {
      return lang;
    }
  }

  // Priority 2: Accept-Language header
  if (acceptLanguage) {
    const browserLangs = parseAcceptLanguage(acceptLanguage);
    for (const lang of browserLangs) {
      if (isSupportedLanguage(lang)) {
        return lang;
      }
    }
  }

  // Priority 3: Country code mapping
  if (countryCode) {
    const langFromCountry = mapCountryToLanguage(countryCode);
    if (langFromCountry && isSupportedLanguage(langFromCountry)) {
      return langFromCountry;
    }
  }

  // Default to English
  return 'en';
}

/**
 * Check if a language code is supported
 * @param {string} langCode 
 * @returns {boolean}
 */
function isSupportedLanguage(langCode) {
  return languages.supported.some(lang => lang.code === langCode);
}

/**
 * Parse Accept-Language header
 * @param {string} acceptLanguage 
 * @returns {Array<string>}
 */
function parseAcceptLanguage(acceptLanguage) {
  return acceptLanguage
    .split(',')
    .map(lang => {
      const [code] = lang.trim().split(';');
      return code.split('-')[0].toLowerCase(); // Extract base language code
    })
    .filter(Boolean);
}

/**
 * Map country code to most likely language
 * @param {string} countryCode 
 * @returns {string|null}
 */
function mapCountryToLanguage(countryCode) {
  const countryLangMap = {
    'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es', 'PE': 'es', 'VE': 'es',
    'FR': 'fr', 'CA': 'fr', 'BE': 'fr', 'CH': 'fr',
    'DE': 'de', 'AT': 'de',
    'IT': 'it',
    'PT': 'pt', 'BR': 'pt',
    'JP': 'ja',
    'KR': 'ko',
    'CN': 'zh', 'TW': 'zh', 'HK': 'zh',
    'SA': 'ar', 'AE': 'ar', 'EG': 'ar', 'MA': 'ar'
  };
  
  return countryLangMap[countryCode.toUpperCase()] || null;
}

/**
 * Get translated text for a given key and language
 * @param {string} section - Translation section (email, sms)
 * @param {string} key - Translation key
 * @param {string} language - Language code
 * @param {Object} variables - Variables to replace in translation
 * @returns {string}
 */
function translate(section, key, language = 'en', variables = {}) {
  try {
    // Get the translation
    let text = translations[section]?.[key]?.[language] || 
               translations[section]?.[key]?.['en'] || 
               `Missing translation: ${section}.${key}.${language}`;

    // Replace variables
    Object.keys(variables).forEach(variable => {
      const placeholder = `{${variable}}`;
      text = text.replace(new RegExp(placeholder, 'g'), variables[variable]);
    });

    return text;
  } catch (error) {
    console.error('Translation error:', error);
    return `Translation error: ${section}.${key}`;
  }
}

/**
 * Get all supported languages
 * @returns {Array}
 */
function getSupportedLanguages() {
  return languages.supported;
}

/**
 * Get language name by code
 * @param {string} code 
 * @returns {string}
 */
function getLanguageName(code) {
  const lang = languages.supported.find(l => l.code === code);
  return lang ? lang.name : 'Unknown';
}

module.exports = {
  detectLanguage,
  isSupportedLanguage,
  translate,
  getSupportedLanguages,
  getLanguageName
};