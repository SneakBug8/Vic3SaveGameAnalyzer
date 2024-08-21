import axios from "axios";
import { TwitterApi } from "twitter-api-v2";
import { WebApi } from "./web";

if (!process.env.appkey || !process.env.appsecret || !process.env.accessToken || !process.env.accessSecret) {
  console.warn("No valid credentials for Twitter API");
  console.log({
    appKey: process.env.appkey || "",
    appSecret: process.env.appsecret || "",
    accessToken: process.env.accessToken || "",
    accessSecret: process.env.accessSecret || "",
  });
}

if (!process.env.appkey || !process.env.appsecret || !process.env.oauth_token1 || !process.env.oauth_token_secret1) {
  console.warn("No valid credentials for Eng Twitter API");
  console.log({
    appKey: process.env.appkey || "",
    appSecret: process.env.appsecret || "",
    accessToken: process.env.oauth_token1 || "",
    accessSecret: process.env.oauth_token_secret1 || "",
  });
}

const userClient = new TwitterApi({
  appKey: process.env.appkey || "",
  appSecret: process.env.appsecret || "",
  accessToken: process.env.accessToken || "",
  accessSecret: process.env.accessSecret || "",
});

export const engClient = new TwitterApi({
  appKey: process.env.appkey || "",
  appSecret: process.env.appsecret || "",
  accessToken: process.env.oauth_token1 || "",
  accessSecret: process.env.oauth_token_secret1 || "",
});

export async function Auth()
{
  const client = new TwitterApi({
    appKey: process.env.appkey || "",
    appSecret: process.env.appsecret || ""
  });
  // const authLink = await client.generateAuthLink(CALLBACK_URL);
  // property in second parameter to 'authorize' to use oauth/authorize
  // const authLink = await client.generateAuthLink("http://127.0.0.1:5000/twitter/callback");
  const authLink = await client.generateAuthLink("oob");

  // Use URL generated
  console.log(authLink.url);
}

export async function GetSecret()
{
  /*const client = new TwitterApi({
    appKey: process.env.appkey || "",
    appSecret: process.env.appsecret || "",
  });*/

  // const r = await client.v1.post(`oauth/request_token?oauth_token=3YKHBQAAAAAA0Qf4AAABf8gRpbM&oauth_verifier=2OllEZwcIC89G7o2B7Lw2Nv52hp4UaoH`, {
  /*oauth_token: "pc4RzAAAAAAA0Qf4AAABf8gH9FE",
  oauth_verifier: "AUnBDaKos4Ax3Vp3zyX6rV16CI2SR9sO"*/
  // });

  try {

    const r = await axios.post(
      `https://api.twitter.com/oauth/access_token?`
      + `oauth_token=J0BDogAAAAAA0Qf4AAABf8guR94&oauth_verifier=6058493&` +
      `oauth_consumer_key=5tvMDxxoIjKtoWFnACQK0Pktl`);

    /*const r = await client.v1.post(`oauth/request_token?`, {
      oauth_token: "pc4RzAAAAAAA0Qf4AAABf8gH9FE",
      oauth_verifier: "AUnBDaKos4Ax3Vp3zyX6rV16CI2SR9sO"
    });*/

    console.log(JSON.parse(JSON.stringify(r.data)));
  }
  catch (e) {
    console.log(JSON.parse(JSON.stringify(e)));
  }
}

// Tell typescript it's a readonly app
export const twitterClient = userClient.readWrite;

/*
// Play with the built in methods
const user = await roClient.v2.userByUsername('plhery');
await twitterClient.v1.tweet('Hello, this is a test.');
// You can upload media easily!
await twitterClient.v1.uploadMedia('./big-buck-bunny.mp4');*/
