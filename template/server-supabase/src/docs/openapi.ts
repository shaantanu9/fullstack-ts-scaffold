import { appConfig } from '../config/app.config';

/**
 * Hand-written OpenAPI 3.0 spec for the API. Served as interactive docs at
 * `/docs` and as raw JSON at `/openapi.json`. The contract is identical for the
 * Postgres and Mongo server variants, so this file is shared verbatim.
 */
const bearerAuth = [{ bearerAuth: [] }];

const userSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
    email: { type: 'string', format: 'email', example: 'user@example.com' },
    name: { type: 'string', nullable: true, example: 'Jane Doe' },
    role: { type: 'string', enum: ['USER', 'ADMIN', 'MODERATOR'], example: 'USER' },
  },
};

const errorResponse = {
  description: 'Error',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
        },
      },
    },
  },
};

const authResult = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    message: { type: 'string' },
    data: {
      type: 'object',
      properties: {
        user: userSchema,
        tokens: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
      },
    },
  },
};

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Boilerplate API',
    version: '1.0.0',
    description:
      'Next.js + Express TypeScript boilerplate API. JWT access/refresh auth with role-based authorization.',
  },
  servers: [{ url: appConfig.apiPrefix, description: 'API v1' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
  tags: [
    { name: 'Auth', description: 'Registration, login, token refresh, logout' },
    { name: 'Users', description: 'User management (role-gated)' },
    { name: 'Uploads', description: 'ImageKit signed upload credentials' },
  ],
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', example: 'SecureP@ssw0rd1' },
                  name: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Created',
            content: { 'application/json': { schema: authResult } },
          },
          '409': errorResponse,
          '422': errorResponse,
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: authResult } } },
          '401': errorResponse,
        },
      },
    },
    '/auth/refresh-token': {
      post: {
        tags: ['Auth'],
        summary: 'Rotate refresh token and issue a new access token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: { refreshToken: { type: 'string' } },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: {
                      type: 'object',
                      properties: {
                        accessToken: { type: 'string' },
                        refreshToken: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': errorResponse,
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Log out (revoke refresh token)',
        security: bearerAuth,
        responses: { '200': { description: 'OK' }, '401': errorResponse },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get the current authenticated user',
        security: bearerAuth,
        responses: { '200': { description: 'OK' }, '401': errorResponse },
      },
    },
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'List users (paginated)',
        security: bearerAuth,
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: { '200': { description: 'OK' }, '401': errorResponse },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get a user by ID',
        security: bearerAuth,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'OK' }, '401': errorResponse, '404': errorResponse },
      },
      patch: {
        tags: ['Users'],
        summary: 'Update a user (ADMIN or MODERATOR)',
        security: bearerAuth,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'OK' },
          '401': errorResponse,
          '403': errorResponse,
          '404': errorResponse,
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete a user (ADMIN)',
        security: bearerAuth,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'OK' },
          '401': errorResponse,
          '403': errorResponse,
          '404': errorResponse,
        },
      },
    },
    '/uploads/imagekit-auth': {
      get: {
        tags: ['Uploads'],
        summary: 'Mint signed ImageKit upload credentials',
        description:
          'Returns short-lived params the client uses to upload directly to ImageKit ' +
          '(the private key never leaves the server). Returns 503 when ImageKit is not configured.',
        security: bearerAuth,
        responses: {
          '200': {
            description: 'Signed upload params (token, expire, signature, publicKey, urlEndpoint)',
          },
          '401': errorResponse,
          '503': errorResponse,
        },
      },
    },
  },
} as const;
