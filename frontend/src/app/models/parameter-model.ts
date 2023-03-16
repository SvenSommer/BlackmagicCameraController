import { DiscreteParameter } from "./discreteParameter-model";
import { ParameterDataType } from "./parameterDataTypes-model";
import { Index } from "./index-model";
import { DiscreteIndexParameter } from "./discreteIndexParameter-model";
type Nullable<T> = T | null;
export class Parameter {
    public id: number;
    public group: string;
    public group_id: number;
    public unique_id: string;
    public parameter: string;
    public normalized_parameter: string;
    public index: [Index];
    public minimum: Nullable<number>;
    public maximum: Nullable<number>;
    public interpretation: string;
    public type: string;
    public dataType: ParameterDataType;
    public controlOptions: string[];
    public controlOptionDecision: string;
    public discrete: [DiscreteParameter]
    public discreteIndex: [DiscreteIndexParameter]
    public value: any;
    public presetActive: boolean;
    public presetValueDay: any;
    public presetValueNight: any;
    public visible: boolean;
    public presentationMode: string;
    public cameraSpecific: boolean;
    public caption: string;
    public row: number;

    /*     constructor(data: any) {
            if (data) {
                this.id = data.id;
                this.group = data.group;
                this.unique_id = `${data.group_id}_${data.id}`; // Combine id and group_id to create unique identifier
                this.group_id = data.group_id;
                this.parameter = data.parameter;
                this.normalized_parameter = data.normalized_parameter;
                this.index = data.index;
                this.minimum = data.minimum;
                this.maximum = data.maximum;
                this.interpretation = data.interpretation;
                this.type = data.type;
                this.controlOptionDecision = data.controlOptionDecision;
                this.discrete = data.discrete;
                this.visible = true;
                this.presentationMode = data.presentationMode || 'basic';
                this.caption = data.caption || data.parameter; // Use data.parameter if data.caption is empty
                this.row = data.row || 1;
                this.col = data.col || 1;
                this.presetActive = data.presetActive
                this.presetValueDay = data.presetValueDay
                this.presetValueNight = data.presetValueNight
                this.cameraSpecific = data.cameraSpecific;
                console.log(this)
                this.dataType = mapParameterDataType(data.type);
                this.controlOptions = getControlOptions(this.dataType);
            } */


}