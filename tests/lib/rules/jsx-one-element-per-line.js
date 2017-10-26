/**
 * @fileoverview Limit to one element tag per line in JSX
 * @author Mark Ivan Allen <Vydia.com>
 */

'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/jsx-one-element-per-line');
const RuleTester = require('eslint').RuleTester;

const parserOptions = {
  ecmaVersion: 8,
  sourceType: 'module',
  ecmaFeatures: {
    experimentalObjectRestSpread: true,
    jsx: true
  }
};

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({parserOptions});
ruleTester.run('jsx-one-element-per-line', rule, {

  // valid: [],
  // invalid: [{
  // //   code: [
  // //     '<div>',
  // //     '  {"foo"} <input />',
  // //     '</div>'
  // //   ].join('\n'),
  // //   output: [
  // //     '<div>',
  // //     '  {"foo"}',
  // //     '{" "}',
  // //     '<input />',
  // //     '</div>'
  // //   ].join('\n'),
  // //   errors: [
  // //     {message: 'Literal ` ` must be placed on a new line'},
  // //     {message: 'Opening tag for Element `input` must be placed on a new line'}
  // //   ],
  // //   parserOptions: parserOptions
  //   code: [
  //     '<div>',
  //     '  {"foo"} bar',
  //     '</div>'
  //   ].join('\n'),
  //   output: [
  //     '<div>',
  //     '  {"foo"}',
  //     '{\' bar\'}', // TODO: Must escape before injecting literal?
  //     '</div>'
  //   ].join('\n'),
  //   errors: [
  //     {message: 'Literal ` bar` must be placed on a new line'}
  //   ],
  //   parserOptions: parserOptions
  // }, {
  //   code: [
  //     '<div>',
  //     '  foo {"bar"}',
  //     '</div>'
  //   ].join('\n'),
  //   output: [
  //     '<div>',
  //     '  {\'foo \'}', // TODO: Must escape before injecting literal?
  //     '{"bar"}',
  //     '</div>'
  //   ].join('\n'),
  //   errors: [
  //     {message: 'Literal `foo ` must be placed on a new line'}
  //   ],
  //   parserOptions: parserOptions
  // }]

  valid: [{
    code: '<App />'
  }, {
    code: '<App></App>'
  }, {
    // TODO: Contitionally support this
    code: '<App>{"foo"}</App>'
  }, {
    code: '<App>foo</App>'
  }, {
    code: '<App foo="bar" />'
  }, {
    code: [
      '<App>',
      '  <Foo />',
      '</App>'
    ].join('\n')
  }, {
    code: [
      '<App>',
      '  <Foo />',
      '  <Bar />',
      '</App>'
    ].join('\n')
  }, {
    code: [
      '<App>',
      '  <Foo></Foo>',
      '</App>'
    ].join('\n')
  }, {
    code: [
      // TODO: Offset start and end line by number of leading and trailing new line chars in literal.
      '<App>',
      '  foo bar baz  whatever  ',
      '</App>'
    ].join('\n')
  }, {
    code: [
      '<App>',
      '  <Foo>',
      '  </Foo>',
      '</App>'
    ].join('\n')
  }, {
    code: [
      '<App',
      '  foo="bar"',
      '>',
      '<Foo />',
      '</App>'
    ].join('\n')
  }, {
    code: [
      '<',
      'App',
      '>',
      '  <',
      '    Foo',
      '  />',
      '</',
      'App',
      '>'
    ].join('\n')
  }],

  invalid: [{
    code: [
      '<App>',
      '  <Foo /><Bar />',
      '</App>'
    ].join('\n'),
    output: [
      '<App>',
      '  <Foo />',
      '<Bar />',
      '</App>'
    ].join('\n'),
    errors: [{message: 'Opening tag for Element `Bar` must be placed on a new line'}],
    parserOptions: parserOptions
  }, {
    code: [
      '<div>',
      '  <span />foo',
      '</div>'
    ].join('\n'),
    output: [
      '<div>',
      '  <span />',
      '{\'foo\'}',
      '</div>'
    ].join('\n'),
    errors: [{message: 'Literal `foo` must be placed on a new line'}],
    parserOptions: parserOptions
  }, {
    code: [
      '<div>',
      '  <span />{"foo"}',
      '</div>'
    ].join('\n'),
    output: [
      '<div>',
      '  <span />',
      '{"foo"}',
      '</div>'
    ].join('\n'),
    errors: [{message: 'JSXExpressionContainer `{"foo"}` must be placed on a new line'}],
    parserOptions: parserOptions
  }, {
    code: [
      '<div>',
      '  foo<input />',
      '</div>'
    ].join('\n'),
    // TODO: Perhaps don't need to wrap in JSXExpressionContainer.
    output: [
      '<div>',
      '  {\'foo\'}',
      '<input />',
      '</div>'
    ].join('\n'),
    errors: [{message: 'Literal `foo` must be placed on a new line'}],
    parserOptions: parserOptions
  }, {
    code: [
      '<div>',
      '  {"foo"}<span />',
      '</div>'
    ].join('\n'),
    output: [
      '<div>',
      '  {"foo"}',
      '<span />',
      '</div>'
    ].join('\n'),
    errors: [{message: 'Opening tag for Element `span` must be placed on a new line'}],
    parserOptions: parserOptions
  }, {
    code: [
      '<div>',
      '  foo <input />',
      '</div>'
    ].join('\n'),
    output: [
      '<div>',
      '  {\'foo \'}',
      '<input />',
      '</div>'
    ].join('\n'),
    errors: [{message: 'Literal `foo ` must be placed on a new line'}],
    parserOptions: parserOptions
  }, {
    code: [
      '<div>',
      '  <span /> <input />',
      '</div>'
    ].join('\n'),
    output: [
      '<div>',
      '  <span />',
      '{\' \'}',
      '<input />',
      '</div>'
    ].join('\n'),
    errors: [
      {message: 'Literal ` ` must be placed on a new line'},
      {message: 'Opening tag for Element `input` must be placed on a new line'}
    ],
    parserOptions: parserOptions
  }, {
    code: [
      '<div>',
      '  <input /> foo',
      '</div>'
    ].join('\n'),
    // output: TODO
    errors: [{message: 'Literal ` foo` must be placed on a new line'}],
    parserOptions: parserOptions
  }, {
    code: [
      '<div>',
      '  {"foo"} <input />',
      '</div>'
    ].join('\n'),
    // output: TODO
    errors: [
      {message: 'Literal ` ` must be placed on a new line'},
      {message: 'Opening tag for Element `input` must be placed on a new line'}
    ],
    parserOptions: parserOptions
  }, {
    code: [
      '<div>',
      '  {"foo"} bar',
      '</div>'
    ].join('\n'),
    // output: TODO
    errors: [{message: 'Literal ` bar` must be placed on a new line'}],
    parserOptions: parserOptions
  }, {
    code: [
      '<div>',
      '  foo {"bar"}',
      '</div>'
    ].join('\n'),
    // output: TODO
    errors: [
      {message: 'Literal `foo ` must be placed on a new line'},
      {message: 'JSXExpressionContainer `{"bar"}` must be placed on a new line'}
    ],
    parserOptions: parserOptions
  }, {
    code: [
      '<div>',
      '  <input /> {"foo"}',
      '</div>'
    ].join('\n'),
    // output: TODO
    errors: [
      {message: 'Literal ` ` must be placed on a new line'},
      {message: 'JSXExpressionContainer `{"foo"}` must be placed on a new line'}
    ],
    parserOptions: parserOptions
  }, {
    code: [
      '<App>',
      '  <Foo></Foo><Bar></Bar>',
      '</App>'
    ].join('\n'),
    output: [
      '<App>',
      '  <Foo></Foo>',
      '<Bar></Bar>',
      '</App>'
    ].join('\n'),
    errors: [{message: 'Opening tag for Element `Bar` must be placed on a new line'}],
    parserOptions: parserOptions
  }, {
    code: [
      '<App>',
      '<Foo></Foo></App>'
    ].join('\n'),
    output: [
      '<App>',
      '<Foo></Foo>',
      '</App>'
    ].join('\n'),
    errors: [{message: 'Closing tag for Element `App` must be placed on a new line'}],
    parserOptions: parserOptions
  }, {
    code: [
      '<App><Foo />',
      '</App>'
    ].join('\n'),
    output: [
      '<App>',
      '<Foo />',
      '</App>'
    ].join('\n'),
    errors: [{message: 'Opening tag for Element `Foo` must be placed on a new line'}],
    parserOptions: parserOptions
  }, {
    code: [
      '<App>',
      '<Foo/></App>'
    ].join('\n'),
    output: [
      '<App>',
      '<Foo/>',
      '</App>'
    ].join('\n'),
    errors: [{message: 'Closing tag for Element `App` must be placed on a new line'}],
    parserOptions: parserOptions
  }, {
    code: [
      '<App><Foo',
      '/>',
      '</App>'
    ].join('\n'),
    output: [
      '<App>',
      '<Foo',
      '/>',
      '</App>'
    ].join('\n'),
    errors: [{message: 'Opening tag for Element `Foo` must be placed on a new line'}],
    parserOptions: parserOptions
  }, {
    code: [
      '<App',
      '>',
      '<Foo /></App>'
    ].join('\n'),
    output: [
      '<App',
      '>',
      '<Foo />',
      '</App>'
    ].join('\n'),
    errors: [{message: 'Closing tag for Element `App` must be placed on a new line'}],
    parserOptions: parserOptions
  }, {
    code: [
      '<App',
      '>',
      '<Foo',
      '/></App>'
    ].join('\n'),
    output: [
      '<App',
      '>',
      '<Foo',
      '/>',
      '</App>'
    ].join('\n'),
    errors: [{message: 'Closing tag for Element `App` must be placed on a new line'}],
    parserOptions: parserOptions
  }, {
    code: [
      '<App',
      '><Foo />',
      '</App>'
    ].join('\n'),
    output: [
      '<App',
      '>',
      '<Foo />',
      '</App>'
    ].join('\n'),
    errors: [{message: 'Opening tag for Element `Foo` must be placed on a new line'}],
    parserOptions: parserOptions
  }, {
    code: [
      '<App>',
      '  <Foo></Foo',
      '></App>'
    ].join('\n'),
    output: [
      '<App>',
      '  <Foo></Foo',
      '>',
      '</App>'
    ].join('\n'),
    errors: [{message: 'Closing tag for Element `App` must be placed on a new line'}],
    parserOptions: parserOptions
  }, {
    code: [
      '<App>',
      '  <Foo></',
      'Foo></App>'
    ].join('\n'),
    output: [
      '<App>',
      '  <Foo></',
      'Foo>',
      '</App>'
    ].join('\n'),
    errors: [{message: 'Closing tag for Element `App` must be placed on a new line'}],
    parserOptions: parserOptions
  }, {
    code: [
      '<App>',
      '  <Foo></',
      'Foo></App>'
    ].join('\n'),
    output: [
      '<App>',
      '  <Foo></',
      'Foo>',
      '</App>'
    ].join('\n'),
    errors: [{message: 'Closing tag for Element `App` must be placed on a new line'}],
    parserOptions: parserOptions
  }, {
    code: [
      '<App>',
      '  <Foo></',
      'Foo><Bar />',
      '</App>'
    ].join('\n'),
    output: [
      '<App>',
      '  <Foo></',
      'Foo>',
      '<Bar />',
      '</App>'
    ].join('\n'),
    errors: [{message: 'Opening tag for Element `Bar` must be placed on a new line'}],
    parserOptions: parserOptions
  }, {
    code: [
      '<App>',
      '  <Foo>',
      '    <Bar /></Foo>',
      '</App>'
    ].join('\n'),
    output: [
      '<App>',
      '  <Foo>',
      '    <Bar />',
      '</Foo>',
      '</App>'
    ].join('\n'),
    errors: [{message: 'Closing tag for Element `Foo` must be placed on a new line'}],
    parserOptions: parserOptions
  }]
});
