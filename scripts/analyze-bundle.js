#!/usr/bin/env node

/**
 * @fileOverview Next.js Bundle Size Analysis Script
 * 
 * Analyzes the build output to identify:
 * - Total bundle size
 * - Largest chunks and modules
 * - Size trends vs baseline
 * - Potential optimizations
 * 
 * Usage:
 *   node scripts/analyze-bundle.js
 *   node scripts/analyze-bundle.js --baseline
 *   node scripts/analyze-bundle.js --compare
 * 
 * @requires fs, path, gzip-size, pretty-bytes
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Bundle Analysis Result
 */
class BundleAnalysis {
    constructor() {
        this.chunks = [];
        this.modules = [];
        this.totalSize = 0;
        this.gzipSize = 0;
        this.timestamp = new Date().toISOString();
    }
}

/**
 * Pretty format bytes for console output
 */
function formatBytes(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get gzip size of a file
 */
function getGzipSize(filePath) {
    try {
        const zlib = require('zlib');
        const input = fs.readFileSync(filePath);
        const output = zlib.gzipSync(input);
        return output.length;
    } catch (err) {
        return 0;
    }
}

/**
 * Analyze JavaScript chunks in .next/static
 */
function analyzeChunks() {
    const chunks = [];
    const nextDir = path.join(process.cwd(), '.next', 'static', 'chunks');

    if (!fs.existsSync(nextDir)) {
        console.warn('❌ .next/static/chunks directory not found');
        console.log('   Run "npm run build" first');
        return chunks;
    }

    const files = fs.readdirSync(nextDir);

    for (const file of files) {
        if (file.endsWith('.js')) {
            const filePath = path.join(nextDir, file);
            const stats = fs.statSync(filePath);
            const size = stats.size;
            const gzipSize = getGzipSize(filePath);

            chunks.push({
                name: file,
                size,
                gzipSize,
                reduction: Math.round((1 - gzipSize / size) * 100)
            });
        }
    }

    // Sort by size descending
    chunks.sort((a, b) => b.size - a.size);
    return chunks;
}

/**
 * Get build stats from Next.js build output
 */
function getBuildStats() {
    const statsFile = path.join(
        process.cwd(),
        '.next',
        'build-stats.json'
    );

    if (fs.existsSync(statsFile)) {
        return JSON.parse(fs.readFileSync(statsFile, 'utf8'));
    }

    return null;
}

/**
 * Calculate total size of all chunks
 */
function calculateTotalSize(chunks) {
    return chunks.reduce((total, chunk) => total + chunk.size, 0);
}

/**
 * Identify largest chunks and potential optimizations
 */
function identifyOptimizations(chunks) {
    const suggestions = [];

    // Find chunks over 500KB
    const largeChunks = chunks.filter(c => c.size > 500000);
    if (largeChunks.length > 0) {
        suggestions.push(
            `⚠️  Found ${largeChunks.length} large chunks (>500KB):`
        );
        largeChunks.forEach(chunk => {
            suggestions.push(
                `   - ${chunk.name}: ${formatBytes(chunk.size)}`
            );
        });
        suggestions.push('   Consider code splitting or lazy loading');
    }

    // Check compression effectiveness
    const poorCompression = chunks.filter(c => c.reduction < 40);
    if (poorCompression.length > 0) {
        suggestions.push(
            `⚠️  ${poorCompression.length} chunks compress poorly (<40%):`
        );
        poorCompression.slice(0, 3).forEach(chunk => {
            suggestions.push(
                `   - ${chunk.name}: ${chunk.reduction}% compression`
            );
        });
        suggestions.push('   Consider minification or format optimization');
    }

    return suggestions;
}

/**
 * Format table output
 */
function formatTable(data, columns) {
    const widths = {};

    // Calculate column widths
    columns.forEach(col => {
        widths[col] = Math.max(
            col.length,
            ...data.map(row => String(row[col]).length)
        );
    });

    // Print header
    const header = columns
        .map(col => col.padEnd(widths[col]))
        .join(' | ');
    console.log(header);
    console.log('-'.repeat(header.length));

    // Print rows
    data.forEach(row => {
        const line = columns
            .map(col => String(row[col]).padEnd(widths[col]))
            .join(' | ');
        console.log(line);
    });
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(chunks, totalSize, timestamp) {
    const lines = [
        '# Bundle Size Analysis Report',
        '',
        `Generated: ${timestamp}`,
        '',
        '## Summary',
        '',
        `- **Total Size**: ${formatBytes(totalSize)}`,
        `- **Number of Chunks**: ${chunks.length}`,
        `- **Average Chunk Size**: ${formatBytes(totalSize / chunks.length)}`,
        '',
        '## Chunk Breakdown',
        '',
        '| Chunk | Size | Gzip | Compression |',
        '|-------|------|------|-------------|'
    ];

    chunks.slice(0, 10).forEach(chunk => {
        lines.push(
            `| ${chunk.name} | ${formatBytes(chunk.size)} | ${formatBytes(chunk.gzipSize)} | ${chunk.reduction}% |`
        );
    });

    lines.push('');
    lines.push('## Recommendations');
    lines.push('');
    lines.push('- Monitor chunk sizes in CI/CD pipeline');
    lines.push('- Use dynamic imports for large components');
    lines.push('- Analyze dependencies with webpack-bundle-analyzer');
    lines.push('- Keep gzip compression above 40%');
    lines.push('');

    return lines.join('\n');
}

/**
 * Load previous baseline
 */
function loadBaseline() {
    const baselineFile = path.join(
        process.cwd(),
        'build-size-baseline.json'
    );

    if (fs.existsSync(baselineFile)) {
        return JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
    }

    return null;
}

/**
 * Save current build as baseline
 */
function saveBaseline(analysis) {
    const baselineFile = path.join(
        process.cwd(),
        'build-size-baseline.json'
    );

    fs.writeFileSync(baselineFile, JSON.stringify(analysis, null, 2));
    console.log(`✅ Baseline saved to ${baselineFile}`);
}

/**
 * Compare with baseline
 */
function compareWithBaseline(current, baseline) {
    console.log('\n📊 Comparison with Baseline\n');

    const totalDiff = current.totalSize - baseline.totalSize;
    const totalDiffPercent = Math.round(
        (totalDiff / baseline.totalSize) * 100
    );

    const icon = totalDiff > 0 ? '📈' : '📉';
    console.log(`${icon} Total Size Change: ${formatBytes(totalDiff)} (${totalDiffPercent: +d}%)`);

  // Compare individual chunks
  const currentMap = new Map(current.chunks.map(c => [c.name, c]));
  const baselineMap = new Map(baseline.chunks.map(c => [c.name, c]));

  const newChunks = Array.from(currentMap.entries()).filter(
    ([name]) => !baselineMap.has(name)
  );
  const removedChunks = Array.from(baselineMap.entries()).filter(
    ([name]) => !currentMap.has(name)
  );
  const changedChunks = Array.from(currentMap.entries())
    .filter(([name, chunk]) => {
      const baseChunk = baselineMap.get(name);
      return baseChunk && baseChunk.size !== chunk.size;
    });

  if (newChunks.length > 0) {
    console.log(`\n➕ New Chunks(${ newChunks.length }): `);
    newChunks.forEach(([name, chunk]) => {
      console.log(`   + ${ name }: ${ formatBytes(chunk.size) } `);
    });
  }

  if (removedChunks.length > 0) {
    console.log(`\n➖ Removed Chunks(${ removedChunks.length }): `);
    removedChunks.forEach(([name, chunk]) => {
      console.log(`   - ${ name }: was ${ formatBytes(chunk.size) } `);
    });
  }

  if (changedChunks.length > 0) {
    console.log(`\n📝 Changed Chunks(${ changedChunks.length }): `);
    changedChunks.forEach(([name, chunk]) => {
      const baseChunk = baselineMap.get(name);
      const diff = chunk.size - baseChunk.size;
      const diffPercent = Math.round((diff / baseChunk.size) * 100);
      const icon = diff > 0 ? '📈' : '📉';
      console.log(
        `   ${ icon } ${ name }: ${ formatBytes(baseChunk.size) } → ${ formatBytes(chunk.size) } (${ diffPercent: +d }%)`
      );
    });
  }

  // Check if limits exceeded
  console.log('\n');
  if (totalDiffPercent > 10) {
    console.warn(`⚠️  Bundle size increased by ${ totalDiffPercent }% - review changes`);
  } else if (totalDiffPercent < -10) {
    console.log(`✅ Bundle size optimized by ${ Math.abs(totalDiffPercent) }% `);
  } else {
    console.log('✅ Bundle size change within acceptable range');
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'analyze';

  console.log('🔍 Next.js Bundle Size Analyzer\n');

  // Analyze chunks
  const chunks = analyzeChunks();

  if (chunks.length === 0) {
    process.exit(1);
  }

  const totalSize = calculateTotalSize(chunks);
  const timestamp = new Date().toISOString();

  const analysis = {
    chunks,
    totalSize,
    timestamp
  };

  if (command === 'analyze') {
    console.log('📦 Chunk Analysis\n');

    // Show summary
    console.log('Summary:');
    console.log(`  Total Size: ${ formatBytes(totalSize) } `);
    console.log(`  Number of Chunks: ${ chunks.length } `);
    console.log(`  Average: ${ formatBytes(totalSize / chunks.length) } \n`);

    // Show top chunks
    console.log('Top 10 Largest Chunks:\n');
    const tableData = chunks.slice(0, 10).map(c => ({
      Chunk: c.name,
      Size: formatBytes(c.size),
      Gzip: formatBytes(c.gzipSize),
      Compression: `${ c.reduction }% `
    }));

    formatTable(tableData, ['Chunk', 'Size', 'Gzip', 'Compression']);

    // Optimizations
    console.log('\n');
    const suggestions = identifyOptimizations(chunks);
    if (suggestions.length > 0) {
      console.log('💡 Optimization Suggestions:\n');
      suggestions.forEach(s => console.log(s));
    } else {
      console.log('✅ Bundle looks optimized!');
    }

    // Generate report
    const report = generateMarkdownReport(chunks, totalSize, timestamp);
    const reportFile = path.join(process.cwd(), 'BUNDLE_ANALYSIS.md');
    fs.writeFileSync(reportFile, report);
    console.log(`\n📄 Report saved to ${ reportFile } `);
  } else if (command === 'baseline') {
    saveBaseline(analysis);
  } else if (command === 'compare') {
    const baseline = loadBaseline();
    if (baseline) {
      compareWithBaseline(analysis, baseline);
    } else {
      console.log('❌ No baseline found. Run with --baseline first');
      process.exit(1);
    }
  } else {
    console.log(`Unknown command: ${ command } `);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});