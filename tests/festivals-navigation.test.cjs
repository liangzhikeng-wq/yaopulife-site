const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const projectRoot = path.resolve(__dirname, '..');
const festivalsPath = path.join(projectRoot, 'src/pages/festivals.astro');

test('festival cards describe their in-page destination and Qixi links to its published guide', () => {
  const source = fs.readFileSync(festivalsPath, 'utf8');

  assert.match(
    source,
    /slug: "qixi"[^\n]*link: "\/explainers\/qixi-festival"/,
    'Qixi detail data should link to the published explainer'
  );
  assert.match(
    source,
    /href={`#\$\{f\.slug\}`}[^\n]*<span class="soon">On this page<\/span>/,
    'top cards should identify their actual in-page anchor destination'
  );
  assert.match(
    source,
    /href=\{f\.link\}>Read the full \{f\.en\} guide →<\/a>/,
    'detail cards should expose each published festival guide'
  );
  assert.doesNotMatch(
    source,
    /<span class="soon">Guide<\/span>/,
    'in-page links should not be mislabeled as a separate guide'
  );
});
