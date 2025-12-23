import { beforeEach, describe, expect, it } from "vitest";
import env from "./env";

describe("env", () => {
  beforeEach(() => {
    // Clear all properties from env before each test
    Object.keys(env).forEach((key) => {
      if (typeof env[key] !== "function") {
        delete env[key];
      }
    });
  });

  describe("Initialization", () => {
    it("should be a function", () => {
      expect(typeof env).toBe("function");
    });

    it("should return itself when called", () => {
      const result = env({});
      expect(result).toBe(env);
    });

    it("should merge properties into itself", () => {
      const mockEnv = {
        DB: "mock-database",
        API_KEY: "secret",
      };

      env(mockEnv);

      expect(env.DB).toBe("mock-database");
      expect(env.API_KEY).toBe("secret");
    });

    it("should handle empty object", () => {
      expect(() => env({})).not.toThrow();
      const result = env({});
      expect(result).toBe(env);
    });

    it("should store D1 database binding", () => {
      const mockDB = { prepare: () => {} };
      env({ DB: mockDB });

      expect(env.DB).toBe(mockDB);
    });

    it("should store KV namespace bindings", () => {
      const mockKV = {
        get: () => {},
        put: () => {},
        delete: () => {},
      };

      env({
        USERS_KV: mockKV,
        DECKS_KV: mockKV,
        CARDS_KV: mockKV,
      });

      expect(env.USERS_KV).toBe(mockKV);
      expect(env.DECKS_KV).toBe(mockKV);
      expect(env.CARDS_KV).toBe(mockKV);
    });

    it("should store secret values", () => {
      env({
        GOOGLE_CLIENT_ID: "client-id",
        GOOGLE_CLIENT_SECRET: "client-secret",
        JWT_SECRET: "jwt-secret",
      });

      expect(env.GOOGLE_CLIENT_ID).toBe("client-id");
      expect(env.GOOGLE_CLIENT_SECRET).toBe("client-secret");
      expect(env.JWT_SECRET).toBe("jwt-secret");
    });
  });

  describe("Multiple calls", () => {
    it("should merge properties from multiple calls", () => {
      env({ DB: "database" });
      env({ API_KEY: "secret" });
      env({ KV: "kv-namespace" });

      expect(env.DB).toBe("database");
      expect(env.API_KEY).toBe("secret");
      expect(env.KV).toBe("kv-namespace");
    });

    it("should overwrite properties on subsequent calls", () => {
      env({ DB: "database-1" });
      expect(env.DB).toBe("database-1");

      env({ DB: "database-2" });
      expect(env.DB).toBe("database-2");
    });

    it("should preserve existing properties when adding new ones", () => {
      env({ DB: "database" });
      env({ API_KEY: "secret" });

      expect(env.DB).toBe("database");
      expect(env.API_KEY).toBe("secret");
    });
  });

  describe("Property access", () => {
    it("should allow direct property access", () => {
      const mockDB = { name: "test-db" };
      env({ DB: mockDB });

      expect(env.DB).toBe(mockDB);
      expect(env.DB.name).toBe("test-db");
    });

    it("should return undefined for unset properties", () => {
      expect(env.NONEXISTENT).toBeUndefined();
    });

    it("should allow checking for property existence", () => {
      env({ DB: "database" });

      expect("DB" in env).toBe(true);
      expect("NONEXISTENT" in env).toBe(false);
    });

    it("should work with Object.keys", () => {
      env({ DB: "database", API_KEY: "secret" });

      const keys = Object.keys(env);
      expect(keys).toContain("DB");
      expect(keys).toContain("API_KEY");
    });

    it("should allow property deletion", () => {
      env({ DB: "database" });
      expect(env.DB).toBe("database");

      delete env.DB;
      expect(env.DB).toBeUndefined();
    });
  });

  describe("Type handling", () => {
    it("should handle object bindings", () => {
      const mockBinding = {
        method: () => "result",
        property: "value",
      };

      env({ BINDING: mockBinding });

      expect(env.BINDING).toBe(mockBinding);
      expect(env.BINDING.method()).toBe("result");
      expect(env.BINDING.property).toBe("value");
    });

    it("should handle string values", () => {
      env({ SECRET: "my-secret" });
      expect(env.SECRET).toBe("my-secret");
      expect(typeof env.SECRET).toBe("string");
    });

    it("should handle number values", () => {
      env({ PORT: 3000 });
      expect(env.PORT).toBe(3000);
      expect(typeof env.PORT).toBe("number");
    });

    it("should handle boolean values", () => {
      env({ DEBUG: true });
      expect(env.DEBUG).toBe(true);
      expect(typeof env.DEBUG).toBe("boolean");
    });

    it("should handle null values", () => {
      env({ NULL_VALUE: null });
      expect(env.NULL_VALUE).toBeNull();
    });

    it("should handle undefined values", () => {
      env({ UNDEFINED_VALUE: undefined });
      expect(env.UNDEFINED_VALUE).toBeUndefined();
    });

    it("should handle function values", () => {
      const mockFn = () => "result";
      env({ FN: mockFn });

      expect(env.FN).toBe(mockFn);
      expect(env.FN()).toBe("result");
    });

    it("should handle array values", () => {
      const mockArray = [1, 2, 3];
      env({ ARRAY: mockArray });

      expect(env.ARRAY).toBe(mockArray);
      expect(env.ARRAY).toEqual([1, 2, 3]);
    });
  });

  describe("Realistic usage", () => {
    it("should work like a Cloudflare Workers environment", () => {
      const mockEnvironment = {
        DB: {
          prepare: (sql) => ({
            bind: (...args) => ({
              run: async () => ({ success: true }),
              all: async () => ({ results: [] }),
              first: async () => null,
            }),
          }),
        },
        USERS_KV: {
          get: async (key) => null,
          put: async (key, value) => {},
          delete: async (key) => {},
        },
        GOOGLE_CLIENT_ID: "123456789.apps.googleusercontent.com",
        GOOGLE_CLIENT_SECRET: "GOCSPX-abc123",
      };

      env(mockEnvironment);

      expect(env.DB).toBeDefined();
      expect(env.DB.prepare).toBeTypeOf("function");
      expect(env.USERS_KV).toBeDefined();
      expect(env.USERS_KV.get).toBeTypeOf("function");
      expect(env.GOOGLE_CLIENT_ID).toBe(
        "123456789.apps.googleusercontent.com",
      );
    });

    it("should work in a fetch handler context", () => {
      const mockEnv = {
        DB: "database",
        API_KEY: "secret",
      };

      // Simulate Worker fetch handler
      const fetch = (request, environment) => {
        env(environment);
        return new Response("OK");
      };

      fetch(new Request("https://example.com"), mockEnv);

      expect(env.DB).toBe("database");
      expect(env.API_KEY).toBe("secret");
    });

    it("should be accessible from imported modules", () => {
      // Simulate module importing env
      env({ DB: "shared-database" });

      // Another module accesses env
      const getDB = () => env.DB;

      expect(getDB()).toBe("shared-database");
    });
  });

  describe("Edge cases", () => {
    it("should not throw when called without arguments", () => {
      expect(() => env()).not.toThrow();
    });

    it("should handle being called with null", () => {
      expect(() => env(null)).not.toThrow();
    });

    it("should handle nested objects", () => {
      const nested = {
        outer: {
          inner: {
            value: "deep",
          },
        },
      };

      env({ NESTED: nested });

      expect(env.NESTED.outer.inner.value).toBe("deep");
    });

    it("should handle properties with special names", () => {
      env({
        constructor: "not-the-constructor",
        prototype: "not-the-prototype",
        __proto__: "not-the-proto",
      });

      // These should be set as regular properties
      expect(env.constructor).toBe("not-the-constructor");
      expect(env.prototype).toBe("not-the-prototype");
    });

    it("should handle many properties", () => {
      const manyProps = {};
      for (let i = 0; i < 100; i++) {
        manyProps[`PROP_${i}`] = i;
      }

      env(manyProps);

      expect(env.PROP_0).toBe(0);
      expect(env.PROP_99).toBe(99);
      expect(Object.keys(env).length).toBeGreaterThanOrEqual(100);
    });
  });

  describe("Integration scenarios", () => {
    it("should support typical Worker initialization", () => {
      // Simulate wrangler.toml bindings
      const bindings = {
        DB: {
          prepare: () => ({}),
        },
        USERS_KV: {},
        DECKS_KV: {},
        CARDS_KV: {},
        SESSIONS_KV: {},
        GOOGLE_CLIENT_ID: "test-client-id",
        GOOGLE_CLIENT_SECRET: "test-secret",
      };

      env(bindings);

      // Verify all bindings are accessible
      expect(env.DB).toBeDefined();
      expect(env.USERS_KV).toBeDefined();
      expect(env.DECKS_KV).toBeDefined();
      expect(env.CARDS_KV).toBeDefined();
      expect(env.SESSIONS_KV).toBeDefined();
      expect(env.GOOGLE_CLIENT_ID).toBe("test-client-id");
      expect(env.GOOGLE_CLIENT_SECRET).toBe("test-secret");
    });

    it("should support incremental environment setup", () => {
      // First call: basic bindings
      env({ DB: "database" });
      expect(env.DB).toBe("database");

      // Second call: add secrets
      env({ API_KEY: "secret" });
      expect(env.DB).toBe("database");
      expect(env.API_KEY).toBe("secret");

      // Third call: add more bindings
      env({ KV: "kv-namespace" });
      expect(env.DB).toBe("database");
      expect(env.API_KEY).toBe("secret");
      expect(env.KV).toBe("kv-namespace");
    });
  });

  describe("Memory and performance", () => {
    it("should handle rapid successive calls", () => {
      for (let i = 0; i < 1000; i++) {
        env({ [`PROP_${i}`]: i });
      }

      expect(env.PROP_0).toBe(0);
      expect(env.PROP_999).toBe(999);
    });

    it("should not leak memory on property deletion", () => {
      env({ TEMP: "value" });
      expect(env.TEMP).toBe("value");

      delete env.TEMP;
      expect(env.TEMP).toBeUndefined();
      expect("TEMP" in env).toBe(false);
    });
  });
});
