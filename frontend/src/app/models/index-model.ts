import { DiscreteParameter } from "./discreteParameter-model";
type Nullable<T> = T | null;
export class Index {
    public position: number;
    public type: string
    public name: string;
    public discrete: [DiscreteParameter];
    public minimum: Nullable<number>;
    public maximum: Nullable<number>;
    public interpretation: string;

    constructor(data: any) {
        if (data) {
            this.position = data.position;
            this.type = data.type;
            this.name = data.name;
            this.discrete = data.discrete;
            this.minimum = data.minimum;
            this.maximum = data.maximum;
            this.interpretation = data.interpretation;
        }
    }
}