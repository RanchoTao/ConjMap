import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { MathText } from '../src/components/math-text';
it('renders source math, code, emphasis and http citations without executing source HTML', () => {
  const html = renderToStaticMarkup(
    createElement(MathText, {
      text: '**Riemann hypothesis**: $x^2$ and `theorem`. [Source](https://example.org) <script>alert(1)</script>',
    }),
  );
  expect(html).toContain('class="katex"');
  expect(html).toContain('<strong>Riemann hypothesis</strong>');
  expect(html).toContain('<code>theorem</code>');
  expect(html).toContain('href="https://example.org"');
  expect(html).toContain('&lt;script&gt;');
  expect(html).not.toContain('<script>');
});
it('does not trust script links or KaTeX HTML extensions', () => {
  const html = renderToStaticMarkup(
    createElement(MathText, {
      text: '[bad](javascript:alert) $\\href{javascript:alert}{bad}$ $\\htmlClass{bad}{x}$',
    }),
  );
  expect(html).not.toContain('href="javascript:');
  expect(html).not.toContain('class="bad"');
});
