import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css']
})
export class ConfirmationDialogComponent {

  // You can inject data or services if needed
  constructor(public dialogRef: MatDialogRef<ConfirmationDialogComponent>) {}

  // Method to close the dialog and return true (confirm)
  onConfirm(): void {
    this.dialogRef.close(true);
  }

  // Method to close the dialog and return false (cancel)
  onDismiss(): void {
    this.dialogRef.close(false);
  }
}
