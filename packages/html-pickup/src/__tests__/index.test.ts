import stripAnsi from 'strip-ansi';
import { pickup } from '../';

const html = `
<body>
  <section>
    <header>
      <h1>Title</h1>
    </header>
    <div class="container" id="element" data-foo="bar">
      <h2>Sub title</h2>
      <ul>
        <li>
          Item 1
        </li>
        <li>Item 2</li>
        <li>Item 3</li>
      </ul>
    </div>
    <img src="/path/to.jpg" alt="text content" />
    <footer>
      <p>copyright</p>
    </footer>
  </section>
</body>
`.trim();

describe('pickup', () => {
  test('basic', () => {
    const output = pickup(html, '#element');

    expect(output).not.toBe(stripAnsi(output));
    expect(stripAnsi(output)).toMatchSnapshot();
  });

  test('disable color', () => {
    const output = pickup(html, '#element', { color: false });

    expect(output).toBe(stripAnsi(output));
  });

  test('no trucate', () => {
    const output = pickup(html, '#element', {
      color: false,
      truncate: Infinity,
    });

    expect(output).toMatchSnapshot();
  });

  test('self closing tag', () => {
    const output = pickup(html, 'img', { color: false });

    expect(output).toMatchSnapshot();
  });
});
