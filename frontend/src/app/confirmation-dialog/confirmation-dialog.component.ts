import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css']
})
export class ConfirmationDialogComponent implements OnInit {
  public backendResponse: string | null = null;
  public parsedResponse: any = null;
  public isLoading = false;

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    // Initialization logic if needed
  }

  onConfirm(): void {
    this.isLoading = true;
    this.data.confirmAction().subscribe(
      (response: any) => {
        // Assuming the response is a JSON object with 'status' and 'message' fields
        if (response && response.status && response.message) {
          this.backendResponse = `Status: ${response.status}\nMessage: ${response.message}`;
        } else {
          // If the response does not have the expected format
          this.backendResponse = JSON.stringify(response, null, 2);
        }
        this.isLoading = false;
      },
      (error: any) => {
        if (error.error && typeof error.error.detail === 'string') {
          try {
            // Attempt to parse the error detail as JSON
            const errorDetail = JSON.parse(error.error.detail);
            this.backendResponse = `Error: ${errorDetail.error_message}`;
          } catch (jsonParseError) {
            // If parsing fails, use the raw detail
            this.backendResponse = `Error: ${error.error.detail}`;
          }
        } else {
          this.backendResponse = 'An unknown error occurred';
        }
        this.isLoading = false;
      }
    );
  }

  onDismiss(): void {
    this.dialogRef.close(false);
  }
}
