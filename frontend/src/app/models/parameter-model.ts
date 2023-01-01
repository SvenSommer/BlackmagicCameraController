export class Parameter {
    public id: number;
    public group: string;
    public group_id : number;
    public parameter : string;
    public normalized_parameter : string;
    public index : any;
    public minimum: number;
    public maximum: number;
    public interpretation : string;
    public type: string
    public discrete: any

    constructor(data: any) {
        if (data) {
            this.id = data.id;
            this.group = data.group;
            this.group_id = data.group_id;
            this.parameter = data.parameter;
            this.normalized_parameter = data.normalized_parameter;
            this.index = data.index;
            this.minimum = data.minimum;
            this.maximum = data.maximum;
            this.interpretation = data.interpretation;
            this.type = data.type;
            this.discrete = data.discrete;
        }
    }
}