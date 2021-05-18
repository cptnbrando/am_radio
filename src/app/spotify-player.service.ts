import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpotifyPlayerService {

  private serverURL = `http://localhost:9015/api/spotify/player`;

  constructor(private httpCli:HttpClient) { }

  getPlayer(): Observable<any>{
    return this.httpCli.get<any>(`${this.serverURL}/getPlayer`);
  }

  next(): Observable<any>{
    // The api doesn't need any body data... I don't think...?
    return this.httpCli.post<any>(`${this.serverURL}/next`, "yeet");
  }

  play(): Observable<any>{
    return this.httpCli.put<any>(`${this.serverURL}/play`, "yeet");
  }

  pause(): Observable<any>{
    return this.httpCli.put<any>(`${this.serverURL}/play`, "yeet");
  }

  seek(time: number): Observable<any>{
    return this.httpCli.put<any>(`${this.serverURL}/seek?time=${time}`, time);
  }

  shuffle(activate: boolean): Observable<any>{
    return this.httpCli.put<any>(`${this.serverURL}/shuffle?activate=${activate}`, activate);
  }

  playOn(deviceID: string): Observable<any>{
    return this.httpCli.put<any>(`${this.serverURL}/playOn?deviceID=${deviceID}`, deviceID);
  }

  volume(percent: number): Observable<any>{
    return this.httpCli.put<any>(`${this.serverURL}/volume?percent=${percent}`, percent);
  }
}
