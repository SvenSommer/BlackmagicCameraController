import { IndexModel } from "./indexValue-model";

export class DiscreteIndexParameter {
    public values: IndexModel[];
    public interpretation: string;
    public isDefaultDay: boolean
    public isDefaultNight: boolean
    public cameraIdInactive: number[]

    constructor(data: any) {
        if (data) {
            this.values = data.values;
            this.interpretation = data.interpretation;
            this.isDefaultDay = data.isDefaultDay;
            this.isDefaultNight = data.isDefaultNight;
            this.cameraIdInactive = data.cameraIdActive
        }
    }
}
