import fs from 'fs';
import path from 'path';
import process from 'process';
import lodash from 'lodash';
import getParser from './parsers.js';
import getFormatter from './formatters/index.js';

const {
  isPlainObject, isEqual, union,
} = lodash;

const getFileExtension = (filepath) => path.extname(filepath).slice(1);

const nodes = [
  {
    check: (valueBefore, valueAfter) => isEqual(valueBefore, valueAfter),
    makeNode: (key, _, value) => ({ key, type: 'unchanged', value }),
  },
  {
    check: (valueBefore) => valueBefore === undefined,
    makeNode: (key, _, value) => ({ key, type: 'added', value }),
  },
  {
    check: (_, valueAfter) => valueAfter === undefined,
    makeNode: (key, value) => ({ key, type: 'removed', value }),
  },
  {
    check: (valueBefore, valueAfter) => (
      isPlainObject(valueBefore) && isPlainObject(valueAfter)
    ),
    makeNode: (key, valueBefore, valueAfter, func) => (
      { key, type: 'complex', children: func(valueBefore, valueAfter) }
    ),
  },
  {
    check: (valueBefore, valueAfter) => !isEqual(valueBefore, valueAfter),
    makeNode: (key, valueBefore, valueAfter) => (
      { key, type: 'updated', value: [valueBefore, valueAfter] }
    ),
  },
];

const buildAst = (objectBefore, objectAfter) => {
  const keys = union(lodash.keys(objectBefore), lodash.keys(objectAfter));
  const sortedKeys = keys.sort();
  return sortedKeys.flatMap((key) => {
    const valueBefore = objectBefore[key];
    const valueAfter = objectAfter[key];
    const { makeNode } = nodes.find(({ check }) => check(valueBefore, valueAfter));
    return makeNode(key, valueBefore, valueAfter, buildAst);
  });
};

const readFile = (filepath) => {
  const fullpath = path.resolve(process.cwd(), filepath);
  return fs.readFileSync(fullpath, 'utf-8');
};

export default (filepathBefore, filepathAfter, format) => {
  const fileExtensionBefore = getFileExtension(filepathBefore);
  const fileDataBefore = readFile(filepathBefore);

  const fileExtendionAfter = getFileExtension(filepathAfter);
  const fileDataAfter = readFile(filepathAfter);

  const parsedDataBefore = getParser(fileExtensionBefore)(fileDataBefore);
  const parsedDataAfter = getParser(fileExtendionAfter)(fileDataAfter);

  const ast = buildAst(parsedDataBefore, parsedDataAfter);
  return getFormatter(format)(ast);
};
