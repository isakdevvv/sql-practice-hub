/**
 * Local ESLint plugin for repo-specific rules.
 *
 * Loaded from `eslint.config.js` as `local`. Rules live in this directory as
 * plain ESM modules with a default export of the rule object.
 */

import noHtmlInSvgText from "./no-html-in-svg-text.js";

const plugin = {
  meta: {
    name: "eslint-plugin-local",
    version: "0.0.1",
  },
  rules: {
    "no-html-in-svg-text": noHtmlInSvgText,
  },
};

export default plugin;
