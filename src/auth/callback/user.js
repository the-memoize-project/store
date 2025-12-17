import env from "@env";

class User {
  static async signIn({ avatarUrl, email, key, name }) {
    (await env.ACCOUNT.get(key, { type: "json" })) ??
      (await env.ACCOUNT.put(key, JSON.stringify({ avatarUrl, email, name })));
    return arguments[0];
  }
}

export default User;
