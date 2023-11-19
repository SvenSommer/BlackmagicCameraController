import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LogsService } from '../services/logs.service';
import { interval, Subscription } from 'rxjs';
import { ShutdownService } from '../services/shutdown.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

interface ServiceData {
  name: string;
  status: string;
  logData: string;
}

@Component({
  selector: 'app-logs-modal',
  templateUrl: './logs-modal.component.html',
  styleUrls: ['./logs-modal.component.css']
})
export class LogsModalComponent implements OnInit {
  services: ServiceData[] = [
    { name: 'backend', status: '', logData: '' },
    { name: 'frontend', status: '', logData: '' },
    { name: 'tally_listener', status: '', logData: '' }
  ];
  private refreshInterval$: Subscription;
  refreshCountdown: number = 5;
  constructor(
    public dialog: MatDialog,
    private logsService: LogsService,
    private shutdownService: ShutdownService) { }

  ngOnInit() {
    this.services.forEach(service => {
      this.loadServiceData(service);
    });

    this.startAutoRefresh();
  }

  ngOnDestroy() {
    if (this.refreshInterval$) {
      this.refreshInterval$.unsubscribe();
    }
  }

  restartService(service: any) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        message: 'Sind Sie sicher, dass Sie den Service ' + service + ' neu starten möchten?',
        confirmButtonText: 'Neu starten',
        confirmAction: () => this.shutdownService.restartService(service)
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Service ' + service + 'restart confirmed');
      } else {
        console.log('Service ' + service + ' restart cancelled');
      }
    });
  }

  refreshLogs(service: ServiceData) {
    this.loadServiceData(service);
    this.resetAutoRefresh();
  }

  private startAutoRefresh() {
    this.refreshInterval$ = interval(1000).subscribe(() => {
      this.refreshCountdown -= 1;
      if (this.refreshCountdown === 0) {
        this.services.forEach(service => {
          this.loadServiceData(service);
        });
        this.refreshCountdown = 5;
      }
    });
  }

  private resetAutoRefresh() {
    this.refreshCountdown = 5;
  }

  private loadServiceData(service: ServiceData) {
    // Laden des Service-Status
    this.shutdownService.getServiceStatus(service.name).subscribe(
      response => {
        service.status = response.status;
      },
      error => {
        console.error('Error loading service status:', error);
        service.status = 'error'; // oder eine andere geeignete Fehlerbehandlung
      }
    );

    // Laden der Log-Daten
    this.logsService.getLog(service.name).subscribe(
      data => {
        service.logData = data;
      },
      error => {
        console.error('Error loading log data:', error);
        service.logData = 'Log data could not be loaded.';
      }
    );
  }
}
