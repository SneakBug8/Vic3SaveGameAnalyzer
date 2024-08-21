import { VK } from "vk-io";

export const VKAPI = new VK({
  token: process.env.vktoken || ""
});
