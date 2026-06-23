const sanitizeHtml = require('sanitize-html');

const sanitizePostContent = (dirty) => sanitizeHtml(dirty, {
  allowedTags: [
    'p', 'br', 'div', 'blockquote', 'pre', 'hr', 'figure', 'figcaption',
    'strong', 'em', 'u', 's', 'span', 'code', 'mark', 'sub', 'sup',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'a', 'img', 'ul', 'ol', 'li',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
  ],
  allowedAttributes: {
    a: ['href', 'target'],
    img: ['src', 'alt'],
    '*': ['class'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        rel: 'noopener noreferrer',
        target: '_blank',
      },
    }),
  },
  disallowedTagsMode: 'discard',
});

const stripAllHtml = (dirty) => sanitizeHtml(dirty, {
  allowedTags: [],
  allowedAttributes: {},
  disallowedTagsMode: 'discard',
});

module.exports = { sanitizePostContent, stripAllHtml };
