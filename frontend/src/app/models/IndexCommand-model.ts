import { DiscreteIndexParameter } from "./discreteIndexParameter-model";
import { Parameter } from "./parameter-model";

export class IndexCommand {
    public camera: number;
    public groupId: number;
    public parameterId: number;
    public parameterType: string;
    public parameterValues: any[];

    constructor(camera_id: number, parameter: Parameter, discreteIndexParameter: DiscreteIndexParameter) {
        if (parameter) {
            this.camera = camera_id;
            this.groupId = parameter.group_id;
            this.parameterId = parameter.id;
            this.parameterType = discreteIndexParameter.values[0]?.type || '';
            this.parameterValues = discreteIndexParameter.values
                .sort((a, b) => a.position - b.position)
                .map((indexModel) => indexModel.value);
        }
    }
}