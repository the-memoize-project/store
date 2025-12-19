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
        id: json.sub
      }));

    return user;
  }
}

export default Google;
