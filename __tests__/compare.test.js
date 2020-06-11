/* eslint-disable no-underscore-dangle */
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import gendiff from '../src/index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let relativePathForBeforeJson;
let relativePathForAfterJson;
let relativePathForEmptyJson;
let absolutePathForBeforeJson;
let absolutePathForAfterJson;

beforeAll(() => {
  relativePathForBeforeJson = '__fixtures__/before.json';
  relativePathForAfterJson = '__fixtures__/after.json';
  relativePathForEmptyJson = '__fixtures__/empty.json';
  absolutePathForBeforeJson = `${__dirname}/../${relativePathForBeforeJson}`;
  absolutePathForAfterJson = `${__dirname}/../${relativePathForAfterJson}`;
});

test('comparing two objects with relative/absolute paths', () => {
  const expectedResult = '  host: hexlet.io\n+ timeout: 20\n- timeout: 50\n- proxy: 123.234.53.22\n- follow: false\n+ verbose: true';
  expect(gendiff(relativePathForBeforeJson, relativePathForAfterJson)).toEqual(expectedResult);
  expect(gendiff(absolutePathForBeforeJson, absolutePathForAfterJson)).toEqual(expectedResult);
});

test('comparing an object with an empty object', () => {
  const expectedResult = '- host: hexlet.io\n- timeout: 50\n- proxy: 123.234.53.22\n- follow: false';
  expect(gendiff(relativePathForBeforeJson, relativePathForEmptyJson)).toEqual(expectedResult);

  const expectedResult2 = '+ host: hexlet.io\n+ timeout: 50\n+ proxy: 123.234.53.22\n+ follow: false';
  expect(gendiff(relativePathForEmptyJson, relativePathForBeforeJson)).toEqual(expectedResult2);
});

test('comparing two empty objects', () => {
  const expectedResult = '';
  expect(gendiff(relativePathForEmptyJson, relativePathForEmptyJson)).toEqual(expectedResult);
});