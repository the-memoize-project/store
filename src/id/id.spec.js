import { describe, expect, it } from "vitest";
import Id from "./id";

describe("Id", () => {
  describe("Id.new", () => {
    it("should generate a string", () => {
      const id = Id.new();
      expect(typeof id).toBe("string");
    });

    it("should generate non-empty IDs", () => {
      const id = Id.new();
      expect(id.length).toBeGreaterThan(0);
    });

    it("should generate unique IDs", () => {
      const ids = new Set();
      const iterations = 10000;

      for (let i = 0; i < iterations; i++) {
        ids.add(Id.new());
      }

      // All IDs should be unique
      expect(ids.size).toBe(iterations);
    });

    it("should generate URL-safe IDs", () => {
      const id = Id.new();

      // Should only contain base-32 characters (0-9, a-v)
      expect(id).toMatch(/^[0-9a-v]+$/);
    });

    it("should not start with a period", () => {
      // Test multiple times to ensure consistency
      for (let i = 0; i < 100; i++) {
        const id = Id.new();
        expect(id).not.toMatch(/^\./);
        expect(id[0]).not.toBe(".");
      }
    });

    it("should not start with '0.'", () => {
      // Since we slice(2), it should never include "0."
      for (let i = 0; i < 100; i++) {
        const id = Id.new();
        expect(id).not.toMatch(/^0\./);
      }
    });

    it("should be typically 10-11 characters long", () => {
      const ids = Array.from({ length: 100 }, () => Id.new());
      const lengths = ids.map((id) => id.length);

      const minLength = Math.min(...lengths);
      const maxLength = Math.max(...lengths);

      // Based on Math.random() precision, IDs should be around 10-11 chars
      expect(minLength).toBeGreaterThanOrEqual(9);
      expect(maxLength).toBeLessThanOrEqual(12);
    });

    it("should have reasonable average length", () => {
      const ids = Array.from({ length: 1000 }, () => Id.new());
      const avgLength =
        ids.reduce((sum, id) => sum + id.length, 0) / ids.length;

      // Average should be around 10-11
      expect(avgLength).toBeGreaterThan(9);
      expect(avgLength).toBeLessThan(12);
    });

    it("should not contain uppercase letters", () => {
      // Base-32 only uses lowercase
      for (let i = 0; i < 100; i++) {
        const id = Id.new();
        expect(id).toBe(id.toLowerCase());
        expect(id).not.toMatch(/[A-Z]/);
      }
    });

    it("should not contain special characters", () => {
      for (let i = 0; i < 100; i++) {
        const id = Id.new();
        expect(id).not.toMatch(/[^0-9a-v]/);
      }
    });

    it("should generate different IDs on consecutive calls", () => {
      const id1 = Id.new();
      const id2 = Id.new();
      const id3 = Id.new();

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it("should have low collision probability", () => {
      // Generate many IDs and check for collisions
      const ids = new Set();
      const count = 100000;

      for (let i = 0; i < count; i++) {
        ids.add(Id.new());
      }

      // With 100k IDs, we expect near-zero collisions
      const collisions = count - ids.size;
      expect(collisions).toBeLessThan(10); // Allow minimal collisions
    });

    it("should be usable as object keys", () => {
      const map = {};
      const ids = Array.from({ length: 10 }, () => Id.new());

      ids.forEach((id, index) => {
        map[id] = index;
      });

      expect(Object.keys(map).length).toBe(10);
    });

    it("should be usable in URLs", () => {
      const id = Id.new();
      const url = `https://example.com/api/cards/${id}`;

      // Should not require encoding
      expect(url).not.toContain("%");
      expect(decodeURIComponent(url)).toBe(url);
    });

    it("should work with JSON serialization", () => {
      const id = Id.new();
      const obj = { id };
      const json = JSON.stringify(obj);
      const parsed = JSON.parse(json);

      expect(parsed.id).toBe(id);
    });
  });

  describe("Edge cases", () => {
    it("should handle rapid ID generation", () => {
      const ids = [];
      const startTime = Date.now();

      // Generate 10k IDs as fast as possible
      for (let i = 0; i < 10000; i++) {
        ids.push(Id.new());
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should be very fast (< 100ms on modern hardware)
      expect(duration).toBeLessThan(1000);

      // All should still be unique
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should not throw errors", () => {
      expect(() => {
        for (let i = 0; i < 1000; i++) {
          Id.new();
        }
      }).not.toThrow();
    });

    it("should return a new reference each time", () => {
      const id1 = Id.new();
      const id2 = Id.new();

      // Different string references
      expect(id1 === id2).toBe(false);
    });
  });

  describe("Consistency", () => {
    it("should always return strings", () => {
      for (let i = 0; i < 100; i++) {
        const id = Id.new();
        expect(typeof id).toBe("string");
        expect(id).toBeTypeOf("string");
      }
    });

    it("should never return null or undefined", () => {
      for (let i = 0; i < 100; i++) {
        const id = Id.new();
        expect(id).not.toBeNull();
        expect(id).not.toBeUndefined();
      }
    });

    it("should never return empty string", () => {
      for (let i = 0; i < 100; i++) {
        const id = Id.new();
        expect(id).not.toBe("");
        expect(id.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Character distribution", () => {
    it("should use various characters from base-32", () => {
      const ids = Array.from({ length: 1000 }, () => Id.new());
      const allChars = ids.join("");
      const uniqueChars = new Set(allChars.split(""));

      // Should use multiple different characters
      expect(uniqueChars.size).toBeGreaterThan(20); // At least 20 different chars
    });

    it("should include both letters and numbers", () => {
      const ids = Array.from({ length: 100 }, () => Id.new());
      const allChars = ids.join("");

      const hasNumbers = /[0-9]/.test(allChars);
      const hasLetters = /[a-v]/.test(allChars);

      expect(hasNumbers).toBe(true);
      expect(hasLetters).toBe(true);
    });
  });
});
