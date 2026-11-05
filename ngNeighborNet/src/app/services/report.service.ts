import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, catchError, throwError } from 'rxjs';
import { Report } from '../models/report';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private url = environment.baseUrl + 'api/reports';

  constructor(private http: HttpClient, private auth: AuthService) {}

  getHttpOptions() {
    let options = {
      headers: {
        Authorization: 'Basic ' + this.auth.getCredentials(),
        'X-Requested-With': 'XMLHttpRequest',
      },
    };
    return options;
  }

  index(): Observable<Report[]> {
    return this.http.get<Report[]>(this.url).pipe(
      catchError((err: any) => {
        console.error(err);
        return throwError(
          () =>
            new Error('ReportService.index(): error retrieving reports: ' + err)
        );
      })
    );
  }

  showAllUserReportEnabled(): Observable<Report[]> {
    return this.http
      .get<Report[]>(this.url + '/user', this.getHttpOptions())
      .pipe(
        catchError((err: any) => {
          console.error(err);
          return throwError(
            () =>
              new Error(
                'ReportService.index(): error retrieving reports: ' + err
              )
          );
        })
      );
  }

  create(report: Report): Observable<Report> {
    console.log('report.service.ts Firing!!?!?!?');
    console.log(report);
    return this.http.post<Report>(this.url, report, this.getHttpOptions()).pipe(
      catchError((err: any) => {
        console.log(err);
        return throwError(
          () =>
            new Error(
              'report.service.ts - create () : error creating report: ' + err
            )
        );
      })
    );
  }

  showAllEnabled(): Observable<Report[]> {
    return this.http.get<Report[]>(this.url).pipe(
      catchError((err: any) => {
        console.error(err);
        return throwError(
          () =>
            new Error(
              'ReportService.showAllEnabled(): error retrieving all enabled reports: ' +
                err
            )
        );
      })
    );
  }

  disableReport(reportId: number): Observable<void> {
    console.log(reportId);
    return this.http
      .delete<void>(this.url + '/' + reportId, this.getHttpOptions())
      .pipe(
        catchError((err: any) => {
          console.error(err);
          return throwError(
            () =>
              new Error(
                'ReportService.disableReport(): error disabling report: ' + err
              )
          );
        })
      );
  }

  // update(report: Report): Observable<Report> {
  //   console.log("In report.service")
  //   return this.http.put<Report>(`${this.url}/${report.user.id}`, report, this.getHttpOptions()).pipe(
  //     catchError((err: any) => {
  //       console.log(err);
  //       return throwError(
  //         () => new Error(`ReportService.update(): error updating report: ` + err)
  //       );
  //     })
  //   );
  // }

  update(report: Report): Observable<Report> {
    // return this.http.put<Report>(`${this.url}/${report.id}`, report, this.getHttpOptions()).pipe(
    console.log('In report.service');
    console.log(report);
    console.log(this.url + '/' + report.id);
    return this.http
      .put<Report>(this.url + '/' + report.id, report, this.getHttpOptions())
      .pipe(
        catchError((err: any) => {
          console.log(err);
          return throwError(
            () =>
              new Error(`ReportService.update(): error updating report: ` + err)
          );
        })
      );
  }
}
