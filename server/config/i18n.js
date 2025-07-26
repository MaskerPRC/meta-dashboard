const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');
const path = require('path');

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    lng: 'zh', // 默认语言
    fallbackLng: 'zh',
    debug: process.env.NODE_ENV === 'development',
    
    backend: {
      loadPath: path.join(__dirname, '../locales/{{lng}}/translation.json'),
    },
    
    detection: {
      order: ['header', 'querystring', 'cookie'],
      caches: false,
      lookupHeader: 'accept-language',
      lookupQuerystring: 'lng',
      lookupCookie: 'i18next'
    },
    
    interpolation: {
      escapeValue: false
    }
  });

module.exports = i18next; 