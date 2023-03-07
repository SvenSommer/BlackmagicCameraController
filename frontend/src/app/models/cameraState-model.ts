export class CameraState {
  public parameterUniqueID: string;
  public cameraID: number;
  public value: any;

  constructor(data: any) {
    if (data) {
      this.cameraID = data.cameraId;
      this.parameterUniqueID = data.parameterUniqueID;
      this.value = data.value;
    }
  }

  get uniqueIdentifier(): string {
    return `${this.cameraID}_${this.parameterUniqueID}`;
  }
}