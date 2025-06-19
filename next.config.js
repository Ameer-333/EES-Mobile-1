// This file defers to next.config.ts for all Next.js configuration.
// Ensure next.config.ts exports its configuration as default.

/** @type {import('next').NextConfig} */
const tsConfig = require('./next.config.ts');

// If tsConfig is an ESModule, its default export might be under tsConfig.default
// Otherwise, it might be the module itself if it uses module.exports.
// This handles both common scenarios.
module.exports = tsConfig.default || tsConfig;
