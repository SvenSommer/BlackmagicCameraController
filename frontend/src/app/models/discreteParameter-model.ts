export class DiscreteParameter {
    public value: number;
    public interpreation: string;
   
    constructor(data: any) {
        if (data) {
            this.value = data.value;
            this.interpreation = data.interpreation;
        }
    }
}