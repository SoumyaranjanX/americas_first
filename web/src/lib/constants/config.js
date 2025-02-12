/**
 * @fileoverview Configuration constants for AUSTA SuperApp web application
 */

const API_VERSION = 'v1';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

module.exports = {
  API_VERSION,
  BASE_URL
}; 