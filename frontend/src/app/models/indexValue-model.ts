export class IndexModel {
    public position: number;
    public value: number;
    public type: string;

    constructor(data: any) {
        if (data) {
            this.position = data.position;
            this.value = data.value;
            this.type = data.type;
        }
    }
}