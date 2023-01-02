import { Camera } from "./camera-model";

export class ConfigFile {
    public cameras: [Camera];

   
    constructor(data: any) {
        if (data) {
            this.cameras = data.cameras;
        }
    }
}