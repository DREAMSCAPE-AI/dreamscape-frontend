/**
 * Responsive Audit Script
 * Analyzes all React components for mobile optimization issues
 *
 * Usage: node scripts/audit-responsive.js
 * Output: audit-report.json
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns to detect mobile optimization issues
const PATTERNS = {
  // Good patterns (mobile-first)
  mobileFirst: {
    pattern: /(block|flex|grid)\s+md:hidden/g,
    score: 1,
    message: 'Mobile-first approach detected'
  },

  // Bad patterns (desktop-first)
  desktopFirst: {
    pattern: /hidden\s+md:(block|flex|grid)/g,
    score: -1,
    message: 'Desktop-first approach (should be mobile-first)'
  },

  // Touch target issues
  smallTouchTargets: {
    pattern: /className="[^"]*\b(w-\d|h-\d|p-\d|m-\d)\b[^"]*"/g,
    score: -0.5,
    message: 'Potentially small touch targets (< 44px)'
  },

  // Fixed widths (potential overflow on mobile)
  fixedWidths: {
    pattern: /className="[^"]*\b(w-\[.*?px\])\b[^"]*"/g,
    score: -0.5,
    message: 'Fixed width detected (may cause overflow on mobile)'
  },

  // Responsive breakpoints usage
  responsiveBreakpoints: {
    pattern: /(sm:|md:|lg:|xl:|2xl:)/g,
    score: 0.5,
    message: 'Responsive breakpoints used'
  },

  // Hover states (not mobile-friendly)
  hoverStates: {
    pattern: /hover:[a-z-]+/g,
    score: 0,
    message: 'Hover states (consider touch alternatives)'
  },

  // Minimum height/width for touch targets
  touchTargetSize: {
    pattern: /min-(h|w)-\[(44|48|56|64)px\]/g,
    score: 1,
    message: 'Touch-friendly minimum size detected'
  },

  // Grid/flex responsive patterns
  responsiveLayout: {
    pattern: /(flex-col|grid-cols-1)\s+(md|lg):(flex-row|grid-cols-\d+)/g,
    score: 1,
    message: 'Responsive layout pattern detected'
  }
};

// Component priority classification
const PRIORITY_KEYWORDS = {
  P0: ['header', 'footer', 'navigation', 'nav', 'menu'],
  P1: ['search', 'cart', 'booking', 'flight', 'hotel', 'payment'],
  P2: ['dashboard', 'profile', 'settings', 'onboarding', 'wizard'],
  P3: ['about', 'contact', 'faq', 'blog', 'testimonial']
};

/**
 * Analyze a single component file
 */
function analyzeComponent(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath);
  const relativePath = path.relative(process.cwd(), filePath);

  const issues = [];
  let score = 0;

  // Run pattern matching
  for (const [name, config] of Object.entries(PATTERNS)) {
    const matches = content.match(config.pattern);
    if (matches) {
      score += config.score * matches.length;
      issues.push({
        type: name,
        message: config.message,
        occurrences: matches.length,
        impact: config.score
      });
    }
  }

  // Determine priority
  let priority = 'P3';
  const lowerFileName = fileName.toLowerCase();
  for (const [p, keywords] of Object.entries(PRIORITY_KEYWORDS)) {
    if (keywords.some(keyword => lowerFileName.includes(keyword))) {
      priority = p;
      break;
    }
  }

  // Calculate component size (lines of code)
  const lines = content.split('\n').length;

  // Check for mobile-specific components
  const hasMobileVariant = content.includes('isMobile') ||
                          content.includes('useViewport') ||
                          content.includes('md:hidden');

  return {
    file: relativePath,
    fileName,
    lines,
    score: Math.round(score * 100) / 100,
    priority,
    hasMobileVariant,
    issues,
    status: score > 2 ? 'good' : score > 0 ? 'fair' : 'needs-work'
  };
}

/**
 * Main audit function
 */
function runAudit() {
  console.log('🔍 Starting responsive audit...\n');

  const srcPath = path.join(process.cwd(), 'src', 'components');
  const pattern = path.join(srcPath, '**', '*.{tsx,jsx}');

  // Find all component files
  const files = glob.sync(pattern, {
    ignore: ['**/*.test.{tsx,jsx}', '**/*.stories.{tsx,jsx}']
  });

  console.log(`Found ${files.length} component files\n`);

  // Analyze each file
  const results = files.map(analyzeComponent);

  // Sort by priority and score
  results.sort((a, b) => {
    const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return a.score - b.score; // Lower score = more issues
  });

  // Generate statistics
  const stats = {
    total: results.length,
    byPriority: {
      P0: results.filter(r => r.priority === 'P0').length,
      P1: results.filter(r => r.priority === 'P1').length,
      P2: results.filter(r => r.priority === 'P2').length,
      P3: results.filter(r => r.priority === 'P3').length
    },
    byStatus: {
      good: results.filter(r => r.status === 'good').length,
      fair: results.filter(r => r.status === 'fair').length,
      needsWork: results.filter(r => r.status === 'needs-work').length
    },
    hasMobileVariant: results.filter(r => r.hasMobileVariant).length,
    averageScore: Math.round((results.reduce((sum, r) => sum + r.score, 0) / results.length) * 100) / 100
  };

  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    stats,
    components: results
  };

  // Write JSON report
  const reportPath = path.join(process.cwd(), 'audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Console output
  console.log('📊 Audit Results\n');
  console.log(`Total Components: ${stats.total}`);
  console.log(`\nBy Priority:`);
  console.log(`  P0 (Critical):  ${stats.byPriority.P0}`);
  console.log(`  P1 (High):      ${stats.byPriority.P1}`);
  console.log(`  P2 (Medium):    ${stats.byPriority.P2}`);
  console.log(`  P3 (Low):       ${stats.byPriority.P3}`);
  console.log(`\nBy Status:`);
  console.log(`  ✅ Good:         ${stats.byStatus.good}`);
  console.log(`  ⚠️  Fair:         ${stats.byStatus.fair}`);
  console.log(`  ❌ Needs Work:   ${stats.byStatus.needsWork}`);
  console.log(`\nMobile Variants: ${stats.hasMobileVariant} (${Math.round(stats.hasMobileVariant / stats.total * 100)}%)`);
  console.log(`Average Score:   ${stats.averageScore}`);

  // Show top issues
  console.log(`\n🔴 Top 10 Components Needing Work:\n`);
  results
    .filter(r => r.status === 'needs-work' || r.status === 'fair')
    .slice(0, 10)
    .forEach((r, i) => {
      console.log(`${i + 1}. [${r.priority}] ${r.fileName}`);
      console.log(`   Score: ${r.score} | Issues: ${r.issues.length} | Lines: ${r.lines}`);
      if (r.issues.length > 0) {
        console.log(`   Main issue: ${r.issues[0].message}`);
      }
      console.log('');
    });

  console.log(`\n✅ Full report saved to: ${reportPath}\n`);
}

// Run audit
try {
  runAudit();
} catch (error) {
  console.error('❌ Audit failed:', error.message);
  process.exit(1);
}
