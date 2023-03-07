export class DiscreteParameter {
    public value: number;
    public interpretation: string;
    public isDefault: boolean
    public cameraIdInactive: number[]

    constructor(data: any) {
        if (data) {
            this.value = data.value;
            this.interpretation = data.interpretation;
            this.isDefault = data.isDefault;
            this.cameraIdInactive = data.cameraIdActive
        }
    }
}
