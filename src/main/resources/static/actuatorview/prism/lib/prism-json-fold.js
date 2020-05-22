var prismJsonFold = (function () {
	'use strict';

	var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	/*
	 * prism-json-fold
	 *
	 * (c) Harminder Virk <virk@adonisjs.com>
	 *
	 * For the full copyright and license information, please view the LICENSE
	 * file that was distributed with this source code.
	*/
	var utils = {
	  /**
	   * Returns a boolean telling is line is one of the given
	   * punctuation or not
	   *
	   * @method isPunctuation
	   *
	   * @param  {String}      line
	   * @param  {Array}      values
	   *
	   * @return {Boolean}
	   */
	  isPunctuation: function isPunctuation(line, values) {
	    return values.some(function (value) {
	      return line.indexOf("punctuation\">".concat(value)) > -1;
	    });
	  },

	  /**
	   * Returns a boolean telling is line is one of the given operators
	   *
	   * @method isOperator
	   *
	   * @param  {String}   line
	   * @param  {Array}   values
	   *
	   * @return {Boolean}
	   */
	  isOperator: function isOperator(line, values) {
	    return values.some(function (value) {
	      return line.indexOf("operator\">".concat(value)) > -1;
	    });
	  },

	  /**
	   * Retuns a boolean telling if line is a property
	   *
	   * @method isProperty
	   *
	   * @param  {String}   line
	   *
	   * @return {Boolean}
	   */
	  isProperty: function isProperty(line) {
	    return line.indexOf('property">') > -1;
	  },

	  /**
	   * Returns the span for the main block
	   *
	   * @method getBlock
	   *
	   * @param  {String} identifier
	   *
	   * @return {String}
	   */
	  getBlock: function getBlock(identifier) {
	    return "<span class=\"block block-".concat(identifier, "\"><i class=\"caret\"></i>");
	  },

	  /**
	   * Returns the span for the block wrapper
	   *
	   * @method getBlockWrapper
	   *
	   * @return {String}
	   */
	  getBlockWrapper: function getBlockWrapper() {
	    return '<span class="block-wrapper">';
	  },

	  /**
	   * Returns whitspaces from the front of the span tag
	   *
	   * @method getSpaces
	   *
	   * @param  {String}  content
	   *
	   * @return {String}
	   */
	  getSpaces: function getSpaces(content) {
	    var match = content.match(/^(\s+)/);
	    return match ? match[1] : '';
	  },

	  /**
	   * Returns a boolean telling if current content is a closing
	   * array of objectq
	   *
	   * @method isClosingBlock
	   *
	   * @param  {String}       content
	   *
	   * @return {Boolean}
	   */
	  isClosingBlock: function isClosingBlock(content) {
	    return content.indexOf('punctuation">}') > -1 || content.indexOf('punctuation">]') > -1;
	  }
	};

	/*
	 * prism-json-fold
	 *
	 * (c) Harminder Virk <virk@adonisjs.com>
	 *
	 * For the full copyright and license information, please view the LICENSE
	 * file that was distributed with this source code.
	*/


	var objects = {
	  /**
	   * Returns a boolean telling if stack and the current line
	   * content looks like an object literal
	   *
	   * @method matches
	   *
	   * @param  {Array} stack
	   * @param  {String} content
	   * @param  {Number} index
	   *
	   * @return {Boolean}
	   */
	  matches: function matches(stack, content, index) {
	    /**
	     * If object is part an array
	     *
	     * [
	     *   {
	     *   },
	     *   {
	     *   }
	     * ]
	     */
	    if (utils.isPunctuation(content, ['{'])) {
	      if (!stack[index - 1]) {
	        return false;
	      }

	      return utils.isPunctuation(stack[index - 1], ['[', ',']);
	    }
	    /**
	     * If it's starting of a keyed object.
	     *
	     * "user": {
	     * }
	     */


	    if (stack.length < index + 2 || !utils.isProperty(content)) {
	      return false;
	    }

	    return utils.isOperator(stack[index + 1], [':']) && utils.isPunctuation(stack[index + 2], ['{']);
	  },

	  /**
	   * Returns the new content block for the matched object node. This method
	   * can blindly believe that content, stack is validated properly using
	   * the `matches` method.
	   *
	   * @method getContent
	   *
	   * @param  {Array}   stack
	   * @param  {String}  content
	   * @param  {Number}  index
	   *
	   * @return {Object} { content: String, jump: Number }
	   */
	  getContent: function getContent(stack, content, index) {
	    if (utils.isPunctuation(content, ['{'])) {
	      var _wrappedContent = "".concat(content.trim(), "</span>");

	      var _openingBlock = "".concat(utils.getSpaces(content)).concat(utils.getBlock('object'));

	      var _block = "".concat(_openingBlock).concat(_wrappedContent).concat(utils.getBlockWrapper());

	      return {
	        content: _block,
	        jump: 0
	      };
	    }

	    var operator = "".concat(stack[index + 1], "</span>");
	    var punctuation = "".concat(stack[index + 2], "</span>");
	    var wrappedContent = "".concat(content.trim(), "</span>");
	    var openingBlock = "".concat(utils.getSpaces(content)).concat(utils.getBlock('keyed-object'));
	    var block = "".concat(openingBlock).concat(wrappedContent).concat(operator).concat(punctuation).concat(utils.getBlockWrapper());
	    return {
	      content: block,
	      jump: 2
	    };
	  }
	};

	/*
	 * prism-json-fold
	 *
	 * (c) Harminder Virk <virk@adonisjs.com>
	 *
	 * For the full copyright and license information, please view the LICENSE
	 * file that was distributed with this source code.
	*/


	var arrays = {
	  /**
	   * Returns a boolean telling if stack and the current line
	   * content looks like an object literal
	   *
	   * @method matches
	   *
	   * @param  {Array} stack
	   * @param  {String} content
	   * @param  {Number} index
	   *
	   * @return {Boolean}
	   */
	  matches: function matches(stack, content, index) {
	    /**
	     * If array is part of an array
	     *
	     * [
	     *   [],
	     *   []
	     * ]
	     */
	    if (utils.isPunctuation(content, ['['])) {
	      if (!stack[index - 1]) {
	        return false;
	      }

	      return utils.isPunctuation(stack[index - 1], ['[', ',']);
	    }
	    /**
	     * If it's starting of a keyed object.
	     *
	     * "user": {
	     * }
	     */


	    if (stack.length < index + 2 || !utils.isProperty(content)) {
	      return false;
	    }

	    return utils.isOperator(stack[index + 1], [':']) && utils.isPunctuation(stack[index + 2], ['[']);
	  },

	  /**
	   * Returns the new content block for the matched object node. This method
	   * can blindly believe that content, stack is validated properly using
	   * the `matches` method.
	   *
	   * @method getContent
	   *
	   * @param  {Array}   stack
	   * @param  {String}  content
	   * @param  {Number}  index
	   *
	   * @return {Object} { content: String, jump: Number }
	   */
	  getContent: function getContent(stack, content, index) {
	    if (utils.isPunctuation(content, ['['])) {
	      var _wrappedContent = "".concat(content.trim(), "</span>");

	      var _openingBlock = "".concat(utils.getSpaces(content)).concat(utils.getBlock('array'));

	      var _block = "".concat(_openingBlock).concat(_wrappedContent).concat(utils.getBlockWrapper());

	      return {
	        content: _block,
	        jump: 0
	      };
	    }

	    var operator = "".concat(stack[index + 1], "</span>");
	    var punctuation = "".concat(stack[index + 2], "</span>");
	    var wrappedContent = "".concat(content.trim(), "</span>");
	    var openingBlock = "".concat(utils.getSpaces(content)).concat(utils.getBlock('keyed-array'));
	    var block = "".concat(openingBlock).concat(wrappedContent).concat(operator).concat(punctuation).concat(utils.getBlockWrapper());
	    return {
	      content: block,
	      jump: 2
	    };
	  }
	};

	/*
	 * prism-json-fold
	 *
	 * (c) Harminder Virk <virk@adonisjs.com>
	 *
	 * For the full copyright and license information, please view the LICENSE
	 * file that was distributed with this source code.
	*/
	var parsers = [objects, arrays];

	/*
	 * prism-json-fold
	 *
	 * (c) Harminder Virk <virk@adonisjs.com>
	 *
	 * For the full copyright and license information, please view the LICENSE
	 * file that was distributed with this source code.
	*/



	/**
	 * Parses the prism HTML content and wraps the JSON objects
	 * and arrays inside other spans to make them foldable
	 *
	 * @method parser
	 *
	 * @param  {String} content
	 *
	 * @return {String}
	 */


	var parser = function parser(content) {
	  var lines = content.split('</span>');
	  var newLines = '';
	  var index = 0;

	  var _loop = function _loop() {
	    var line = lines[index];

	    if (utils.isClosingBlock(line)) {
	      /**
	       * Here we close 3 spans in total and here's why
	       *
	       * 1. First span is the to close the current span, which was removed during the `split` call.
	       * 2. 2nd span is the `.block-wrapper` which was opened by the parsers.
	       * 3. 3rd span is the `.block` which was again opened by the parsers.
	       */
	      newLines += "".concat(line, "</span></span></span>");
	    } else {
	      /**
	       * Find the first match parser. To parsers cannot parse the same expression.
	       */
	      var matchingParser = parsers.find(function (parser) {
	        return parser.matches(lines, line, index);
	      });

	      if (matchingParser) {
	        var _matchingParser$getCo = matchingParser.getContent(lines, line, index),
	            jump = _matchingParser$getCo.jump,
	            _content = _matchingParser$getCo.content;

	        newLines += _content;
	        /**
	         * Parsers returns the jump value, which indicates that we can jump x number of
	         * the lines without parsing them.
	         */

	        index = index + jump;
	      } else {
	        newLines += "".concat(line, "</span>");
	      }
	    }

	    index++;
	  };

	  while (index < lines.length) {
	    _loop();
	  }

	  return newLines;
	};

	/*
	 * prims-json-fold
	 *
	 * (c) Harminder Virk <virk@adonisjs.com>
	 *
	 * For the full copyright and license information, please view the LICENSE
	 * file that was distributed with this source code.
	*/


	(function () {
	  /**
	   * Standard check for prism plugins.
	   */
	  if (typeof self !== 'undefined' && !self.Prism || typeof commonjsGlobal !== 'undefined' && !commonjsGlobal.Prism) {
	    return;
	  }

	  Prism.hooks.add('before-insert', function (env) {
	    if (env.language === 'json') {
	      env.highlightedCode = parser(env.highlightedCode);
	    }
	  });
	  /**
	   * Add event listener to toggle the groups
	   */

	  Prism.hooks.add('complete', function (env) {
	    if (env.language === 'json') {
	      env.element.querySelectorAll('.block i').forEach(function (block) {
	        block.addEventListener('click', function () {
	          this.parentElement.classList.toggle('open');
	        });
	      });
	    }
	  });
	})();

	var prismJsonCollapse = {

	};

	return prismJsonCollapse;

}());
