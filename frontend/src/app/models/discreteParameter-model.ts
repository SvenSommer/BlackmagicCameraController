export class DiscreteParameter {
    public value: number;
    public interpretation: string;
   
    constructor(data: any) {
        if (data) {
            this.value = data.value;
            this.interpretation = data.interpretation;
        }
    }
}