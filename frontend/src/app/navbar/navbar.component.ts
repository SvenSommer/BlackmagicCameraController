import { Component, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { ShutdownService } from '../services/shutdown.service';
import { LogsModalComponent } from '../logs-modal/logs-modal.component';
import { UpdateCodeService } from '../services/update-code.service';

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
    private shutdownService: ShutdownService,
    private updateService: UpdateCodeService
  ) { }

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

  onUpdate() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        message: 'Sind Sie sicher, dass Sie updaten wollen?',
        confirmButtonText: 'Update',
        confirmAction: () => this.updateService.updateCode()
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Update confirmed');
      } else {
        console.log('Update cancelled');
      }
    });
  }

  onShutdownServer() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        message: 'Sind Sie sicher, dass Sie den Server herunterfahren möchten?',
        confirmButtonText: 'Herunterfahren',
        confirmAction: () => this.shutdownService.shutdownSystem()
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Shutdown initiated');
      } else {
        console.log('Shutdown cancelled');
      }
    });
  }

  }
