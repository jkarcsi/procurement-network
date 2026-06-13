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
      "/api/v1/rfqs/{id}/shortlist": {
        get: {
          summary: "Ranked supplier shortlist for a READY RFQ (buyer)",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Shortlist" }, "404": { description: "Not found" } },
        },
      },
      "/api/v1/rfqs/{id}/send": {
        post: {
          summary: "Send a READY RFQ to selected suppliers (buyer)",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    supplierIds: { type: "array", items: { type: "string" } },
                    extraEmails: { type: "array", items: { type: "string" } },
                  },
                },
              },
            },
          },
          responses: { "200": { description: "Sent" }, "400": { description: "Not sendable / no recipients" }, "403": { description: "Not a buyer" } },
        },
      },
      "/api/v1/offers/{id}/accept": {
        post: {
          summary: "Buyer accepts an offer (decides the RFQ)",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Accepted" }, "400": { description: "Not acceptable" }, "403": { description: "Not a buyer" } },
        },
      },
      "/api/v1/invites": {
        get: {
          summary: "Supplier's received RFQ invites (session token only)",
          responses: { "200": { description: "Invite list" }, "403": { description: "Not a supplier" } },
        },
      },
      "/api/v1/invites/{id}/offer": {
        post: {
          summary: "Supplier submits an offer to one of their invites",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["priceNet"],
                  properties: {
                    priceNet: { type: "integer", minimum: 1 },
                    priceUnit: { type: "string" },
                    startDate: { type: "string" },
                    validUntil: { type: "string" },
                    notes: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { "200": { description: "Submitted" }, "400": { description: "Invalid / already offered" } },
        },
      },
      "/api/v1/opportunities": {
        get: {
          summary: "Open RFQs matching the supplier's profile (self-apply targets)",
          responses: { "200": { description: "Opportunities" }, "403": { description: "Not a supplier" } },
        },
      },
      "/api/v1/opportunities/{id}/join": {
        post: {
          summary: "Supplier self-applies to an open RFQ (returns the reply token)",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Joined" }, "400": { description: "Not eligible" }, "403": { description: "Not a supplier" } },
        },
      },
      "/api/v1/notifications": {
        get: { summary: "List notifications + unread count (session token)", responses: { "200": { description: "Notifications" } } },
        post: { summary: "Mark all notifications read", responses: { "200": { description: "OK" } } },
      },
      "/api/v1/credits": {
        get: { summary: "Credit balance, packages, and ledger", responses: { "200": { description: "Credits" } } },
      },
      "/api/v1/credits/purchase": {
        post: {
          summary: "Buy a credit package (Stripe Checkout URL or demo grant)",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { type: "object", required: ["packageId"], properties: { packageId: { type: "string" } } },
              },
            },
          },
          responses: { "200": { description: "checkoutUrl or granted balance" }, "400": { description: "Unknown package" } },
        },
      },
      "/api/v1/taxonomy": {
        get: { summary: "Categories and regions for client pickers", responses: { "200": { description: "Taxonomy" } } },
      },
      "/api/v1/profile": {
        get: { summary: "Supplier matching profile (session token)", responses: { "200": { description: "Profile" }, "403": { description: "Not a supplier" } } },
        put: {
          summary: "Update the supplier matching profile",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    description: { type: "string" },
                    certifications: { type: "string" },
                    nationwide: { type: "boolean" },
                    categoryIds: { type: "array", items: { type: "string" } },
                    regionIds: { type: "array", items: { type: "string" } },
                  },
                },
              },
            },
          },
          responses: { "200": { description: "Saved profile" }, "403": { description: "Not a supplier" } },
        },
      },
    },
    components: {
      securitySchemes: { bearerAuth: { type: "http", scheme: "bearer" } },
    },
    security: [{ bearerAuth: [] }],
  });
}
