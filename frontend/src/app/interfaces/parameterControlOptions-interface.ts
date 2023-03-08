import { ParameterDataType } from "../models/parameterDataTypes-model";

export interface ParameterControlOptions {
    [ParameterDataType.Number]: ('slider' | 'input field' | 'discrete buttons' | 'increase or decrease buttons')[];
    [ParameterDataType.Boolean]: ('slider' | 'checkbox' | 'button with state coloring')[];
    [ParameterDataType.Void]: ['button'];
    [ParameterDataType.String]: ['input field'];
}