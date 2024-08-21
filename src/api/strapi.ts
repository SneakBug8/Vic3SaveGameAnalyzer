import axios from "axios";
import { Sleep } from "../util/Sleep";
import { RequestRepeater } from "./RequestRepeater";

class StrapiAPIClass
{
  private path = "http://localhost:1337/api";

  public async Get(path: string)
  {
    return RequestRepeater(async () =>
    {
      const res = await axios.get(
        `${this.path}/${path}`);

      return res.data;
    }, {});
  }

  public async GetRaw(path: string)
  {
    const res = await axios.get(
      `${this.path}/${path}`);

    return res.data;
  }

  public async Post(path: string, data: any)
  {
    return RequestRepeater(async () =>
    {
      const res = await axios.post(
        `${this.path}/${path}`, data);

      return res.data;
    }, {});
  }

  public async Put(path: string, data: any)
  {
    return RequestRepeater(async () =>
    {
      const res = await axios.put(
        `${this.path}/${path}`, data);

      return res.data;
    }, {});
  }
}

export const Strapi = new StrapiAPIClass();
