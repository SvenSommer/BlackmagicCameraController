import { Component, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { ShutdownService } from '../services/shutdown.service';
import { LogsModalComponent } from '../logs-modal/logs-modal.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  @Output() configModeChange = new EventEmitter<boolean>();
  @Output() presentationModeChange = new EventEmitter<string>();

  configMode: boolean = false;
  currentPresentationMode: string = "basic";

  constructor(
    public dialog: MatDialog,
    private shutdownService: ShutdownService
    ) {}

  onChangeConfigMode(event: MatSlideToggleChange) {
    this.configMode = event.checked;
    this.configModeChange.emit(event.checked);
  }

  onChangePresentationMode(mode: string) {
    this.currentPresentationMode = mode;
    this.presentationModeChange.emit(this.currentPresentationMode);
  }

  onOpenLogsModal() {
    this.dialog.open(LogsModalComponent, {
      width: '80%', // Breite des Dialogs anpassen
      // Weitere Konfigurationen hier
    });
  }

  onShutdownServer() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.shutdownService.shutdownSystem().subscribe(response => {
          console.log('Shutdown response:', response);
          // Handle response
        }, error => {
          console.error('Shutdown error:', error);
          // Handle error
        });
      } else {
        console.log('Shutdown cancelled');
      }
    });
  }
}
