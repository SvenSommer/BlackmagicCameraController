export class Camera {
    public id: number;
    public name: string;
    public no: number;
   
    constructor(data: any) {
        if (data) {
            this.id = data.id;
            this.name = data.name;
            this.no = data.no;
        }
    }
}