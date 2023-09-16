import { Document } from "mongoose";

export interface IEpisode extends Document {
  title: string;
  text: string;
  type?: string;
  time: string;
  videoAddress: string;
}
