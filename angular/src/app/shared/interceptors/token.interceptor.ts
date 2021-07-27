import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, timer } from 'rxjs';
import { delay, delayWhen, retry, retryWhen, tap } from 'rxjs/operators';

@Injectable()
export class TokenInterceptor implements HttpInterceptor 
{  
  
  constructor() { }
  
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // We have to clone the request because it is immutable
    request = request.clone({
      setHeaders: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    
    return next.handle(request).pipe(
      retry(3),
      delay(500)
    );
  }
}