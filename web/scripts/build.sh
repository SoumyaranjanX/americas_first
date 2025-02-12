#!/bin/bash

# Create temporary directory for test files
mkdir -p .test-files-temp

# Move test files to temporary directory
find src -type f -name "*.test.*" -exec mv {} .test-files-temp/ \;
find src -type f -name "*.spec.*" -exec mv {} .test-files-temp/ \;

# Run the build
cross-env NODE_ENV=production NODE_OPTIONS='--max-old-space-size=4096' NEXT_TELEMETRY_DISABLED=1 next build

# Move test files back
mv .test-files-temp/* src/ 2>/dev/null || true
rmdir .test-files-temp

# Exit with the build's exit code
exit $? 