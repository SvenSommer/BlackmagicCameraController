import { Camera } from "./camera-model";
import { Parameter } from "./parameter-model";

export class Command {
    public camera: number;
    public groupId: number;
    public parameterId: number;
    public parameterType: string;
    public parameterValue: any;
   
    constructor(camera_id: number, parameter: Parameter) {
        if (parameter) {
            this.camera = camera_id;
            this.groupId = parameter.group_id;
            this.parameterId = parameter.id;
            this.parameterType = parameter.type;
            this.parameterValue = parameter.value;
        }
    }
}