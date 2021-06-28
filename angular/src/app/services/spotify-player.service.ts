import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppComponent } from '../app.component';

@Injectable({
  providedIn: 'root'
})
export class SpotifyPlayerService {

  private serverURL = `${AppComponent.serverRoot}/api/spotify/player`;

  constructor(private httpCli:HttpClient) { }

  getPlayer(): Observable<any>{
    return this.httpCli.get<any>(`${this.serverURL}/getPlayer`);
  }

  getCurrentlyPlaying(): Observable<any> {
    return this.httpCli.get<any>(`${this.serverURL}/getCurrentlyPlaying`);
  }

  getCurrentDevice(): Observable<any>{
    return this.httpCli.get<any>(this.serverURL + "/getCurrentDevice");
  }

  getAMRadio(): Observable<any>{
    return this.httpCli.get<any>(this.serverURL + "/getAMRadio");
  }

  getAudioFeatures(trackID: any): Observable<any>{
    return this.httpCli.get<any>(this.serverURL + `/getAudioFeatures?trackID=${trackID}`);
  }

  getAudioAnalysis(trackID: any): Observable<any>{
    return this.httpCli.get<any>(this.serverURL + `/getAudioAnalysis?trackID=${trackID}`);
  }

  startAMRadio(): Observable<any>{
    return this.httpCli.get<any>(this.serverURL + `/startAMRadio`);
  }

  playTrack(uri: string): Observable<any>{
    let params = new HttpParams();
    params = params.append("trackURI", uri);
    return this.httpCli.put<any>(this.serverURL + `/playTrack`, uri, {params: params});
  }

  playPlaylist(contextURI: string): Observable<any> {
    let params = new HttpParams();
    params = params.append("contextURI", contextURI);
    return this.httpCli.put<any>(this.serverURL + `/playPlaylist`, contextURI, {params: params});
  }

  addToQueue(uri: string): Observable<any> {
    let params = new HttpParams();
    params = params.append("trackURI", uri);
    return this.httpCli.put<any>(this.serverURL + `/addToQueue`, uri, {params: params});
  }

  next(): Observable<any>{
    // The api doesn't need any body data... I don't think...?
    return this.httpCli.post<any>(`${this.serverURL}/next`, "yeet");
  }

  previous(): Observable<any> {
    // The api doesn't need any body data... I don't think...?
    return this.httpCli.post<any>(`${this.serverURL}/previous`, "yeet");
  }

  play(): Observable<any>{
    return this.httpCli.put<any>(`${this.serverURL}/play`, "yeet");
  }

  pause(): Observable<any>{
    return this.httpCli.put<any>(`${this.serverURL}/pause`, "yeet");
  }

  seek(time: number): Observable<any>{
    return this.httpCli.put<any>(`${this.serverURL}/seek?time=${time}`, time);
  }

  shuffle(activate: boolean): Observable<any>{
    return this.httpCli.put<any>(`${this.serverURL}/shuffle?activate=${activate}`, activate);
  }

  repeat(type: string): Observable<any> {
    return this.httpCli.put<any>(`${this.serverURL}/repeat?type=${type}`, type);
  }

  playOn(deviceID: string): Observable<any>{
    return this.httpCli.put<any>(`${this.serverURL}/playOn?deviceID=${deviceID}`, deviceID);
  }

  volume(percent: number): Observable<any>{
    return this.httpCli.put<any>(`${this.serverURL}/volume?percent=${percent}`, percent);
  }
}
