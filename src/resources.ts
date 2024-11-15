import { ImageSource } from "excalibur";
import { Loader } from './loader';
import sword from "./images/sword.png";

export const Resources = {
  Sword: new ImageSource(sword)
} as const;

export const loader = new Loader();
for (const res of Object.values(Resources)) {
  loader.addResource(res);
}
