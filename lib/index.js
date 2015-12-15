var  _ = require('lodash')
    , async = require('async');

var J = module.exports = {};

J.Field = require('./field');
J.Template = require('./template');

// api breaks here
J._templates = {};
J._as = {};

J.as = function() {
  var args = [].slice.call(arguments);
  var t = getTemplate(args.shift());
  t.represent.apply(t, args);
}
// end api break

J.convert = {
  underscore: require('./converters/underscore')
};


/**
 * Sets a template in Jiggler.
 * If the template name contains one or more dots (.), the template name will be split into
 * several keys and nested down into the J.templates object.
 * Example:
 * groupname.templatename will settle into J.templates.groupname.templatename
 */
function setTemplate(template, fields) {
  var t;
  if (template) {

    t = new J.Template(template, fields);
    _.set(J._templates, template, t);
    _.set(J._as, template, function() {
      t.represent.apply(t, arguments);
    })
  }
  return t
}

/**
 * Retrieves a template (in the strict sense, without wildcard pattern matching)
 * @param template
 * @returns {*}
 */
function getTemplate(template) {
  return _.get(J._templates, template)
}

/**
 * Retrieves a template, but allows for wildcards in the template name to match.
 * The wildcard to be used can be set by setting J.wildcard to the string.
 * Don't fool around and set it to ., alright?
 * @param template
 */
function getTemplateWildcard(template) {
  var keyChunks = template.split('.');
  var result = _getRecurseWildcard(keyChunks, J._templates);
  if (!result) throw new Error('A template named "' + template + '" is not defined');
  return result
}

function _getRecurseWildcard(keyChunks, templateChunk) {
    if (keyChunks.length === 0) return templateChunk// we've gone as deep as we can; if we're here, that means we found it
    var currentChunk = keyChunks.shift();
    if (templateChunk[currentChunk]) {
        var tmp = _getRecurseWildcard(_.clone(keyChunks),templateChunk[currentChunk]);
        if (tmp) return tmp
    }

    if (templateChunk[J.wildcard]) {
      var tmp =  _getRecurseWildcard(_.clone(keyChunks),templateChunk[J.wildcard])
      if (tmp) return tmp;
    }
      return null
}

J.templates = getTemplate;
J.templatesWildcard = getTemplateWildcard;

// defines the wildcard for path selection
J.wildcard = '*';

/**
 * Define a new template on the class specified
 *
 * @param {String} template name of the defined template
 * @param {Array} fields array of Field definitions
 * @param {Object} [options]
 * @returns {Object} the defined template
 * @api public
 *
 * Options:
 *
 *   - `extends` A pre-existing template that this new template derives from
 *
 */

J.define = function(template, fields, options) {
  options = options || {};

  // Handle extended templates
  if (options.extends) {
    var templateToExtend = getTemplate(options.extends)
    if (!templateToExtend)
      throw new Error('A template named "' + options.extends + '" is not defined');

    templateToExtend.fields.forEach(function(field) {
      // Only add base fields if they are not in the extended template
      var isInExtended = _.find(fields, function(extendedField) {
        return extendedField.name === field.name;
      });

      if (!isInExtended) {
        var clone = _.extend(Object.create(Object.getPrototypeOf(field)), field);
        fields.unshift(clone);
      }
    });
  }

  var t = setTemplate(template, fields)
  var t = new J.Template(template, fields);

  /*
  J.templates[template] = t;
  J.as[template] = function() {
    t.represent.apply(t, arguments);
  };
  */
  return t;
};