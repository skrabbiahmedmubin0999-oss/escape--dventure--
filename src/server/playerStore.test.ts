import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { PlayerStore } from './playerStore';
import { createSessionToken, verifySessionToken } from './sessionToken';

test('guest records persist across store instances and profile fields remain scoped', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'escape-store-'));
  try {
    const first = new PlayerStore(directory);
    const player = await first.createGuest();
    await first.updateProfile(player.id, { name: 'Mubin' });
    const reopened = new PlayerStore(directory);
    const loaded = await reopened.getPlayer(player.id);
    assert.equal(loaded?.profile.name, 'Mubin');
    assert.equal(loaded?.settings.soundEnabled, true);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('save revisions reject stale writes without overwriting newer progress', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'escape-save-'));
  try {
    const store = new PlayerStore(directory);
    const player = await store.createGuest();
    const first = await store.saveGame(player.id, { quest: { xpEarned: 50 } }, 0);
    assert.equal(first.conflict, false);
    assert.equal(first.player?.save?.revision, 1);
    const stale = await store.saveGame(player.id, { quest: { xpEarned: 0 } }, 0);
    assert.equal(stale.conflict, true);
    assert.equal(stale.player?.save?.payload.quest && (stale.player.save.payload.quest as { xpEarned: number }).xpEarned, 50);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('signed session tokens reject tampering and expired sessions', () => {
  const secret = 'a-secure-test-secret-that-is-long-enough';
  const now = 1_700_000_000_000;
  const token = createSessionToken('guest-123', secret, now);
  assert.equal(verifySessionToken(token, secret, now)?.sub, 'guest-123');
  assert.equal(verifySessionToken(`${token}x`, secret, now), null);
  assert.equal(verifySessionToken(token, secret, now + 31 * 24 * 60 * 60 * 1000), null);
});
