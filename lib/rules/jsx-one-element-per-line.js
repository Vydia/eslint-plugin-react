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

    function printNodeText (node) {
      /* eslint-disable */
      console.log(`\n\`${sourceCode.getText(node)}\`\n`);
      /* eslint-enable */
    }

    // TODO: Refactor to only do JSX Elements and their children?

    return {
      JSXElement: function (node) {
        const children = node.children;

        if (!children || !children.length) {
          return;
        }

        // Is it a safe assumption that if there are `children` then we have an opening and closing tag?
        const openingElement = node.openingElement;
        const closingElement = node.closingElement;
        const openingElementEndLine = openingElement.loc.end.line;
        const closingElementStartLine = closingElement.loc.start.line;

        console.log('ROOT NODE');
        printNodeText(node);
        console.log('ROOT Children');
        node.children.forEach(printNodeText);
        // console.log('openingElement', openingElement);
        // console.log('closingElement', closingElement);
        // console.log('openingElementEndLine', openingElementEndLine);
        // console.log('closingElementStartLine', closingElementStartLine);

        const childrenGroupedByLine = {};
        const reports = [];

        children.forEach(child => {
          let countNewLinesPrecedingContent = 0;

          if (child.type === 'Literal') {
            if (child.value.match(/^\s*$/)) {
              return;
            }

            countNewLinesPrecedingContent = (child.raw.match(/^ *\n/g) || []).length;
          }

          const startLine = child.loc.start.line + countNewLinesPrecedingContent;
          const endLine = child.loc.end.line;

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
            console.log('!@#$%^&*() CHILD CHILD CHILD )(*&^%$#@!)');
            printNodeText(child);

            console.log('!@#$%^&*() CHILDREN CHILDREN CHILDREN )(*&^%$#@!)');
            childrenGroupedByLine[line].forEach(printNodeText);

            // console.log('#### prevChild (WITHOUT USING PARENT) ####');
            // printNodeText(childrenGroupedByLine[line][i - 1]);
            // console.log('#### nextChild (WITHOUT USING PARENT) ####');
            // printNodeText(childrenGroupedByLine[line][i + 1]);

            let prevChild;
            if (i === firstIndex) {
              // console.log('prev1a');
              // console.log('line ==(=) openingElementEndLine', line === openingElementEndLine, line == openingElementEndLine, line, openingElementEndLine, typeof line, typeof openingElementEndLine);
              if (line === openingElementEndLine) {
                // console.log('prev1b');
                prevChild = openingElement;
              }
            } else {
              // console.log('prev2');
              prevChild = childrenGroupedByLine[line][i - 1];
            }
            let nextChild;
            if (i === lastIndex) {
              // console.log('next1a');
              if (line === closingElementStartLine) {
                // console.log('next1b');
                nextChild = closingElement;
              }
            } else {
              // We don't need to append a trailing because the next child will prepend a leading.
              // console.log('next2');
              // nextChild = childrenGroupedByLine[line][i + 1];
            }


            // console.log('sourceCode.isSpaceBetweenTokens(openingElement, child)', sourceCode.isSpaceBetweenTokens(openingElement, firstChildOnOpeningLine));
            function prevChildHasTrailingSpace () {
              return prevChild.type === 'Literal' && prevChild.raw.match(/ $/) || sourceCode.isSpaceBetweenTokens(prevChild, child);
            }
            const leadingSpace = prevChild && prevChildHasTrailingSpace() ? '\n{\' \'}' : '';
            const trailingSpace = nextChild && sourceCode.isSpaceBetweenTokens(child, nextChild) ? '{\' \'}\n' : '';
            const leadingNewLine = prevChild ? '\n' : '';
            const trailingNewLine = nextChild ? '\n' : '';

            console.log(`#### prevChild (${prevChild && prevChild.type}) ####`);
            prevChild && printNodeText(prevChild);
            console.log(`#### nextChild (${nextChild && nextChild.type}) ####`);
            nextChild && printNodeText(nextChild);

            console.log('#### I, firstIndex, lastIndex ####');
            console.log(i, firstIndex, lastIndex);

            console.log('#### LINE ####');
            console.log(line);

            console.log('#### openingElementEndLine ####');
            console.log(openingElementEndLine);
            console.log('#### closingElementStartLine ####');
            console.log(closingElementStartLine);

            console.log('#### openingElement ####');
            printNodeText(openingElement);
            console.log('#### closingElement ####');
            printNodeText(closingElement);

            console.log('leadingSpace', `\`${leadingSpace}\``);
            console.log('trailingSpace', `\`${trailingSpace}\``);
            console.log('leadingNewLine', `\`${leadingNewLine}\``);
            console.log('trailingNewLine', `\`${trailingNewLine}\``);
            /* eslint-disable */
            // debugger
            /* eslint-enable */

            if (!prevChild && !nextChild) {
              return;
            }

            let source = sourceCode.getText(child);

            if (child.type === 'Literal') {
              source = source.replace(/\n/g, '');
              // If there is no previous child it means the leading spaces is indentation?
              // console.log('');
            }

            function nodeDescriptor (n) {
              return n.openingElement ? n.openingElement.name.name : source;
            }

            const report = {
              node: child,
              message: `\`${nodeDescriptor(child)}\` must be placed on a new line`,
              fix: function (fixer) {
                // return fixer.replaceText(child, `${leadingSpace}\n${sourceCode.getText(child)}\n${trailingSpace}`);
                return fixer.replaceText(child, `${leadingSpace}${leadingNewLine}${source}${trailingNewLine}${trailingSpace}`);
              }
            };

            reports.push(report);
          });
        });

        // console.log('REPORTSREPORTSREPORTSREPORTS', reports);

        reports.forEach(report => context.report(report));
      }
    };
  }
};
