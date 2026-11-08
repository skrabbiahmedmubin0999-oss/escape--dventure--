import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import express from 'express';
import test from 'node:test';
import { createApiRouter } from './apiRouter';
import { PlayerStore } from './playerStore';

const SECRET = 'api-integration-test-session-secret-32-bytes';

test('API protects player-scoped profile, settings, save and delete routes', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'escape-api-'));
  const store = new PlayerStore(directory);
  const app = express();
  app.use(express.json());
  app.use('/api/v1', createApiRouter(store, SECRET));
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}/api/v1`;

  try {
    const guestResponse = await fetch(`${base}/auth/guest`, { method: 'POST' });
    assert.equal(guestResponse.status, 201);
    const guest = await guestResponse.json() as { token: string; player: { id: string } };
    assert.ok(guest.token);

    const unauthorized = await fetch(`${base}/profiles/me`);
    assert.equal(unauthorized.status, 401);

    const headers = { Authorization: `Bearer ${guest.token}`, 'Content-Type': 'application/json' };
    const badProfile = await fetch(`${base}/profiles/me`, { method: 'PUT', headers, body: JSON.stringify({ playerId: 'other-player' }) });
    assert.equal(badProfile.status, 400);

    const profileResponse = await fetch(`${base}/profiles/me`, { method: 'PUT', headers, body: JSON.stringify({ name: 'Explorer 2' }) });
    assert.equal(profileResponse.status, 200);
    assert.equal((await profileResponse.json() as { profile: { name: string } }).profile.name, 'Explorer 2');

    const badSettings = await fetch(`${base}/settings/me`, { method: 'PUT', headers, body: JSON.stringify({ sfxVolume: 1.5 }) });
    assert.equal(badSettings.status, 400);

    const firstSave = await fetch(`${base}/saves/me`, { method: 'PUT', headers, body: JSON.stringify({ expectedRevision: 0, save: { version: 1, payload: { quest: { keysCount: 1 } } } }) });
    assert.equal(firstSave.status, 200);
    const saveJson = await firstSave.json() as { save: { revision: number } };
    assert.equal(saveJson.save.revision, 1);

    const conflict = await fetch(`${base}/saves/me`, { method: 'PUT', headers, body: JSON.stringify({ expectedRevision: 0, save: { version: 1, payload: { quest: { keysCount: 0 } } } }) });
    assert.equal(conflict.status, 409);

    const saveRead = await fetch(`${base}/saves/me`, { headers: { Authorization: `Bearer ${guest.token}` } });
    assert.equal((await saveRead.json() as { save: { revision: number } }).save.revision, 1);

    const deleteResponse = await fetch(`${base}/players/me`, { method: 'DELETE', headers: { Authorization: `Bearer ${guest.token}` } });
    assert.equal(deleteResponse.status, 204);
    const expiredAfterDelete = await fetch(`${base}/players/me`, { headers: { Authorization: `Bearer ${guest.token}` } });
    assert.equal(expiredAfterDelete.status, 401);
  } finally {
    server.close();
    await once(server, 'close');
    await rm(directory, { recursive: true, force: true });
  }
});
