/**
 * @fileoverview HTTP status codes used across AUSTA services
 */

export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503
}

export type HttpStatusCode = typeof HttpStatus[keyof typeof HttpStatus];

/**
 * Check if a status code is in the client error range (400-499)
 */
export const isClientErrorStatus = (status: number): boolean => {
  return status >= 400 && status < 500;
};

/**
 * Check if a status code is in the server error range (500-599)
 */
export const isServerErrorStatus = (status: number): boolean => {
  return status >= 500 && status < 600;
};

/**
 * Check if a status code is a success status (200-299)
 */
export const isSuccessStatus = (status: number): boolean => {
  return status >= 200 && status < 300;
}; 