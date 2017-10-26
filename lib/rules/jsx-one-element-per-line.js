/**
 * @fileoverview Limit to one element tag per line in JSX
 * @author Mark Ivan Allen <Vydia.com>
 */

'use strict';

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    docs: {
      description: 'Limit to one element tag per line in JSX',
      category: 'Stylistic Issues',
      recommended: false
    },
    fixable: 'whitespace',
    schema: []
  },

  create: function (context) {
    const sourceCode = context.getSourceCode();

    function generateFixFunction(elementInLine, flags = {}) {
      const nodeText = sourceCode.getText(elementInLine);

      if (flags.wrapWithJSXExpressionContainer) {
        const stripped = nodeText.replace(/\n$/, '');
        const trailingNewLine = stripped === nodeText ? '' : '\n';

        return function (fixer) {
          return fixer.replaceText(elementInLine, `\n{'${stripped}'}${trailingNewLine}`);
        };
      }

      return function (fixer) {
        return fixer.replaceText(elementInLine, `\n${nodeText}`);
      };
    }

    function elementDoesOpenOrCloseOnLine (element, line) {
      const reportableLines = [element, element.openingElement, element.closingElement].reduce((lines, el) => {
        if (!el) {
          return lines;
        }

        return lines.concat([el.loc.start.line, el.loc.end.line]);
      }, []);

      return reportableLines.indexOf(line) !== -1;
    }

    function printNodeText (node) {
      /* eslint-disable */
      console.log(`\`${sourceCode.getText(node)}\``);
      /* eslint-enable */
    }

    return {
      // TODO
      // JSXExpressionContainer: function (node) {
      Literal: function (node) {
        if (node.raw.match(/^\s*\n\s*$/)) {
          return;
        }

        /* eslint-disable */
        debugger
        /* eslint-enable */

        const openingStartLine = node.loc.start.line;

        // Parent
        if (node.parent && node.parent.openingElement) {
          const parentOpeningStartLine = node.parent.openingElement.loc.end.line;

          if (parentOpeningStartLine === openingStartLine) {
            context.report({
              node: node,
              message: `Literal \`${node.raw.replace(/\n$/, '')}\` must be placed on a new line`,
              fix: generateFixFunction(node, {wrapWithJSXExpressionContainer: true})
            });
          }
        }

        // Siblings
        if (node.parent && node.parent.children && node.parent.children.length) {
          // const firstSiblingOnLine = node.parent.children.find(sibling => (
          //   sibling.type === 'JSXElement' && elementDoesOpenOrCloseOnLine(sibling, openingStartLine)
          // ));

          // TODO: Stop at first `find`.
          const siblingsOnLine = node.parent.children.filter(sibling => (
            // Ignore literals that contain line breaks
            !(sibling.type === 'Literal' && sibling.raw.match(/\n/)) &&
              elementDoesOpenOrCloseOnLine(sibling, openingStartLine)
          ));

          const firstSiblingOnLine = siblingsOnLine[0];

          console.log('node');
          printNodeText(node);

          console.log('siblingsOnLine');
          siblingsOnLine.forEach(printNodeText);

          console.log('firstSiblingOnLine');
          printNodeText(firstSiblingOnLine);

          /* eslint-disable */
          debugger
          /* eslint-enable */

          if (firstSiblingOnLine !== node) {
            context.report({
              node: node,
              message: `Literal \`${node.raw.replace(/\n$/, '')}\` must be placed on a new line`,
              fix: generateFixFunction(node, {wrapWithJSXExpressionContainer: true})
            });
          }
        }
      },

      JSXOpeningElement: function (node) {
        if (!node.parent) {
          return;
        }

        const openingStartLine = node.loc.start.line;

        // Parent
        if (node.parent.parent && node.parent.parent.openingElement) {
          const parentOpeningStartLine = node.parent.parent.openingElement.loc.end.line;

          if (parentOpeningStartLine === openingStartLine) {
            context.report({
              node: node,
              message: `Opening tag for Element \`${node.name.name}\` must be placed on a new line`,
              fix: generateFixFunction(node)
            });
          }
        }

        // Siblings
        if (node.parent.parent && node.parent.parent.children && node.parent.parent.children.length) {
          // const firstSiblingOnLine = node.parent.parent.children.find(sibling => (
          //   sibling.type === 'JSXElement' && elementDoesOpenOrCloseOnLine(sibling, openingStartLine)
          // ));

          // TODO: Stop at first `find`.
          const siblingsOnLine = node.parent.parent.children.filter(sibling => (
            // Ignore literals that contain line breaks
            !(sibling.type === 'Literal' && sibling.raw.match(/\n/)) &&
              elementDoesOpenOrCloseOnLine(sibling, openingStartLine)
          ));

          const firstSiblingOnLine = siblingsOnLine[0];

          console.log('node.parent');
          printNodeText(node.parent);

          console.log('siblingsOnLine');
          siblingsOnLine.forEach(printNodeText);

          console.log('firstSiblingOnLine');
          printNodeText(firstSiblingOnLine);

          /* eslint-disable */
          debugger
          /* eslint-enable */

          if (firstSiblingOnLine !== node.parent) {
            context.report({
              node: node,
              message: `Opening tag for Element \`${node.name.name}\` must be placed on a new line`,
              fix: generateFixFunction(node)
            });
          }
        }
      },

      JSXClosingElement: function (node) {
        if (!node.parent || !node.parent.children.length) {
          return;
        }

        const closingElementStartLine = node.loc.end.line;

        /* eslint-disable */
        debugger
        /* eslint-enable */

        const anyChildrenOnLine = node.parent.children.some(child => (
          // Ignore literals that contain line breaks
          !(child.type === 'Literal' && child.raw.match(/\n/)) &&
            elementDoesOpenOrCloseOnLine(child, closingElementStartLine)
        ));

        if (!anyChildrenOnLine) {
          return;
        }

        context.report({
          node: node,
          message: `Closing tag for Element \`${node.name.name}\` must be placed on a new line`,
          fix: generateFixFunction(node)
        });
      }
    };
  }
};
