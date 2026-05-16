/**
 * @fileoverview Disallow HTML elements as direct children of SVG <text>.
 *
 * SVG <text> does NOT render nested HTML — the inner text content disappears
 * silently in the browser. For inline styling inside <text>, use <tspan>.
 *
 * Example bug this catches:
 *   <text>... <code>True</code> vinner</text>
 * The browser renders only " vinner" because <code> swallows its children
 * inside SVG. Replace with <tspan> or plain text.
 */

/** @type {Set<string>} HTML-only inline elements that disappear inside <svg><text>. */
const FORBIDDEN_CHILDREN = new Set([
  "code",
  "em",
  "strong",
  "b",
  "i",
  "p",
  "span",
  "small",
]);

/** Extract the simple identifier name from a JSX element name, or null. */
function getElementName(node) {
  if (!node || node.type !== "JSXElement") return null;
  const name = node.openingElement && node.openingElement.name;
  if (!name || name.type !== "JSXIdentifier") return null;
  return name.name;
}

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow HTML elements (<code>, <em>, <strong>, <b>, <i>, <p>, <span>, <small>) as direct children of SVG <text>. Use <tspan> for inline styling inside SVG, or render the text as plain content.",
      recommended: true,
    },
    fixable: "code",
    schema: [],
    messages: {
      htmlInSvgText:
        "<{{tag}}> inside SVG <text> is silently dropped by the browser — the inner text will not render. Use <tspan> for inline styling in SVG, or render the text as plain content.",
    },
  },
  create(context) {
    return {
      JSXElement(node) {
        if (getElementName(node) !== "text") return;
        for (const child of node.children) {
          const childTag = getElementName(child);
          if (!childTag || !FORBIDDEN_CHILDREN.has(childTag)) continue;

          context.report({
            node: child,
            messageId: "htmlInSvgText",
            data: { tag: childTag },
            fix(fixer) {
              // Best-effort autofix: when <foo>X</foo> contains a single
              // JSXText / Literal / template-free expression child, unwrap to plain text.
              const innerChildren = child.children;
              if (innerChildren.length === 0) {
                // <foo /> with no content — just drop it.
                return fixer.replaceText(child, "");
              }
              if (innerChildren.length === 1) {
                const only = innerChildren[0];
                if (only.type === "JSXText") {
                  return fixer.replaceText(child, only.value);
                }
                if (
                  only.type === "JSXExpressionContainer" &&
                  only.expression &&
                  only.expression.type === "Literal" &&
                  typeof only.expression.value === "string"
                ) {
                  return fixer.replaceText(child, only.expression.value);
                }
                if (only.type === "Literal" && typeof only.value === "string") {
                  return fixer.replaceText(child, only.value);
                }
              }
              return null;
            },
          });
        }
      },
    };
  },
};

export default rule;
