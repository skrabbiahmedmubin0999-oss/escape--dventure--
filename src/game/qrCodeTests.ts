import { getShareableGameUrl } from '../components/ShareModal';
import * as QRCode from 'qrcode';

export interface TestResult {
  suite: string;
  testName: string;
  passed: boolean;
  details: string;
}

export async function runQrCodeTestSuite(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Test 1: getShareableGameUrl returns a valid active HTTPS URL
  try {
    const url = getShareableGameUrl();
    const isHttps = url.startsWith('https://');
    const isValidDomain = url.includes('.run.app');
    results.push({
      suite: 'QR Code System',
      testName: 'Active Live Game URL Resolution',
      passed: isHttps && isValidDomain,
      details: `Generated live URL: ${url}`,
    });
  } catch (err: any) {
    results.push({
      suite: 'QR Code System',
      testName: 'Active Live Game URL Resolution',
      passed: false,
      details: `Error resolving URL: ${err.message}`,
    });
  }

  // Test 2: Local Vector SVG Generation
  try {
    const qrLib = (QRCode as any).default || QRCode;
    const testUrl = getShareableGameUrl();
    const svg = await qrLib.toString(testUrl, {
      type: 'svg',
      width: 256,
      margin: 2,
    });

    const isValidSvg = svg.startsWith('<svg') && svg.includes('</svg>');
    results.push({
      suite: 'QR Code System',
      testName: 'Vector SVG Offline Generation',
      passed: isValidSvg,
      details: `Successfully generated SVG (${svg.length} bytes)`,
    });
  } catch (err: any) {
    results.push({
      suite: 'QR Code System',
      testName: 'Vector SVG Offline Generation',
      passed: false,
      details: `Error generating SVG: ${err.message}`,
    });
  }

  // Test 3: Local Data URL PNG Generation
  try {
    const qrLib = (QRCode as any).default || QRCode;
    const testUrl = getShareableGameUrl();
    const dataUrl = await qrLib.toDataURL(testUrl, {
      width: 512,
      margin: 2,
    });

    const isValidDataUrl = dataUrl.startsWith('data:image/png;base64,');
    results.push({
      suite: 'QR Code System',
      testName: 'PNG Data URL File Export Generation',
      passed: isValidDataUrl,
      details: `Generated PNG base64 data URL (${dataUrl.length} chars)`,
    });
  } catch (err: any) {
    results.push({
      suite: 'QR Code System',
      testName: 'PNG Data URL File Export Generation',
      passed: false,
      details: `Error generating data URL: ${err.message}`,
    });
  }

  return results;
}
