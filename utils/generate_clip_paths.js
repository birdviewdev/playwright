#!/usr/bin/env node
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// @ts-check

const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const HEADER = `/*
 * MIT License
 *
 * Copyright (c) Microsoft Corporation.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and / or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// This file is generated by ${path.basename(__filename).split(path.sep).join(path.posix.sep)}, do not edit manually.

import type { SvgJson } from './recorder';
`;

const iconsDir = path.join(ROOT, 'packages', 'playwright-core', 'src', 'server', 'injected', 'recorder', 'icons');
const outFile = path.join(ROOT, 'packages', 'playwright-core', 'src', 'server', 'injected', 'recorder', 'clipPaths.ts');

const iconNames = [
  'gripper',
  'circle-large-filled',
  'inspect',
  'whole-word',
  'eye',
  'symbol-constant',
  'check',
  'close',
  'pass',
  'plus',
  'undo',
  'redo'
];

(async () => {
  const clipPaths = await Promise.all(iconNames.map(async iconName => {
    const iconStr = fs.readFileSync(path.join(iconsDir, `${iconName}.svg`), { encoding: 'utf-8' });
    const options = { attrkey: 'attrs', explicitChildren: true, childkey: 'children', preserveChildrenOrder: true };

    // just discard xmlns attr, and root #name will be replaced, so don't destructure it
    const { svg: { attrs: { xmlns, ...attrs }, children } } = await xml2js.parseStringPromise(iconStr, options);

    function extract({ attrs, children, '#name': tagName }) {
      if (children)
        children = children.map(extract);
      return { tagName, attrs, children };
    }
    // each icon will generate a <clipPath> element with an id
    return extract({ attrs: { ...attrs, id: `icon-${iconName}` }, children, '#name': 'clipPath' });
  }))
  const svgJson = {
    tagName: 'svg', children: [{
      tagName: 'defs', children: [
        ...clipPaths
      ]
    }]
  };
  const code = [
    HEADER,
    `// eslint-disable-next-line key-spacing, object-curly-spacing, comma-spacing, quotes`,
    `const svgJson: SvgJson = ${JSON.stringify(svgJson)};`,
    `export default svgJson;`,
  ].join('\n');
  fs.writeFileSync(outFile, code, 'utf-8');
})();
