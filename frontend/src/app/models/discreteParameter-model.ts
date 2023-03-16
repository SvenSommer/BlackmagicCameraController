export class DiscreteParameter {
    public value: number;
    public interpretation: string;
    public cameraIdInactive: number[]

    constructor(data: any) {
        if (data) {
            this.value = data.value;
            this.interpretation = data.interpretation;
            this.cameraIdInactive = data.cameraIdActive
        }
    }
}
