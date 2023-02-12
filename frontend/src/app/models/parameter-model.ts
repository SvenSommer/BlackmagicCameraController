import { DiscreteParameter } from "./discreteParameter-model";
import { Index } from "./index-model";
type Nullable<T> = T | null;
export class Parameter {
    public id: number;
    public group: string;
    public group_id : number;
    public unique_id: string;
    public parameter : string;
    public normalized_parameter : string;
    public index : [Index];
    public minimum: Nullable<number>;
    public maximum: Nullable<number>;
    public interpretation : string;
    public type: string
    public discrete: [DiscreteParameter]
    public value: any
    public visible: boolean;
    
    constructor(data: any) {
        if (data) {
            this.id = data.id;
            this.group = data.group;
            this.unique_id = `${this.group_id}_${this.id}`; // Combine id and group_id to create unique identifier
            this.group_id = data.group_id;
            this.parameter = data.parameter;
            this.normalized_parameter = data.normalized_parameter;
            this.index = data.index;
            this.minimum = data.minimum;
            this.maximum = data.maximum;
            this.interpretation = data.interpretation;
            this.type = data.type;
            this.discrete = data.discrete;
            this.visible = true;
        }
    }
}