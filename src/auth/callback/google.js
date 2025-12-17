import env from "@env";

class Google {
  static async authorization(code) {
    const accessToken = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    })
      .then((response) => response.json())
      .then((json) => json.access_token);

    const user = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .then((json) => ({
        accessToken,
        avatarUrl: json.picture,
        email: json.email,
        key: json.sub,
        name: json.name,
      }));

    return user;
  }
}

export default Google;
