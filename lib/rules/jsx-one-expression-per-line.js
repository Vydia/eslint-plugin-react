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

    function nodeKey (node) {
      console.log('sourceCode.getText(node)', `\`${sourceCode.getText(node)}\``, 'start.line,start.column', `${node.loc.start.line},${node.loc.start.column}`, '\n');
      return `${node.loc.start.line},${node.loc.start.column}`;
    }

    function nodeDescriptor (n) {
      return n.openingElement ? n.openingElement.name.name : sourceCode.getText(n).replace(/\n/g, '');
    }

    return {
      JSXElement: function (node) {
        const children = node.children;

        if (!children || !children.length) {
          return;
        }

        const openingElement = node.openingElement;
        const closingElement = node.closingElement;
        const openingElementEndLine = openingElement.loc.end.line;
        const closingElementStartLine = closingElement.loc.start.line;

        const childrenGroupedByLine = {};
        const fixDetailsByNode = {};

        children.forEach(child => {
          let countNewLinesBeforeContent = 0;
          let countNewLinesAfterContent = 0;

          if (child.type === 'Literal') {
            if (child.value.match(/^\s*$/)) {
              console.log(`EMPTY STRING CHILD: \`${sourceCode.getText(child)}\``);
              return;
            }

            countNewLinesBeforeContent = (child.raw.match(/^ *\n/g) || []).length;
            countNewLinesAfterContent = (child.raw.match(/\n *$/g) || []).length;
          }

          console.log(`NON_EMPTY STRING CHILD: \`${sourceCode.getText(child)}\``);

          const startLine = child.loc.start.line + countNewLinesBeforeContent;
          const endLine = child.loc.end.line - countNewLinesAfterContent;

          if (startLine === endLine) {
            if (!childrenGroupedByLine[startLine]) {
              childrenGroupedByLine[startLine] = [];
            }
            childrenGroupedByLine[startLine].push(child);
          } else {
            if (!childrenGroupedByLine[startLine]) {
              childrenGroupedByLine[startLine] = [];
            }
            childrenGroupedByLine[startLine].push(child);
            if (!childrenGroupedByLine[endLine]) {
              childrenGroupedByLine[endLine] = [];
            }
            childrenGroupedByLine[endLine].push(child);
          }
        });

        Object.keys(childrenGroupedByLine).forEach(line => {
          line = parseInt(line, 10);
          const firstIndex = 0;
          const lastIndex = childrenGroupedByLine[line].length - 1;

          childrenGroupedByLine[line].forEach((child, i) => {
            let prevChild;
            let nextChild;
            let leadingBleedAmount;

            if (i === firstIndex) {
              if (line === openingElementEndLine) {
                prevChild = openingElement;
              }
            } else {
              prevChild = childrenGroupedByLine[line][i - 1];
              if (prevChild.type === 'Literal') {
                leadingBleedAmount = ((prevChild.raw.match(/ +$/) || [])[0] || '').length;
              }
            }

            if (i === lastIndex) {
              if (line === closingElementStartLine) {
                nextChild = closingElement;
              }
            } else {
              // We don't need to append a trailing because the next child will prepend a leading.
              // nextChild = childrenGroupedByLine[line][i + 1];
            }

            if (!prevChild && !nextChild) {
              return;
            }

            function spaceBetweenPrev () {
              return (prevChild.type === 'Literal' && prevChild.raw.match(/ $/)) ||
                (child.type === 'Literal' && child.raw.match(/^ /)) ||
                sourceCode.isSpaceBetweenTokens(prevChild, child);
            }

            function spaceBetweenNext () {
              return (nextChild.type === 'Literal' && nextChild.raw.match(/^ /)) ||
                (child.type === 'Literal' && child.raw.match(/ $/)) ||
                sourceCode.isSpaceBetweenTokens(child, nextChild);
            }

            const source = sourceCode.getText(child);
            const leadingSpace = !!(prevChild && spaceBetweenPrev());
            const trailingSpace = !!(nextChild && spaceBetweenNext());
            const leadingNewLine = !!(prevChild);
            const trailingNewLine = !!(nextChild);

            const key = nodeKey(child);

            if (!fixDetailsByNode[key]) {
              fixDetailsByNode[key] = {
                node: child,
                source: source,
                descriptor: nodeDescriptor(child),
                leadingBleedAmount: 0
              };
            }

            if (leadingSpace) {
              fixDetailsByNode[key].leadingSpace = true;
            }
            if (leadingNewLine) {
              fixDetailsByNode[key].leadingNewLine = true;
            }
            if (trailingNewLine) {
              fixDetailsByNode[key].trailingNewLine = true;
            }
            if (trailingSpace) {
              fixDetailsByNode[key].trailingSpace = true;
            }
            if (leadingBleedAmount) {
              fixDetailsByNode[key].leadingBleedAmount += leadingBleedAmount;
            }
          });
        });

        Object.keys(fixDetailsByNode).forEach(key => {
          const details = fixDetailsByNode[key];

          const nodeToReport = details.node;
          const descriptor = details.descriptor;
          const leadingBleedAmount = details.leadingBleedAmount || 0;
          const source = details.source.replace(/(^ +| +$)/, '');
          // const source = details.source.replace(/^ +/, '');
          // const source = details.source

          const leadingSpaceString = details.leadingSpace ? '\n{\' \'}' : '';
          const trailingSpaceString = details.trailingSpace ? '{\' \'}\n' : '';
          const leadingNewLineString = details.leadingNewLine ? '\n' : '';
          const trailingNewLineString = details.trailingNewLine ? '\n' : '';

          const replaceText = `${leadingSpaceString}${leadingNewLineString}${source}${trailingNewLineString}${trailingSpaceString}`;

          context.report({
            node: nodeToReport,
            message: `\`${descriptor}\` must be placed on a new line`,
            fix: function (fixer) {
              console.log('DETALS');
              console.log(details);
              console.log('\n');

              console.log('NODETOREPORT');
              nodeKey(nodeToReport);
              console.log(`\`${sourceCode.getText(nodeToReport)}\``);
              console.log('\n');

              console.log('REPLACETEXT');
              console.log(`\`${replaceText}\``);
              console.log('\n');

              // return fixer.replaceText(nodeToReport, replaceText);
              console.log('nodeToReport.range', nodeToReport.range, 'leadingBleedAmount', leadingBleedAmount);
              const rangeStart = nodeToReport.range[0] - leadingBleedAmount;
              const rangeEnd = nodeToReport.range[1];
              return fixer.replaceTextRange([rangeStart, rangeEnd], replaceText);
            }
          });
        });
      }
    };
  }
};
