/**
 * Performance Baseline Script
 * Runs Lighthouse audits for mobile performance baseline
 *
 * Usage: node scripts/performance-baseline.js
 * Output: lighthouse-reports/*.html and performance-baseline.json
 *
 * Prerequisites:
 * npm install --save-dev lighthouse chrome-launcher
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

// Pages to audit
const PAGES = [
  { name: 'Homepage', url: 'http://localhost:5173/' },
  { name: 'Flights', url: 'http://localhost:5173/flights' },
  { name: 'Hotels', url: 'http://localhost:5173/hotels' },
  { name: 'Dashboard', url: 'http://localhost:5173/dashboard' },
  { name: 'Onboarding', url: 'http://localhost:5173/onboarding' }
];

// Lighthouse configuration
const LIGHTHOUSE_CONFIG = {
  extends: 'lighthouse:default',
  settings: {
    // Mobile device emulation
    formFactor: 'mobile',
    screenEmulation: {
      mobile: true,
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      disabled: false
    },
    // Throttling (simulated 4G)
    throttling: {
      rttMs: 150,
      throughputKbps: 1638.4,
      cpuSlowdownMultiplier: 4
    },
    // Run categories
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    // Output
    output: 'html'
  }
};

/**
 * Launch Chrome and run Lighthouse audit
 */
async function runLighthouseAudit(url, name) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = {
    logLevel: 'info',
    output: 'html',
    port: chrome.port,
    ...LIGHTHOUSE_CONFIG.settings
  };

  try {
    console.log(`\n🔍 Auditing ${name}...`);
    const runnerResult = await lighthouse(url, options, LIGHTHOUSE_CONFIG);

    // Extract scores
    const { lhr } = runnerResult;
    const scores = {
      performance: Math.round(lhr.categories.performance.score * 100),
      accessibility: Math.round(lhr.categories.accessibility.score * 100),
      bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
      seo: Math.round(lhr.categories.seo.score * 100)
    };

    // Extract key metrics
    const metrics = {
      firstContentfulPaint: lhr.audits['first-contentful-paint'].numericValue,
      largestContentfulPaint: lhr.audits['largest-contentful-paint'].numericValue,
      totalBlockingTime: lhr.audits['total-blocking-time'].numericValue,
      cumulativeLayoutShift: lhr.audits['cumulative-layout-shift'].numericValue,
      speedIndex: lhr.audits['speed-index'].numericValue,
      timeToInteractive: lhr.audits['interactive'].numericValue
    };

    // Save HTML report
    const reportsDir = path.join(process.cwd(), 'lighthouse-reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    const reportPath = path.join(reportsDir, `${name.toLowerCase().replace(/\s+/g, '-')}.html`);
    fs.writeFileSync(reportPath, runnerResult.report);

    console.log(`✅ ${name} audit complete`);
    console.log(`   Performance: ${scores.performance} | Accessibility: ${scores.accessibility}`);
    console.log(`   FCP: ${Math.round(metrics.firstContentfulPaint)}ms | LCP: ${Math.round(metrics.largestContentfulPaint)}ms`);
    console.log(`   Report: ${reportPath}`);

    return {
      name,
      url,
      scores,
      metrics,
      reportPath
    };
  } catch (error) {
    console.error(`❌ Failed to audit ${name}:`, error.message);
    return {
      name,
      url,
      error: error.message
    };
  } finally {
    await chrome.kill();
  }
}

/**
 * Main performance baseline function
 */
