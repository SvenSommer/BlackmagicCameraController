import { Injectable } from '@angular/core';
import { ParameterDataType } from '../models/parameterDataTypes-model';
import { Parameter } from '../models/parameter-model';

@Injectable({
    providedIn: 'root'
})
export class ParameterService {

    public init(parameter: Parameter) {
        parameter.dataType = this.mapParameterDataType(parameter.type);
        parameter.controlOptions = this.getControlOptions(parameter.dataType);
    }

    private mapParameterDataType(parameterDataType: string): ParameterDataType {
        switch (parameterDataType) {
            case 'int64':
            case 'int32':
            case 'int16':
            case 'int8':
            case 'fixed16':
                return ParameterDataType.Number;
            case 'boolean':
                return ParameterDataType.Boolean;
            case 'void':
                return ParameterDataType.Void;
            case 'string':
                return ParameterDataType.String;
            default:
                throw new Error(`Invalid parameter data type: "${parameterDataType}"`);
        }
    }

    private getControlOptions(dataType: ParameterDataType): string[] {
        switch (dataType) {
            case ParameterDataType.Number:
                return ['slider', 'input field', 'discrete buttons', 'increase or decrease buttons'];
            case ParameterDataType.Boolean:
                return ['toggle', 'checkbox', 'button with state coloring'];
            case ParameterDataType.Void:
            case ParameterDataType.undefined:
                return ['button'];
            case ParameterDataType.String:
                return ['input field'];
            default:
                throw new Error(`Invalid data type: ${dataType}`);
        }
    }

}