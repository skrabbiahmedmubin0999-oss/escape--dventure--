import { runCollisionTestSuite } from './game/collisionTests';
import { runGameplayQATestSuite } from './game/gameplayQATests';
import { runOrientationTestSuite } from './game/orientationTests';
import { runQrCodeTestSuite } from './game/qrCodeTests';
import { runPerformanceAndSettingsTestSuite } from './game/performanceAndSettingsTests';

console.log('--- Running Physics/Collision Test Suite ---');
const collisionResults = runCollisionTestSuite();
collisionResults.forEach(r => {
  console.log(`[${r.passed ? 'PASS' : 'FAIL'}] ${r.testName}: ${r.details}`);
});

console.log('\n--- Running Gameplay QA Test Suite ---');
const qaResults = runGameplayQATestSuite();
qaResults.forEach(r => {
  console.log(`[${r.passed ? 'PASS' : 'FAIL'}] ${r.suite} - ${r.testName}: ${r.details}`);
});

console.log('\n--- Running Orientation / Landscape Test Suite ---');
const orientationResults = runOrientationTestSuite();
orientationResults.forEach(r => {
  console.log(`[${r.passed ? 'PASS' : 'FAIL'}] ${r.suite} - ${r.testName}: ${r.details}`);
});

console.log('\n--- Running QR Code & Share Test Suite ---');
const qrResults = await runQrCodeTestSuite();
qrResults.forEach(r => {
  console.log(`[${r.passed ? 'PASS' : 'FAIL'}] ${r.suite} - ${r.testName}: ${r.details}`);
});

console.log('\n--- Running Performance, Graphics & Settings Test Suite ---');
const perfResults = runPerformanceAndSettingsTestSuite();
perfResults.testResults.forEach(r => {
  console.log(`[${r.passed ? 'PASS' : 'FAIL'}] ${r.name}: ${r.message}`);
});
