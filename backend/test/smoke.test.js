import test from 'node:test';
import assert from 'node:assert/strict';
import { createSlug } from '../src/helpers/slug.helper.js';
import { generateOrderNumber } from '../src/helpers/orderNumber.helper.js';

test('createSlug normalizes names', () => {
  assert.equal(createSlug('FC Road Branch!'), 'fc-road-branch');
});

test('generateOrderNumber creates Healthiffy order numbers', () => {
  assert.match(generateOrderNumber(), /^HF-\d{8}-[A-Z0-9]{6}$/);
});
