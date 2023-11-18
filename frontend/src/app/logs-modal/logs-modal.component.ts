import { Component, OnInit } from '@angular/core';
import { LogsService } from '../services/logs.service';
import { interval, Subscription } from 'rxjs';

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
  constructor(private logsService: LogsService) {}

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
    this.logsService.getServiceStatus(service.name).subscribe(
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
