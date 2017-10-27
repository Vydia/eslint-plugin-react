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

    function generateFixFunction(node, flags = {}) {
      let nodeText = sourceCode.getText(node);
      if (flags.wrapWithJSXExpressionContainer) {
        let countTrailingNewLinesStripped = (nodeText.match(/(\n *)$/g) || []).length;
        nodeText = nodeText.replace(/(\n *)$/g, '');
        let countLeadingNewLinesStripped = (nodeText.match(/^ *\n/g) || []).length;
        nodeText = nodeText.replace(/^ *\n/g, '');

        if (flags.leadingNewLine !== false) {
          countLeadingNewLinesStripped++;
        }
        if (flags.trailingNewLine === true) {
          countTrailingNewLinesStripped++;
        }

        const trailingNewLines = Array(countTrailingNewLinesStripped).fill('\n').join('');
        const leadingNewLines = Array(countLeadingNewLinesStripped).fill('\n').join('');

        let countLeadingSpaces = 0;

        if (flags.leadingSpacesAreIndentation) {
          countLeadingSpaces = (nodeText.match(/(^ +)/) || []).length;

          nodeText = nodeText.replace(/(^ +)/, '');
        }

        const indentationSpaces = Array(countLeadingSpaces).fill(' ').join('');

        return function (fixer) {
          /* eslint-disable */
          if (node.raw.match(/ /)) {
            // debugger
            return fixer.replaceText(node, `FUCKKCCKCK`);

          }
          /* eslint-enable */

          return fixer.replaceText(node, `${leadingNewLines}${indentationSpaces}{'${nodeText}'}${trailingNewLines}`);
        };

        // const trailingNewLine = nodeText !== initialNodeText || flags.trailingNewLine === true;
        // const leadingNewLine = nodeText !== initialNodeText || flags.leadingNewLine !== false;
        //
        // return function (fixer) {
        //   return fixer.replaceText(node, `${leadingNewLine ? '\n' : ''}{'${trailingStripped}'}${trailingNewLine ? '\n' : ''}`);
        // };
      }

      return function (fixer) {
        return fixer.replaceText(node, `\n${nodeText}`);
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

        // let firstChildOnOpeningLine;
        // let lastChildOnClosingLine;
        const childrenGroupedByLine = {};
        // const nodeReportFixes = {};
        const reports = [];

        children.forEach(child => {
          // if (child.type === 'Literal' && child.value.match(/^\n+$/)) {
          //   return;
          // }
          // TODO: if it is ONLY spaces?
          if (child.type === 'Literal') {
            return;
          }

          // TODO: Handle leading new lines in Literals.
          const startLine = child.loc.start.line;
          const endLine = child.loc.end.line;
          // if (!firstChildOnOpeningLine && startLine === openingElementEndLine) {
          //   firstChildOnOpeningLine = child;
          // }
          // if (endLine === closingElementStartLine) {
          //   lastChildOnClosingLine = child;
          // }

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
            // TODO: Skip if first element in line...?
            // if (i === 0) {
            //   return;
            // }

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
            const leadingSpace = prevChild && sourceCode.isSpaceBetweenTokens(prevChild, child) ? '\n{\' \'}' : '';
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

            const report = {
              node: child,
              message: `\`${child.openingElement.name.name}\` must be placed on a new line`,
              fix: function (fixer) {
                // TODO
                if (child.type === 'Literal') {
                //   return fixer.replaceText(child, `\n{'${sourceCode.getText(child)}'}\n`);
                }

                // return fixer.replaceText(child, `${leadingSpace}\n${sourceCode.getText(child)}\n${trailingSpace}`);
                return fixer.replaceText(child, `${leadingSpace}${leadingNewLine}${sourceCode.getText(child)}${trailingNewLine}${trailingSpace}`);
              }
            };

            // if (child.type === 'Literal') {
            //   reports.unshift(report);
            // } else {
            reports.push(report);
            // }
          });
        });

        // console.log('REPORTSREPORTSREPORTSREPORTS', reports);

        reports.forEach(report => context.report(report));

        // if (firstChildOnOpeningLine && lastChildOnClosingLine && firstChildOnOpeningLine === lastChildOnClosingLine) {
        //   context.report({
        //     node: firstChildOnOpeningLine,
        //     message: `\`${firstChildOnOpeningLine.openingElement.name.name}\` must be placed on a new line`,
        //     fix: function (fixer) {
        //       // console.log('sourceCode.isSpaceBetweenTokens(openingElement, child)', sourceCode.isSpaceBetweenTokens(openingElement, firstChildOnOpeningLine));
        //       const leadingSpace = sourceCode.isSpaceBetweenTokens(openingElement, firstChildOnOpeningLine) ? '\n{\' \'}' : '';
        //       const trailingSpace = sourceCode.isSpaceBetweenTokens(lastChildOnClosingLine, closingElement) ? '{\' \'}\n' : '';
        //
        //       return fixer.replaceText(firstChildOnOpeningLine, `${leadingSpace}\n${sourceCode.getText(firstChildOnOpeningLine)}\n${trailingSpace}`);
        //     }
        //   });
        // } else {
        //   if (firstChildOnOpeningLine) {
        //     context.report({
        //       node: firstChildOnOpeningLine,
        //       message: `\`${firstChildOnOpeningLine.openingElement.name.name}\` must be placed on a new line`,
        //       fix: function (fixer) {
        //         const leadingSpace = sourceCode.isSpaceBetweenTokens(openingElement, firstChildOnOpeningLine) ? '\n{\' \'}' : '';
        //
        //         return fixer.replaceText(firstChildOnOpeningLine, `${leadingSpace}\n${sourceCode.getText(firstChildOnOpeningLine)}`);
        //       }
        //     });
        //   }
        //
        //   if (lastChildOnClosingLine) {
        //     context.report({
        //       node: lastChildOnClosingLine,
        //       message: `\`${lastChildOnClosingLine.openingElement.name.name}\` must be placed on a new line`,
        //       fix: function (fixer) {
        //         const trailingSpace = sourceCode.isSpaceBetweenTokens(lastChildOnClosingLine, closingElement) ? '{\' \'}\n' : '';
        //
        //         /* eslint-disable */
        //         // debugger
        //         /* eslint-enable */
        //
        //         return fixer.replaceText(lastChildOnClosingLine, `${sourceCode.getText(lastChildOnClosingLine)}\n${trailingSpace}`);
        //       }
        //     });
        //   }
        // }

        // parse children.
        //   handle whitespace literals first?
        //   make each child on another line.
        //
        //   if child start on same line as my opening tag end line, prepend \n to the child. (DO ONLY FOR ONE CHILD)
        //     `<div> hello` => `<div>\n{' hello'}`
        //   if child start on same line as my closing tag start line, append \n to the child. (DO ONLY FOR ONE CHILD)
        //     `hello </div>` => `{'hello '}\n</div>`
        //   if child start on same line as another child, append \n to the child. (PROBLEM)
        //     `hello <div />` => `{'hello '}\n<div />`
        //     `<div /> hello` => `<div />\n hello` (PROBLEM: whitespace is lost as "indentation".)
        //       Can we solve problem by reporting literals first?
        return;
      }

      // Literal: function (node) {
      //   // Ignore if starts with a new line character and only consists of whitespace.
      //   if (node.raw.match(/^\n\s*$/)) {
      //     return;
      //   }
      //
      //   /* eslint-disable */
      //   // debugger
      //   /* eslint-enable */
      //
      //   const countNewLinesPrecedingContent = (node.raw.match(/^ *\n/g) || []).length;
      //   const openingStartLine = node.loc.start.line + countNewLinesPrecedingContent;
      //
      //   console.log('Literal openingStartLine', openingStartLine, node.loc.start.line, '+', countNewLinesPrecedingContent);
      //
      //   // Parent
      //   // TODO: Optionally allow Literal and JSXExpressionContainer on same line as parent.
      //   // if (node.parent && node.parent.openingElement) {
      //   //   const parentOpeningStartLine = node.parent.openingElement.loc.end.line;
      //   //
      //   //   if (parentOpeningStartLine === openingStartLine) {
      //   //     context.report({
      //   //       node: node,
      //   //       message: `Literal \`${node.raw.replace(/\n$/, '')}\` must be placed on a new line`,
      //   //       fix: generateFixFunction(node, {wrapWithJSXExpressionContainer: true})
      //   //     });
      //   //   }
      //   // }
      //
      //   // Siblings
      //   if (node.parent && node.parent.children && node.parent.children.length) {
      //     // const firstSiblingOnLine = node.parent.children.find(sibling => (
      //     //   sibling.type === 'JSXElement' && elementDoesOpenOrCloseOnLine(sibling, openingStartLine)
      //     // ));
      //
      //     // TODO: Stop at first `find`.
      //     const siblingsOnLine = node.parent.children.filter(sibling => (
      //       // Ignore literals that contain line breaks
      //       // !(sibling.type === 'Literal' && sibling.raw.match(/\n/)) &&
      //       elementDoesOpenOrCloseOnLine(sibling, openingStartLine)
      //     ));
      //
      //     const firstSiblingOnLine = siblingsOnLine[0];
      //
      //     console.log('Literal node');
      //     printNodeText(node);
      //
      //     console.log('Literal siblingsOnLine');
      //     siblingsOnLine.forEach(printNodeText);
      //
      //     console.log('Literal firstSiblingOnLine');
      //     printNodeText(firstSiblingOnLine);
      //
      //     /* eslint-disable */
      //     // if (node.raw.match(/ /)) {
      //     //   debugger
      //     // }
      //     /* eslint-enable */
      //
      //     if (firstSiblingOnLine && firstSiblingOnLine !== node) {
      //       /* eslint-disable */
      //       // if (node.raw.match(/ /)) {
      //       //   debugger
      //       // }
      //       /* eslint-enable */
      //
      //       context.report({
      //         node: node,
      //         message: `Literal \`${node.raw.replace(/\n$/, '')}\` must be placed on a new line`,
      //         fix: generateFixFunction(node, {wrapWithJSXExpressionContainer: true})
      //       });
      //     } else if (siblingsOnLine.length > 1) {
      //       context.report({
      //         node: node,
      //         message: `Literal \`${node.raw.replace(/^\s*\n\s*/, '')}\` must be placed on a new line`,
      //         fix: generateFixFunction(node, {
      //           wrapWithJSXExpressionContainer: true,
      //           leadingSpacesAreIndentation: true,
      //           leadingNewLine: false,
      //           trailingNewLine: true
      //         })
      //       });
      //     }
      //   }
      // },

      // JSXExpressionContainer: function (node) {
      //   if (!node.parent) {
      //     return;
      //   }
      //
      //   const openingStartLine = node.loc.start.line;
      //
      //   // Parent
      //   // TODO: Optionally allow Literal and JSXExpressionContainer on same line as parent.
      //   if (node.parent && node.parent.openingElement) {
      //     const parentOpeningStartLine = node.parent.openingElement.loc.end.line;
      //
      //     if (parentOpeningStartLine === openingStartLine) {
      //       context.report({
      //         node: node,
      //         message: `JSXExpressionContainer \`${sourceCode.getText(node)}\` must be placed on a new line`,
      //         fix: generateFixFunction(node)
      //       });
      //
      //       return;
      //     }
      //   }
      //
      //   // Siblings
      //   if (node.parent && node.parent.children && node.parent.children.length) {
      //     // const firstSiblingOnLine = node.parent.children.find(sibling => (
      //     //   sibling.type === 'JSXElement' && elementDoesOpenOrCloseOnLine(sibling, openingStartLine)
      //     // ));
      //
      //     // TODO: Stop at first `find`.
      //     const siblingsOnLine = node.parent.children.filter(sibling => (
      //       // Ignore literals that contain line breaks
      //       // TODO: This Regex may need to be refined.
      //       !(sibling.type === 'Literal' && sibling.raw.match(/\n/)) &&
      //         elementDoesOpenOrCloseOnLine(sibling, openingStartLine)
      //     ));
      //
      //     const firstSiblingOnLine = siblingsOnLine[0];
      //
      //     console.log('JSXExpressionContainer node', node);
      //     printNodeText(node);
      //
      //     console.log('JSXExpressionContainer siblingsOnLine');
      //     siblingsOnLine.forEach(printNodeText);
      //
      //     console.log('JSXExpressionContainer firstSiblingOnLine');
      //     printNodeText(firstSiblingOnLine);
      //
      //     /* eslint-disable */
      //     // debugger
      //     /* eslint-enable */
      //
      //     if (firstSiblingOnLine !== node) {
      //       context.report({
      //         node: node,
      //         message: `JSXExpressionContainer \`${sourceCode.getText(node)}\` must be placed on a new line`,
      //         fix: generateFixFunction(node)
      //       });
      //     }
      //   }
      // },

      // JSXOpeningElement: function (node) {
      //   if (!node.parent) {
      //     return;
      //   }
      //
      //   const openingStartLine = node.loc.start.line;
      //
      //   // Parent
      //   if (node.parent.parent && node.parent.parent.openingElement) {
      //     const parentOpeningStartLine = node.parent.parent.openingElement.loc.end.line;
      //
      //     if (parentOpeningStartLine === openingStartLine) {
      //       context.report({
      //         node: node,
      //         message: `Opening tag for Element \`${node.name.name}\` must be placed on a new line`,
      //         fix: generateFixFunction(node)
      //       });
      //
      //       return;
      //     }
      //   }
      //
      //   // Siblings
      //   if (node.parent.parent && node.parent.parent.children && node.parent.parent.children.length) {
      //     // const firstSiblingOnLine = node.parent.parent.children.find(sibling => (
      //     //   sibling.type === 'JSXElement' && elementDoesOpenOrCloseOnLine(sibling, openingStartLine)
      //     // ));
      //
      //     // TODO: Stop at first `find`.
      //     const siblingsOnLine = node.parent.parent.children.filter(sibling => (
      //       // Ignore literals that contain line breaks
      //       !(sibling.type === 'Literal' && sibling.raw.match(/\n/)) &&
      //         elementDoesOpenOrCloseOnLine(sibling, openingStartLine)
      //     ));
      //
      //     const firstSiblingOnLine = siblingsOnLine[0];
      //
      //     console.log('node.parent');
      //     printNodeText(node.parent);
      //
      //     console.log('siblingsOnLine');
      //     siblingsOnLine.forEach(printNodeText);
      //
      //     console.log('firstSiblingOnLine');
      //     printNodeText(firstSiblingOnLine);
      //
      //     /* eslint-disable */
      //     // debugger
      //     /* eslint-enable */
      //
      //     if (firstSiblingOnLine !== node.parent) {
      //       context.report({
      //         node: node,
      //         message: `Opening tag for Element \`${node.name.name}\` must be placed on a new line`,
      //         fix: generateFixFunction(node)
      //       });
      //     }
      //   }
      // },
      //
      // JSXClosingElement: function (node) {
      //   if (!node.parent || !node.parent.children.length) {
      //     return;
      //   }
      //
      //   const closingElementStartLine = node.loc.end.line;
      //
      //   /* eslint-disable */
      //   // debugger
      //   /* eslint-enable */
      //
      //   const anyChildrenOnLine = node.parent.children.some(child => (
      //     // Ignore literals that contain line breaks
      //     !(child.type === 'Literal' && child.raw.match(/\n/)) &&
      //       elementDoesOpenOrCloseOnLine(child, closingElementStartLine)
      //   ));
      //
      //   if (!anyChildrenOnLine) {
      //     return;
      //   }
      //
      //   context.report({
      //     node: node,
      //     message: `Closing tag for Element \`${node.name.name}\` must be placed on a new line`,
      //     fix: generateFixFunction(node)
      //   });
      // }
    };
  }
};
