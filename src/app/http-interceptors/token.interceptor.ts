import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AuthService } from '../auth.service';
import { tap } from 'rxjs/operators';

@Injectable()
export class TokenInterceptor implements HttpInterceptor 
{  
  
  constructor(public authService: AuthService) {

  }
  
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> 
  {
    // // We won't have an auth token on login, so don't try to get it, just send the request
    // if(request.url.startsWith("http://localhost:9015/api/spotify/login"))
    // {
    //   request = request.clone({
    //     setHeaders: {
    //       'Content-Type': 'application/json'
    //     }
    //   });
    //   return next.handle(request);
    // }

    // console.log(request.headers);

    // We have to clone the request because it is immutable
    request = request.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        Authorization: `${this.authService.accessToken}`
      }
    });

    console.log("in interceptor");
    
    // Here we check for invalid tokens!
    return next.handle(request).pipe(
      tap(event => {
        console.log("in interceptor pipe begin!");
        if(event instanceof HttpResponse && event.status == 302) {
          console.log("event found 302");
          if(event.headers.has("accessToken"))
          {
            console.log("in interceptor pipe");
            this.authService.accessToken = event.headers.get("accessToken");
            this.authService.refreshToken = event.headers.get("refreshToken");
          }
        }
      })
      
      // TODO
    );
  }
}