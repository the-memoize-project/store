import env from "@env";

class Google {
  static async me(accessToken) {
    const user = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .then((json) => ({
        avatarUrl: json.picture,
        email: json.email,
        key: json.sub,
        name: json.name,
      }));

    return user;
  }
}

export default Google;
