import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppComponent } from '../app.component';

@Injectable({
  providedIn: 'root'
})
export class RadioService {

  private serverURL = `${AppComponent.serverRoot}/api/station`;

  constructor(private httpCli:HttpClient) { }

  getStation(num: number): Observable<any>{
    return this.httpCli.get<any>(`${this.serverURL}/${num}`);
  }

  createStation(num: number, playlist: any): Observable<any>{
    return this.httpCli.post<any>(`${this.serverURL}/${num}`, playlist);
  }

  joinStation(num: number): Observable<any>{
    return this.httpCli.get<any>(`${this.serverURL}/${num}/join`);
  }

  leaveStation(num: number): Observable<any>{
    return this.httpCli.get<any>(`${this.serverURL}/${num}/leave`);
  }
  
}
