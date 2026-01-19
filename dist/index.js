// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "rep"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var repActivityLog = mysqlTable("rep_activity_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  placeId: varchar("placeId", { length: 64 }).notNull(),
  signalSlug: varchar("signalSlug", { length: 128 }).notNull(),
  tapCount: int("tapCount").notNull().default(1),
  source: mysqlEnum("source", ["manual", "batch"]).default("manual").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var batchImportJobs = mysqlTable("batch_import_jobs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  totalRows: int("totalRows").notNull().default(0),
  successCount: int("successCount").notNull().default(0),
  failedCount: int("failedCount").notNull().default(0),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  errorLog: text("errorLog"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt")
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/db.ts
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/routers.ts
import { TRPCError as TRPCError2 } from "@trpc/server";
import { z } from "zod";

// server/supabaseDb.ts
import postgres from "postgres";
var _sql = null;
function getSupabaseDb() {
  if (!_sql && process.env.SUPABASE_DATABASE_URL) {
    try {
      _sql = postgres(process.env.SUPABASE_DATABASE_URL, {
        ssl: { rejectUnauthorized: false },
        max: 10,
        idle_timeout: 20,
        connect_timeout: 30
      });
    } catch (error) {
      console.warn("[Supabase] Failed to connect:", error);
      _sql = null;
    }
  }
  return _sql;
}
async function searchPlaces(query, limit = 50, offset = 0) {
  const sql = getSupabaseDb();
  if (!sql) return [];
  const searchPattern = `%${query}%`;
  const result = await sql`
    SELECT id, name, description, primary_category, category, lat, lng,
           address_line1, city, state, postal_code, country, phone, website,
           cover_image_url, is_active, fsq_place_id, created_at, updated_at
    FROM places
    WHERE name ILIKE ${searchPattern}
       OR city ILIKE ${searchPattern}
       OR address_line1 ILIKE ${searchPattern}
    ORDER BY name ASC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return result;
}
async function getPlaceById(placeId) {
  const sql = getSupabaseDb();
  if (!sql) return null;
  const result = await sql`
    SELECT id, name, description, primary_category, category, lat, lng,
           address_line1, city, state, postal_code, country, phone, website,
           cover_image_url, is_active, fsq_place_id, created_at, updated_at
    FROM places
    WHERE id = ${placeId}
    LIMIT 1
  `;
  return result.length > 0 ? result[0] : null;
}
async function getPlacesCount() {
  const sql = getSupabaseDb();
  if (!sql) return 0;
  const result = await sql`SELECT COUNT(*) as count FROM places`;
  return parseInt(result[0].count, 10);
}
async function getAllReviewItems() {
  const sql = getSupabaseDb();
  if (!sql) return [];
  const result = await sql`
    SELECT id, slug, label, icon_emoji, signal_type, color, is_universal, sort_order, is_active
    FROM review_items
    WHERE is_active = true
    ORDER BY signal_type, sort_order ASC
  `;
  return result;
}
async function getReviewItemsByType(signalType) {
  const sql = getSupabaseDb();
  if (!sql) return [];
  const result = await sql`
    SELECT id, slug, label, icon_emoji, signal_type, color, is_universal, sort_order, is_active
    FROM review_items
    WHERE signal_type = ${signalType} AND is_active = true
    ORDER BY sort_order ASC
  `;
  return result;
}
async function getPlaceSignalAggregates(placeId) {
  const sql = getSupabaseDb();
  if (!sql) return [];
  const result = await sql`
    SELECT psa.place_id, psa.signal_id, ri.slug as signal_slug, ri.signal_type, 
           psa.bucket, psa.tap_total, psa.review_count, psa.last_tap_at
    FROM place_signal_aggregates psa
    LEFT JOIN review_items ri ON ri.id = psa.signal_id
    WHERE psa.place_id = ${placeId}
    ORDER BY psa.tap_total DESC
  `;
  return result;
}
async function upsertPlaceSignalAggregate(placeId, signalId, bucket, tapCount) {
  const sql = getSupabaseDb();
  if (!sql) return;
  await sql`
    INSERT INTO place_signal_aggregates (place_id, signal_id, bucket, tap_total, review_count, last_tap_at)
    VALUES (${placeId}, ${signalId}, ${bucket}, ${tapCount}, 1, NOW())
    ON CONFLICT (place_id, signal_id, bucket)
    DO UPDATE SET
      tap_total = place_signal_aggregates.tap_total + ${tapCount},
      review_count = place_signal_aggregates.review_count + 1,
      last_tap_at = NOW()
  `;
}
async function batchImportReviews(reviews, repUserId) {
  const sql = getSupabaseDb();
  if (!sql) return { success: 0, failed: reviews.length, errors: ["Database not connected"] };
  let success = 0;
  let failed = 0;
  const errors = [];
  for (const review of reviews) {
    try {
      const signalResult = await sql`
        SELECT id, signal_type FROM review_items WHERE slug = ${review.signal_slug} LIMIT 1
      `;
      if (signalResult.length === 0) {
        errors.push(`Signal not found: ${review.signal_slug}`);
        failed++;
        continue;
      }
      const signalId = signalResult[0].id;
      const signalType = signalResult[0].signal_type;
      const bucket = signalType === "best_for" ? "positive" : signalType === "heads_up" ? "negative" : "neutral";
      const reviewResult = await sql`
        INSERT INTO reviews (place_id, user_id, created_at, updated_at)
        VALUES (${review.place_id}, ${repUserId}, NOW(), NOW())
        RETURNING id
      `;
      if (reviewResult.length === 0) {
        errors.push(`Failed to create review for place: ${review.place_id}`);
        failed++;
        continue;
      }
      const reviewId = reviewResult[0].id;
      await sql`
        INSERT INTO review_signals (review_id, signal_id, intensity, created_at)
        VALUES (${reviewId}, ${signalId}, ${review.tap_count}, NOW())
      `;
      await upsertPlaceSignalAggregate(review.place_id, signalId, bucket, review.tap_count);
      success++;
    } catch (error) {
      errors.push(`Error processing review for place ${review.place_id}: ${error}`);
      failed++;
    }
  }
  return { success, failed, errors };
}
async function getRepStats(userId) {
  const sql = getSupabaseDb();
  if (!sql) return { total_reviews: 0, reviews_today: 0, reviews_this_week: 0, places_reviewed: 0 };
  const result = await sql`
    SELECT 
      COUNT(*) as total_reviews,
      COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as reviews_today,
      COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as reviews_this_week,
      COUNT(DISTINCT place_id) as places_reviewed
    FROM reviews
    WHERE user_id = ${userId}
  `;
  return {
    total_reviews: parseInt(result[0].total_reviews, 10),
    reviews_today: parseInt(result[0].reviews_today, 10),
    reviews_this_week: parseInt(result[0].reviews_this_week, 10),
    places_reviewed: parseInt(result[0].places_reviewed, 10)
  };
}

// server/routers.ts
import { eq as eq2, desc } from "drizzle-orm";

// server/ghl.ts
var GHL_API_URL = "https://rest.gohighlevel.com/v1";
async function createGHLContact(contactData, apiKey, locationId) {
  try {
    const response = await fetch(`${GHL_API_URL}/contacts/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...contactData,
        locationId,
        source: "TavvY Pros Portal"
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("GHL API Error:", response.status, errorText);
      return {
        success: false,
        error: `GHL API Error: ${response.status}`
      };
    }
    const data = await response.json();
    return {
      success: true,
      contactId: data.contact.id
    };
  } catch (error) {
    console.error("GHL Contact Creation Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
async function updateGHLContact(contactId, contactData, apiKey) {
  try {
    const response = await fetch(`${GHL_API_URL}/contacts/${contactId}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(contactData)
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("GHL Update Error:", response.status, errorText);
      return {
        success: false,
        error: `GHL API Error: ${response.status}`
      };
    }
    return { success: true };
  } catch (error) {
    console.error("GHL Contact Update Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
async function findGHLContactByEmail(email, apiKey, locationId) {
  try {
    const response = await fetch(
      `${GHL_API_URL}/contacts/lookup?email=${encodeURIComponent(email)}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`
        }
      }
    );
    if (!response.ok) {
      return { found: false };
    }
    const data = await response.json();
    if (data.contacts && data.contacts.length > 0) {
      return { found: true, contactId: data.contacts[0].id };
    }
    return { found: false };
  } catch (error) {
    console.error("GHL Contact Search Error:", error);
    return {
      found: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
async function addGHLContactTags(contactId, tags, apiKey) {
  try {
    const response = await fetch(`${GHL_API_URL}/contacts/${contactId}/tags`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ tags })
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("GHL Tags Error:", response.status, errorText);
      return {
        success: false,
        error: `GHL API Error: ${response.status}`
      };
    }
    return { success: true };
  } catch (error) {
    console.error("GHL Add Tags Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
async function syncProToGHL(proData, apiKey, locationId) {
  const nameParts = proData.fullName.trim().split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";
  const existing = await findGHLContactByEmail(proData.email, apiKey, locationId);
  if (existing.found && existing.contactId) {
    const updateResult = await updateGHLContact(
      existing.contactId,
      {
        firstName,
        lastName,
        phone: proData.phone,
        companyName: proData.businessName,
        city: proData.city,
        state: proData.state,
        postalCode: proData.zipCode,
        website: proData.website
      },
      apiKey
    );
    if (updateResult.success) {
      await addGHLContactTags(
        existing.contactId,
        ["TavvY Pro", "Paid Member", ...proData.services || []],
        apiKey
      );
    }
    return {
      success: updateResult.success,
      contactId: existing.contactId,
      error: updateResult.error
    };
  }
  const createResult = await createGHLContact(
    {
      firstName,
      lastName,
      email: proData.email,
      phone: proData.phone,
      companyName: proData.businessName,
      city: proData.city,
      state: proData.state,
      postalCode: proData.zipCode,
      website: proData.website,
      tags: ["TavvY Pro", "New Signup", ...proData.services || []],
      customField: proData.yearsExperience ? { years_experience: String(proData.yearsExperience) } : void 0
    },
    apiKey,
    locationId
  );
  return createResult;
}

// server/supabaseAuth.ts
import { createClient } from "@supabase/supabase-js";
var supabaseUrl = process.env.VITE_SUPABASE_URL;
var supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
var supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
var supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
var supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
async function signInWithEmail(email, password) {
  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email,
    password
  });
  if (error) {
    return { user: null, session: null, error: error.message };
  }
  return { user: data.user, session: data.session, error: null };
}
async function verifySupabaseToken(token) {
  const {
    data: { user },
    error
  } = await supabaseAuth.auth.getUser(token);
  if (error || !user) {
    return null;
  }
  return user;
}

// server/routers.ts
var AUTH_COOKIE_NAME = "tavvy_auth_token";
var SUPER_ADMIN_EMAIL = "daniel@360forbusiness.com";
var appRouter = router({
  // Auth router - Login only (no signup)
  auth: router({
    me: publicProcedure.query(async ({ ctx }) => {
      const token = ctx.req.cookies?.[AUTH_COOKIE_NAME];
      if (!token) return null;
      const user = await verifySupabaseToken(token);
      if (!user) return null;
      const isSuperAdmin = user.email === SUPER_ADMIN_EMAIL;
      return {
        id: user.id,
        openId: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        role: isSuperAdmin ? "super_admin" : "pro",
        isSuperAdmin
      };
    }),
    login: publicProcedure.input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6)
      })
    ).mutation(async ({ ctx, input }) => {
      const { user, session, error } = await signInWithEmail(
        input.email,
        input.password
      );
      if (error || !user || !session) {
        throw new TRPCError2({
          code: "UNAUTHORIZED",
          message: error || "Invalid credentials"
        });
      }
      ctx.res.cookie(AUTH_COOKIE_NAME, session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7 * 1e3,
        // 7 days
        path: "/"
      });
      const isSuperAdmin = user.email === SUPER_ADMIN_EMAIL;
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email?.split("@")[0],
          isSuperAdmin
        }
      };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(AUTH_COOKIE_NAME, { path: "/" });
      return { success: true };
    })
  }),
  // Places router - search and manage places from Supabase
  places: router({
    search: protectedProcedure.input(
      z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0)
      })
    ).query(async ({ input }) => {
      return searchPlaces(input.query, input.limit, input.offset);
    }),
    getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
      return getPlaceById(input.id);
    }),
    getCount: protectedProcedure.query(async () => {
      return getPlacesCount();
    }),
    getSignals: protectedProcedure.input(z.object({ placeId: z.string() })).query(async ({ input }) => {
      return getPlaceSignalAggregates(input.placeId);
    })
  }),
  // Signals router - get signal definitions
  signals: router({
    getAll: protectedProcedure.query(async () => {
      return getAllReviewItems();
    }),
    getByType: protectedProcedure.input(z.object({ type: z.enum(["best_for", "vibe", "heads_up"]) })).query(async ({ input }) => {
      return getReviewItemsByType(input.type);
    })
  }),
  // Reviews router - submit reviews
  reviews: router({
    submitQuick: protectedProcedure.input(
      z.object({
        placeId: z.string(),
        signals: z.array(
          z.object({
            signalSlug: z.string(),
            tapCount: z.number().min(1).max(3)
          })
        )
      })
    ).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError2({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available"
        });
      const userId = ctx.user?.id || "anonymous";
      for (const signal of input.signals) {
        await db.insert(repActivityLog).values({
          oderId: userId,
          placeId: input.placeId,
          signalSlug: signal.signalSlug,
          tapCount: signal.tapCount,
          source: "manual"
        });
      }
      const batchInput = input.signals.map((s) => ({
        place_id: input.placeId,
        signal_slug: s.signalSlug,
        tap_count: s.tapCount
      }));
      const result = await batchImportReviews(batchInput, userId);
      return result;
    }),
    batchImport: protectedProcedure.input(
      z.object({
        reviews: z.array(
          z.object({
            place_id: z.string(),
            signal_slug: z.string(),
            tap_count: z.number().min(1).max(10)
          })
        ),
        fileName: z.string()
      })
    ).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError2({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available"
        });
      const userId = ctx.user?.id || "anonymous";
      const jobResult = await db.insert(batchImportJobs).values({
        oderId: userId,
        fileName: input.fileName,
        totalRows: input.reviews.length,
        status: "processing"
      });
      const jobId = jobResult[0].insertId;
      for (const review of input.reviews) {
        await db.insert(repActivityLog).values({
          oderId: userId,
          placeId: review.place_id,
          signalSlug: review.signal_slug,
          tapCount: review.tap_count,
          source: "batch"
        });
      }
      const result = await batchImportReviews(input.reviews, userId);
      await db.update(batchImportJobs).set({
        successCount: result.success,
        failedCount: result.failed,
        status: "completed",
        errorLog: result.errors.length > 0 ? result.errors.join("\n") : null,
        completedAt: /* @__PURE__ */ new Date()
      }).where(eq2(batchImportJobs.id, Number(jobId)));
      return { jobId, ...result };
    })
  }),
  // GoHighLevel sync router
  ghl: router({
    syncContact: publicProcedure.input(
      z.object({
        email: z.string().email(),
        fullName: z.string().min(1),
        phone: z.string().optional(),
        businessName: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        website: z.string().optional(),
        services: z.array(z.string()).optional(),
        yearsExperience: z.number().optional()
      })
    ).mutation(async ({ input }) => {
      const apiKey = process.env.GHL_API_KEY;
      const locationId = process.env.GHL_LOCATION_ID;
      if (!apiKey || !locationId) {
        console.warn("GHL credentials not configured");
        return { success: false, error: "GHL not configured" };
      }
      const result = await syncProToGHL(input, apiKey, locationId);
      return result;
    })
  }),
  // Rep stats router
  stats: router({
    getMyStats: protectedProcedure.query(async ({ ctx }) => {
      const userId = ctx.user?.id || ctx.user?.openId || "anonymous";
      return getRepStats(userId);
    }),
    getActivityLog: protectedProcedure.input(
      z.object({
        limit: z.number().min(1).max(100).default(50)
      }).optional()
    ).query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const oderId = ctx.user?.id || "anonymous";
      return db.select().from(repActivityLog).where(eq2(repActivityLog.oderId, oderId)).orderBy(desc(repActivityLog.createdAt)).limit(50);
    }),
    getBatchJobs: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const oderId = ctx.user?.id || "anonymous";
      return db.select().from(batchImportJobs).where(eq2(batchImportJobs.oderId, oderId)).orderBy(desc(batchImportJobs.createdAt)).limit(20);
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
