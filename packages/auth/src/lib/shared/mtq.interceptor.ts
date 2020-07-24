import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MtqInterceptor implements HttpInterceptor {

  constructor() {  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    // const authReq = req.clone({
    //   headers: req.headers.set('Authorization', 'Basic allo123')
    // });
  //   const authReq = req.clone({
  //     setHeaders: {
  //         withCredentials: 'true',
  //         Authorization: `Basic allo123`
  //     }
  // });

    const authReq = req.clone({
      headers: new HttpHeaders({
        withCredentials: 'true',
        Authorization: 'Basic allo1234Intercept'
      })
    });

    return next.handle(authReq);
  }
  interceptXhr(xhr): boolean {
    xhr.setRequestHeader('withCredentials', 'true');
    xhr.setRequestHeader('Authorization', 'Basic allo123InterceptXhr');
    return true;
  }
}
