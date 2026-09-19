import assert from 'node:assert/strict';
import { test } from 'node:test';
import { locate } from '../src/lib/location.ts';
import type { LocationAccess } from '../src/lib/location.ts';

function access(overrides: Partial<LocationAccess> = {}): LocationAccess {
  return {
    permission: async () => ({ granted: true, canAskAgain: true }),
    servicesEnabled: async () => true,
    currentPosition: async () => ({ coords: { latitude: 59.91, longitude: 10.75, accuracy: 30 }, timestamp: Date.now() }),
    ...overrides,
  };
}
test('location returns real coordinates and accuracy on success', async () => {
  const result = await locate(access(), true);
  assert.equal(result.status, 'ready');
  if (result.status === 'ready') {
    assert.deepEqual(result.position, { latitude: 59.91, longitude: 10.75 });
    assert.equal(result.accuracy, 30);
  }
});
test('denial never reads GPS and preserves ability to ask again', async () => {
  for (const canAskAgain of [true, false]) {
    let called = false;
    const result = await locate(access({
      permission: async () => ({ granted: false, canAskAgain }),
      currentPosition: async () => { called = true; throw new Error(); },
    }), true);
    assert.deepEqual(result, { status: 'denied', canAskAgain });
    assert.equal(called, false);
  }
});
test('refresh checks permission without asking automatically', async () => {
  let requested = true;
  await locate(access({ permission: async (request) => { requested = request; return { granted: true, canAskAgain: true }; } }), false);
  assert.equal(requested, false);
});
test('disabled GPS, rejected requests, stale fixes and timeout have explicit outcomes', async () => {
  assert.deepEqual(await locate(access({ servicesEnabled: async () => false }), true), { status: 'disabled' });
  assert.deepEqual(await locate(access({ currentPosition: async () => { throw new Error('GPS'); } }), true), { status: 'error' });
  assert.deepEqual(await locate(access({ currentPosition: async () => ({ coords: { latitude: 0, longitude: 0, accuracy: 1 }, timestamp: 0 }) }), true), { status: 'error' });
  assert.deepEqual(await locate(access({ currentPosition: () => new Promise(() => {}) }), true, 5), { status: 'timeout' });
});
