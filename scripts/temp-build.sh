#!/bin/bash

# Temporarily disable Jest
export DISABLE_JEST=true
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1
export NODE_OPTIONS='--max-old-space-size=4096'

# Run the build without Jest
NODE_ENV=production DISABLE_JEST=true NEXT_RUNTIME=edge npx next build 