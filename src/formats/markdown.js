/**
 * SCEditor Markdown Format
 * http://www.sceditor.com/
 *
 * Copyright (C) 2017, Sam Clarke (samclarke.com)
 *
 * SCEditor is licensed under the MIT license:
 *	http://www.opensource.org/licenses/mit-license.php
 *
 * @fileoverview SCEditor Markdown Format
 * @author Sam Clarke
 */
(function (sceditor) {
	'use strict';

	var utils = sceditor.utils;
	var extend = utils.extend;

	var getEditorCommand = sceditor.command.get;

	var defaultCommandsOverrides = {
		bold: {
			txtExec: ['**', '**']
		},
		italic: {
			txtExec: ['*', '*']
		},
		underline: {
			txtExec: ['<u>', '</u>']
		},
		strike: {
			txtExec: ['~~', '~~']
		},
		subscript: {
			txtExec: ['<sub>', '</sub>']
		},
		superscript: {
			txtExec: ['<sup>', '</sup>']
		},
		left: {
			txtExec: ['', '']
		},
		center: {
			txtExec: ['', '']
		},
		right: {
			txtExec: ['', '']
		},
		justify: {
			txtExec: ['', '']
		},
		font: {
			txtExec: function (caller) {
				var editor = this;

				getEditorCommand('font')._dropDown(
					editor,
					caller,
					function (font) {
						editor.insertText(
							'<span style="font-family:' + font + ';">',
							'</span>'
						);
					}
				);
			}
		},
		size: {
			txtExec: function (caller) {
				var editor = this;

				getEditorCommand('size')._dropDown(
					editor,
					caller,
					function (size) {
						editor.insertText(
							'<span style="font-size:' + size + ';">',
							'</span>'
						);
					}
				);
			}
		},
		color: {
			txtExec: function (caller) {
				var editor = this;

				getEditorCommand('color')._dropDown(
					editor,
					caller,
					function (color) {
						editor.insertText(
							'<span style="color:' + color + ';">',
							'</span>'
						);
					}
				);
			}
		},
		bulletlist: {
			txtExec: function (caller, selected) {
				if (selected) {
					this.insertText(
						selected.split('\n').map(function (line) {
							return line ? '- ' + line : line;
						}).join('\n')
					);
				} else {
					this.insertText('- ');
				}
			}
		},
		orderedlist: {
			txtExec: function (caller, selected) {
				if (selected) {
					var counter = 1;
					this.insertText(
						selected.split('\n').map(function (line) {
							return line ? (counter++) + '. ' + line : line;
						}).join('\n')
					);
				} else {
					this.insertText('1. ');
				}
			}
		},
		table: {
			txtExec: ['| ', ' |']
		},
		horizontalrule: {
			txtExec: ['\n\n---\n\n', '']
		},
		code: {
			txtExec: ['`', '`']
		},
		image: {
			txtExec: function (caller, selected) {
				var editor = this;

				getEditorCommand('image')._dropDown(
					editor,
					caller,
					selected,
					function (url) {
						editor.insertText(
							'![' + (selected || '') + '](' + url + ')'
						);
					}
				);
			}
		},
		email: {
			txtExec: function (caller, selected) {
				var editor = this;

				getEditorCommand('email')._dropDown(
					editor,
					caller,
					function (url, text) {
						editor.insertText(
							'[' + (text || selected || url) +
							'](mailto:' + url + ')'
						);
					}
				);
			}
		},
		link: {
			txtExec: function (caller, selected) {
				var editor = this;

				getEditorCommand('link')._dropDown(
					editor,
					caller,
					function (url, text) {
						editor.insertText(
							'[' + (text || selected || url) +
							'](' + url + ')'
						);
					}
				);
			}
		},
		quote: {
			txtExec: function (caller, selected) {
				if (selected) {
					this.insertText(
						selected.split('\n').map(function (line) {
							return '> ' + line;
						}).join('\n')
					);
				} else {
					this.insertText('> ');
				}
			}
		},
		youtube: {
			txtExec: function (caller) {
				var editor = this;

				getEditorCommand('youtube')._dropDown(
					editor,
					caller,
					function (id, time) {
						editor.insertText(
							'[![YouTube](https://img.youtube.com/vi/' + id +
							'/0.jpg)](https://www.youtube.com/watch?v=' + id +
							(time ? '&t=' + time : '') + ')'
						);
					}
				);
			}
		},
		rtl: {
			txtExec: ['<div dir="rtl">\n', '\n</div>']
		},
		ltr: {
			txtExec: ['<div dir="ltr">\n', '\n</div>']
		}
	};

	/**
	 * Escapes HTML special characters
	 * @param  {string} str
	 * @return {string}
	 * @private
	 */
	function escapeHtml(str) {
		return (str || '').replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
	}

	/**
	 * Converts inline Markdown syntax to HTML
	 * @param  {string} text
	 * @return {string}
	 * @private
	 */
	function parseInline(text) {
		var codeSpans = [];

		// Protect inline code spans before any other processing
		text = text.replace(/`([^`\n]+)`/g, function (match, code) {
			var idx = codeSpans.length;
			codeSpans.push('<code>' + escapeHtml(code) + '</code>');
			return '\x00' + idx + '\x00';
		});

		// Escape HTML entities in non-code text
		text = escapeHtml(text);

		// Images (must come before links)
		text = text.replace(
			/!\[([^\]]*)\]\(([^)\s"]+)(?:\s+"([^"]*)")?\)/g,
			function (m, alt, src, title) {
				return '<img src="' + src + '" alt="' + alt + '"' +
					(title ? ' title="' + title + '"' : '') + '>';
			}
		);

		// Links
		text = text.replace(
			/\[([^\]]+)\]\(([^)\s"]+)(?:\s+"([^"]*)")?\)/g,
			function (m, linkText, href, title) {
				return '<a href="' + href + '"' +
					(title ? ' title="' + title + '"' : '') + '>' +
					linkText + '</a>';
			}
		);

		// Bold + Italic (must come before bold and italic individually)
		text = text.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
		text = text.replace(/___([^_]+)___/g, '<strong><em>$1</em></strong>');

		// Bold
		text = text.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
		text = text.replace(/__([^_\n]+)__/g, '<strong>$1</strong>');

		// Italic
		text = text.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
		text = text.replace(/_([^_\n]+)_/g, '<em>$1</em>');

		// Strikethrough
		text = text.replace(/~~([^~\n]+)~~/g, '<del>$1</del>');

		// Hard line break: two or more spaces before newline
		text = text.replace(/  +\n/g, '<br>\n');

		// Restore code spans
		text = text.replace(/\x00(\d+)\x00/g, function (m, idx) {
			return codeSpans[parseInt(idx, 10)];
		});

		return text;
	}

	/**
	 * Converts Markdown source to HTML
	 *
	 * @param  {boolean} isFragment
	 * @param  {string}  source
	 * @return {string}
	 * @private
	 */
	function toHtml(isFragment, source) {
		if (!source) {
			return '';
		}

		var output = [];
		var lines = source.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
		var i = 0;
		var n = lines.length;

		while (i < n) {
			var line = lines[i];

			// Fenced code block
			if (/^```/.test(line)) {
				var lang = line.slice(3).trim();
				var codeLines = [];
				i++;
				while (i < n && !/^```/.test(lines[i])) {
					codeLines.push(lines[i]);
					i++;
				}
				i++; // skip closing ```
				output.push(
					'<pre><code' +
					(lang ? ' class="language-' + lang + '"' : '') +
					'>' + escapeHtml(codeLines.join('\n')) + '</code></pre>'
				);
				continue;
			}

			// ATX heading
			var headMatch = line.match(/^(#{1,6})\s+(.*?)(?:\s+#+\s*)?$/);
			if (headMatch) {
				var level = headMatch[1].length;
				output.push(
					'<h' + level + '>' +
					parseInline(headMatch[2]) +
					'</h' + level + '>'
				);
				i++;
				continue;
			}

			// Horizontal rule (3+ of -, *, _ optionally separated by spaces)
			if (/^[ ]{0,3}([-*_])[ \t]*\1[ \t]*\1[ \t\1]*$/.test(line)) {
				output.push('<hr>');
				i++;
				continue;
			}

			// Blockquote
			if (/^>/.test(line)) {
				var bqLines = [];
				while (i < n && /^>/.test(lines[i])) {
					bqLines.push(lines[i].replace(/^>\s?/, ''));
					i++;
				}
				output.push(
					'<blockquote>' +
					toHtml(true, bqLines.join('\n')) +
					'</blockquote>'
				);
				continue;
			}

			// Unordered list
			if (/^[ ]{0,3}[-*+]\s/.test(line)) {
				var ulItems = [];
				while (i < n && /^[ ]{0,3}[-*+]\s/.test(lines[i])) {
					ulItems.push(
						'<li>' +
						parseInline(lines[i].replace(/^[ ]{0,3}[-*+]\s+/, '')) +
						'</li>'
					);
					i++;
				}
				output.push('<ul>' + ulItems.join('') + '</ul>');
				continue;
			}

			// Ordered list
			if (/^[ ]{0,3}\d+\.\s/.test(line)) {
				var olItems = [];
				while (i < n && /^[ ]{0,3}\d+\.\s/.test(lines[i])) {
					olItems.push(
						'<li>' +
						parseInline(lines[i].replace(/^[ ]{0,3}\d+\.\s+/, '')) +
						'</li>'
					);
					i++;
				}
				output.push('<ol>' + olItems.join('') + '</ol>');
				continue;
			}

			// Blank line
			if (line.trim() === '') {
				i++;
				continue;
			}

			// Paragraph: collect lines until a blank line or
			// block element starts
			var paraLines = [];
			while (
				i < n &&
				lines[i].trim() !== '' &&
				!/^```/.test(lines[i]) &&
				!/^#{1,6}\s/.test(lines[i]) &&
				!/^[ ]{0,3}([-*_])[ \t]*\1[ \t]*\1[ \t\1]*$/.test(lines[i]) &&
				!/^>/.test(lines[i]) &&
				!/^[ ]{0,3}[-*+]\s/.test(lines[i]) &&
				!/^[ ]{0,3}\d+\.\s/.test(lines[i])
			) {
				paraLines.push(lines[i]);
				i++;
			}

			if (paraLines.length > 0) {
				var paraHtml = parseInline(paraLines.join('\n'));
				output.push(isFragment ? paraHtml : '<p>' + paraHtml + '</p>');
			}
		}

		return output.join('\n');
	}

	/**
	 * Recursively converts a DOM node to Markdown
	 * @param  {Node}    node
	 * @param  {boolean} inCode  Whether inside a code element
	 * @return {string}
	 * @private
	 */
	function nodeToMarkdown(node) {
		if (node.nodeType === 3) {
			return node.nodeValue;
		}

		if (node.nodeType !== 1) {
			return '';
		}

		var tagName = node.nodeName.toLowerCase();

		if (tagName === 'script' || tagName === 'style') {
			return '';
		}

		function childrenToMd(n, ic) {
			var result = '';
			var child = n.firstChild;
			while (child) {
				result += nodeToMarkdown(child, ic);
				child = child.nextSibling;
			}
			return result;
		}

		switch (tagName) {
			case 'h1': return '# ' + childrenToMd(node).trim() + '\n\n';
			case 'h2': return '## ' + childrenToMd(node).trim() + '\n\n';
			case 'h3': return '### ' + childrenToMd(node).trim() + '\n\n';
			case 'h4': return '#### ' + childrenToMd(node).trim() + '\n\n';
			case 'h5': return '##### ' + childrenToMd(node).trim() + '\n\n';
			case 'h6': return '###### ' + childrenToMd(node).trim() + '\n\n';

			case 'p': {
				var pText = childrenToMd(node).trim();
				return pText ? pText + '\n\n' : '';
			}

			case 'br': return '\n';
			case 'hr': return '\n---\n\n';

			case 'strong':
			case 'b':
				return '**' + childrenToMd(node) + '**';

			case 'em':
			case 'i':
				return '*' + childrenToMd(node) + '*';

			case 'del':
			case 's':
			case 'strike':
				return '~~' + childrenToMd(node) + '~~';

			// No Markdown equivalent — keep as HTML
			case 'u':
				return '<u>' + childrenToMd(node) + '</u>';
			case 'sub':
				return '<sub>' + childrenToMd(node) + '</sub>';
			case 'sup':
				return '<sup>' + childrenToMd(node) + '</sup>';

			case 'code':
				if (node.parentNode &&
					node.parentNode.nodeName.toLowerCase() === 'pre') {
					return childrenToMd(node, true);
				}
				return '`' + (node.textContent || node.innerText || '') + '`';

			case 'pre': {
				var preInner = node.firstChild &&
					node.firstChild.nodeName.toLowerCase() === 'code'
					? node.firstChild
					: node;
				var lang = '';
				var cls = preInner.className || '';
				var langMatch = cls.match(/language-(\w+)/);
				if (langMatch) {
					lang = langMatch[1];
				}
				var preText = preInner.textContent || preInner.innerText || '';
				return '\n```' + lang + '\n' + preText + '\n```\n\n';
			}

			case 'blockquote': {
				var bqText = childrenToMd(node).trim();
				return bqText.split('\n').map(function (l) {
					return '> ' + l;
				}).join('\n') + '\n\n';
			}

			case 'ul': {
				var ulMd = '';
				var ulChild = node.firstChild;
				while (ulChild) {
					if (ulChild.nodeName.toLowerCase() === 'li') {
						ulMd += '- ' + childrenToMd(ulChild).trim() + '\n';
					}
					ulChild = ulChild.nextSibling;
				}
				return ulMd + '\n';
			}

			case 'ol': {
				var olMd = '';
				var olCounter = 1;
				var olChild = node.firstChild;
				while (olChild) {
					if (olChild.nodeName.toLowerCase() === 'li') {
						olMd += olCounter + '. ' +
						childrenToMd(olChild).trim() + '\n';
						olCounter++;
					}
					olChild = olChild.nextSibling;
				}
				return olMd + '\n';
			}

			case 'li':
				return childrenToMd(node);

			case 'a': {
				var href = node.getAttribute('href') || '';
				return '[' + childrenToMd(node) + '](' + href + ')';
			}

			case 'img': {
				var src = node.getAttribute('src') || '';
				var alt = node.getAttribute('alt') || '';
				return '![' + alt + '](' + src + ')';
			}

			case 'table': {
				var rows = [];

				function collectRows(n) {
					var c = n.firstChild;
					while (c) {
						var cn = c.nodeName.toLowerCase();
						if (cn === 'tr') {
							rows.push(c);
						} else if (
							cn === 'thead' ||
							cn === 'tbody' ||
							cn === 'tfoot'
						) {
							collectRows(c);
						}
						c = c.nextSibling;
					}
				}

				collectRows(node);

				var tableMd = '';
				rows.forEach(function (tr, idx) {
					var cells = [];
					var cell = tr.firstChild;
					while (cell) {
						var cn = cell.nodeName.toLowerCase();
						if (cn === 'td' || cn === 'th') {
							cells.push(childrenToMd(cell).trim());
						}
						cell = cell.nextSibling;
					}
					if (cells.length) {
						tableMd += '| ' + cells.join(' | ') + ' |\n';
						if (idx === 0) {
							tableMd += '| ' + cells.map(function () {
								return '---';
							}).join(' | ') + ' |\n';
						}
					}
				});

				return tableMd + '\n';
			}

			case 'iframe': {
				var ytId = node.getAttribute('data-youtube-id');
				if (ytId) {
					return '[![YouTube](https://img.youtube.com/vi/' + ytId +
						'/0.jpg)](https://www.youtube.com/watch?v=' + ytId + ')';
				}
				return '';
			}

			case 'div':
			case 'section':
			case 'article':
			case 'main':
			case 'header':
			case 'footer':
			case 'nav':
			case 'aside': {
				var divContent = childrenToMd(node);
				return divContent + (/\n$/.test(divContent) ? '' : '\n');
			}

			case 'thead':
			case 'tbody':
			case 'tfoot':
			case 'tr':
			case 'td':
			case 'th':
			case 'span':
			default:
				return childrenToMd(node);
		}
	}

	/**
	 * Converts HTML from the WYSIWYG editor to Markdown
	 *
	 * @param  {boolean}      isFragment
	 * @param  {string}       html
	 * @param  {Document}     context
	 * @return {string}
	 * @private
	 */
	function toSource(isFragment, html, context) {
		context = context || document;

		var container = context.createElement('div');
		container.innerHTML = html;

		// Remove editor-internal elements
		var ignored = container.getElementsByClassName('sceditor-ignore');
		while (ignored.length) {
			ignored[0].parentNode.removeChild(ignored[0]);
		}

		var markdown = nodeToMarkdown(container);

		// Collapse 3+ consecutive newlines to 2
		markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();

		return markdown;
	}

	/**
	 * SCEditor Markdown format
	 *
	 * @class markdownFormat
	 * @since v3.3.0
	 */
	function markdownFormat() {
		var base = this;

		base.init = function () {
			this.commands = extend(
				true, {}, defaultCommandsOverrides, this.commands
			);
		};

		base.toHtml = toHtml.bind(null, false);
		base.fragmentToHtml = toHtml.bind(null, true);
		base.toSource = toSource.bind(null, false);
		base.fragmentToSource = toSource.bind(null, true);
	}

	sceditor.formats.markdown = markdownFormat;
}(sceditor));
