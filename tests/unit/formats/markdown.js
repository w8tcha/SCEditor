import defaultOptions from 'src/lib/defaultOptions.js';
import 'src/formats/markdown.js';

var moduleSetup = function () {
	this.mockEditor = {
		opts: $.extend({}, defaultOptions),
		commands: {}
	};

	this.format = new sceditor.formats.markdown();
	this.format.init.call(this.mockEditor);

	this.toHtml = function (md) {
		return this.format.toHtml(md);
	};

	this.toSource = function (html) {
		return this.format.toSource(html, document);
	};
};


QUnit.module('formats/markdown', {
	beforeEach: moduleSetup
});


QUnit.test('toHtml - headings', function (assert) {
	assert.equal(this.toHtml('# Heading 1'), '<h1>Heading 1</h1>', 'h1');
	assert.equal(this.toHtml('## Heading 2'), '<h2>Heading 2</h2>', 'h2');
	assert.equal(this.toHtml('### Heading 3'), '<h3>Heading 3</h3>', 'h3');
});


QUnit.test('toHtml - paragraphs', function (assert) {
	assert.equal(
		this.toHtml('Hello world'),
		'<p>Hello world</p>',
		'single paragraph'
	);

	assert.equal(
		this.toHtml('First\n\nSecond'),
		'<p>First</p>\n<p>Second</p>',
		'two paragraphs'
	);
});


QUnit.test('toHtml - inline formatting', function (assert) {
	assert.equal(this.toHtml('**bold**'), '<p><strong>bold</strong></p>', 'bold **');
	assert.equal(this.toHtml('__bold__'), '<p><strong>bold</strong></p>', 'bold __');
	assert.equal(this.toHtml('*italic*'), '<p><em>italic</em></p>', 'italic *');
	assert.equal(this.toHtml('_italic_'), '<p><em>italic</em></p>', 'italic _');
	assert.equal(this.toHtml('~~strike~~'), '<p><del>strike</del></p>', 'strikethrough');
	assert.equal(this.toHtml('`code`'), '<p><code>code</code></p>', 'inline code');
});


QUnit.test('toHtml - links and images', function (assert) {
	assert.equal(
		this.toHtml('[link](http://example.com)'),
		'<p><a href="http://example.com">link</a></p>',
		'link'
	);

	assert.equal(
		this.toHtml('![alt](http://example.com/img.png)'),
		'<p><img src="http://example.com/img.png" alt="alt"></p>',
		'image'
	);
});


QUnit.test('toHtml - lists', function (assert) {
	assert.equal(
		this.toHtml('- item 1\n- item 2'),
		'<ul><li>item 1</li><li>item 2</li></ul>',
		'unordered list'
	);

	assert.equal(
		this.toHtml('1. first\n2. second'),
		'<ol><li>first</li><li>second</li></ol>',
		'ordered list'
	);
});


QUnit.test('toHtml - blockquote', function (assert) {
	assert.equal(
		this.toHtml('> quoted text'),
		'<blockquote>quoted text</blockquote>',
		'blockquote'
	);
});


QUnit.test('toHtml - horizontal rule', function (assert) {
	assert.equal(this.toHtml('---'), '<hr>', '--- rule');
	assert.equal(this.toHtml('***'), '<hr>', '*** rule');
	assert.equal(this.toHtml('___'), '<hr>', '___ rule');
});


QUnit.test('toHtml - code block', function (assert) {
	assert.equal(
		this.toHtml('```\nconsole.log("hi");\n```'),
		'<pre><code>console.log(&quot;hi&quot;);</code></pre>',
		'fenced code block'
	);

	assert.equal(
		this.toHtml('```js\nvar x = 1;\n```'),
		'<pre><code class="language-js">var x = 1;</code></pre>',
		'fenced code block with language'
	);
});


QUnit.test('toSource - headings', function (assert) {
	assert.equal(this.toSource('<h1>Heading 1</h1>'), '# Heading 1', 'h1');
	assert.equal(this.toSource('<h2>Heading 2</h2>'), '## Heading 2', 'h2');
	assert.equal(this.toSource('<h3>Heading 3</h3>'), '### Heading 3', 'h3');
});


QUnit.test('toSource - paragraphs', function (assert) {
	assert.equal(
		this.toSource('<p>Hello world</p>'),
		'Hello world',
		'single paragraph'
	);

	assert.equal(
		this.toSource('<p>First</p><p>Second</p>'),
		'First\n\nSecond',
		'two paragraphs'
	);
});


QUnit.test('toSource - inline formatting', function (assert) {
	assert.equal(
		this.toSource('<p><strong>bold</strong></p>'),
		'**bold**',
		'strong'
	);
	assert.equal(
		this.toSource('<p><em>italic</em></p>'),
		'*italic*',
		'em'
	);
	assert.equal(
		this.toSource('<p><del>strike</del></p>'),
		'~~strike~~',
		'del'
	);
	assert.equal(
		this.toSource('<p><code>code</code></p>'),
		'`code`',
		'inline code'
	);
});


QUnit.test('toSource - links and images', function (assert) {
	assert.equal(
		this.toSource('<p><a href="http://example.com">link</a></p>'),
		'[link](http://example.com)',
		'link'
	);

	assert.equal(
		this.toSource('<p><img src="http://example.com/img.png" alt="alt"></p>'),
		'![alt](http://example.com/img.png)',
		'image'
	);
});


QUnit.test('toSource - lists', function (assert) {
	assert.equal(
		this.toSource('<ul><li>item 1</li><li>item 2</li></ul>'),
		'- item 1\n- item 2',
		'unordered list'
	);

	assert.equal(
		this.toSource('<ol><li>first</li><li>second</li></ol>'),
		'1. first\n2. second',
		'ordered list'
	);
});


QUnit.test('toSource - blockquote', function (assert) {
	assert.equal(
		this.toSource('<blockquote><p>quoted text</p></blockquote>'),
		'> quoted text',
		'blockquote'
	);
});


QUnit.test('toSource - horizontal rule', function (assert) {
	assert.equal(this.toSource('<hr>'), '---', 'hr');
});


QUnit.test('toSource - code block', function (assert) {
	assert.equal(
		this.toSource('<pre><code>var x = 1;</code></pre>'),
		'```\nvar x = 1;\n```',
		'code block'
	);

	assert.equal(
		this.toSource('<pre><code class="language-js">var x = 1;</code></pre>'),
		'```js\nvar x = 1;\n```',
		'code block with language'
	);
});


QUnit.test('roundtrip - Markdown → HTML → Markdown', function (assert) {
	var samples = [
		'# Hello World',
		'**bold** and *italic*',
		'- item 1\n- item 2',
		'1. first\n2. second',
		'[link](http://example.com)',
		'> blockquote'
	];

	samples.forEach(function (md) {
		var html = this.toHtml(md);
		var result = this.toSource(html);
		assert.equal(result, md, 'roundtrip: ' + md);
	}.bind(this));
});