async function runPerformanceBaseline() {
  console.log('🚀 Starting Performance Baseline Audit\n');
  console.log('Prerequisites:');
  console.log('  - Web client running on http://localhost:5173');
  console.log('  - Chrome/Chromium installed\n');

  const results = [];

  // Run audits sequentially
  for (const page of PAGES) {
    const result = await runLighthouseAudit(page.url, page.name);
    results.push(result);
  }

  // Calculate averages
  const validResults = results.filter(r => !r.error);
  const averages = {
    performance: Math.round(validResults.reduce((sum, r) => sum + r.scores.performance, 0) / validResults.length),
    accessibility: Math.round(validResults.reduce((sum, r) => sum + r.scores.accessibility, 0) / validResults.length),
    bestPractices: Math.round(validResults.reduce((sum, r) => sum + r.scores.bestPractices, 0) / validResults.length),
    seo: Math.round(validResults.reduce((sum, r) => sum + r.scores.seo, 0) / validResults.length),
    fcp: Math.round(validResults.reduce((sum, r) => sum + r.metrics.firstContentfulPaint, 0) / validResults.length),
    lcp: Math.round(validResults.reduce((sum, r) => sum + r.metrics.largestContentfulPaint, 0) / validResults.length),
    cls: Math.round((validResults.reduce((sum, r) => sum + r.metrics.cumulativeLayoutShift, 0) / validResults.length) * 1000) / 1000
  };

  // Generate baseline report
  const baseline = {
    timestamp: new Date().toISOString(),
    device: 'Mobile (iPhone 12 Pro)',
    network: '4G (throttled)',
    pages: results,
    averages,
    targets: {
      performance: 90,
      accessibility: 95,
      bestPractices: 90,
      seo: 90,
      fcp: 1500, // ms
      lcp: 2500, // ms
      cls: 0.1
    }
  };

  // Write JSON baseline
  const baselinePath = path.join(process.cwd(), 'performance-baseline.json');
  fs.writeFileSync(baselinePath, JSON.stringify(baseline, null, 2));

  // Console summary
  console.log('\n📊 Performance Baseline Summary\n');
  console.log('Average Scores:');
  console.log(`  Performance:    ${averages.performance}/100 (Target: 90+)`);
  console.log(`  Accessibility:  ${averages.accessibility}/100 (Target: 95+)`);
  console.log(`  Best Practices: ${averages.bestPractices}/100 (Target: 90+)`);
  console.log(`  SEO:            ${averages.seo}/100 (Target: 90+)`);
  console.log('\nAverage Metrics:');
  console.log(`  FCP:  ${averages.fcp}ms (Target: <1500ms)`);
  console.log(`  LCP:  ${averages.lcp}ms (Target: <2500ms)`);
  console.log(`  CLS:  ${averages.cls} (Target: <0.1)`);

  // Status checks
  const performanceStatus = averages.performance >= 90 ? '✅' : '❌';
  const accessibilityStatus = averages.accessibility >= 95 ? '✅' : '❌';
  const fcpStatus = averages.fcp < 1500 ? '✅' : '❌';
  const lcpStatus = averages.lcp < 2500 ? '✅' : '❌';
  const clsStatus = averages.cls < 0.1 ? '✅' : '❌';

  console.log('\n🎯 Target Status:');
  console.log(`  ${performanceStatus} Performance Score`);
  console.log(`  ${accessibilityStatus} Accessibility Score`);
  console.log(`  ${fcpStatus} First Contentful Paint`);
  console.log(`  ${lcpStatus} Largest Contentful Paint`);
  console.log(`  ${clsStatus} Cumulative Layout Shift`);

  console.log(`\n✅ Baseline report saved to: ${baselinePath}`);
  console.log(`📁 HTML reports saved to: lighthouse-reports/\n`);

  // Recommendations
  if (averages.performance < 90) {
    console.log('💡 Performance Recommendations:');
    console.log('  - Implement code splitting for large bundles');
    console.log('  - Optimize images (WebP, lazy loading)');
    console.log('  - Reduce JavaScript execution time');
    console.log('  - Enable text compression (gzip/brotli)');
  }

  if (averages.fcp > 1500) {
    console.log('\n💡 FCP Recommendations:');
    console.log('  - Inline critical CSS');
    console.log('  - Preconnect to external resources');
    console.log('  - Minimize render-blocking resources');
  }

  if (averages.lcp > 2500) {
    console.log('\n💡 LCP Recommendations:');
    console.log('  - Optimize hero images');
    console.log('  - Use CDN for static assets');
    console.log('  - Implement lazy loading for below-fold content');
  }

  if (averages.cls > 0.1) {
    console.log('\n💡 CLS Recommendations:');
    console.log('  - Set explicit dimensions for images/videos');
    console.log('  - Avoid inserting content above existing content');
    console.log('  - Use transform animations instead of layout changes');
  }
}

// Check if dev server is running
async function checkDevServer() {
  try {
    const response = await fetch('http://localhost:5173/');
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Run baseline
(async () => {
  const isServerRunning = await checkDevServer();
  if (!isServerRunning) {
    console.error('❌ Dev server not running!');
    console.error('Please start the web client first: npm run dev');
    process.exit(1);
  }

  try {
    await runPerformanceBaseline();
  } catch (error) {
    console.error('❌ Performance baseline failed:', error.message);
    process.exit(1);
  }
})();
