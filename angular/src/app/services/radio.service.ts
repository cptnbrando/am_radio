import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppComponent } from '../app.component';
import { Station } from '../shared/models/station.model';

@Injectable({
  providedIn: 'root'
})
export class RadioService {

  private serverURL = `${AppComponent.serverRoot}/api/station`;

  constructor(private httpCli:HttpClient) { }

  getStation(num: number): Observable<any>{
    return this.httpCli.get<any>(`${this.serverURL}/${num}`);
  }

  getAllStations(): Observable<Station[]> {
    return this.httpCli.get<Station[]>(`${this.serverURL}/all`);
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

  deleteStation(num: number, user: any): Observable<any>{
    return this.httpCli.put<any>(`${this.serverURL}/${num}/delete`, user);
  }

  sync(num: number): Observable<any>{
    return this.httpCli.get<any>(`${this.serverURL}/${num}/sync`);
  }
}
