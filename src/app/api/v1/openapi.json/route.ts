// Minimal OpenAPI description of the public v1 API. English on purpose:
// the API surface is developer-facing.
export async function GET() {
  return Response.json({
    openapi: "3.0.3",
    info: {
      title: "Procura Public API",
      version: "1.0.0",
      description:
        "RFQ access for buyer companies. Authenticate with 'Authorization: Bearer <token>': either a 'procura_...' API key (integrations, managed on /account, 60 req/min) or a session token from POST /api/v1/auth/login (mobile app, 120 req/min).",
    },
    paths: {
      "/api/v1/auth/login": {
        post: {
          summary: "Mobile sign-in: email + password → bearer session token",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Token, user, and company" },
            "401": { description: "Invalid credentials" },
            "429": { description: "Too many attempts" },
          },
        },
      },
      "/api/v1/me": {
        get: {
          summary: "Current user, company, and unread notification count (session token only)",
          responses: { "200": { description: "Profile" }, "403": { description: "API key has no user" } },
        },
      },
      "/api/v1/rfqs": {
        get: {
          summary: "List the company's RFQs",
          parameters: [
            {
              name: "status",
              in: "query",
              required: false,
              schema: { type: "string", enum: ["READY", "SENT", "DECIDED", "CLOSED"] },
            },
          ],
          responses: { "200": { description: "RFQ list" }, "401": { description: "Invalid API key" } },
        },
        post: {
          summary: "Create an RFQ (status READY)",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["intakeText"],
                  properties: {
                    intakeText: { type: "string", minLength: 10 },
                    title: { type: "string" },
                    categoryId: { type: "string" },
                    regionId: { type: "string" },
                    deadline: { type: "string", format: "date" },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Created" },
            "400": { description: "Validation error" },
            "403": { description: "Plan limit reached or not a buyer company" },
          },
        },
      },
      "/api/v1/rfqs/{id}": {
        get: {
          summary: "RFQ details with invites and offers",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "RFQ detail" }, "404": { description: "Not found" } },
        },
      },
    },
    components: {
      securitySchemes: { bearerAuth: { type: "http", scheme: "bearer" } },
    },
    security: [{ bearerAuth: [] }],
  });
}
