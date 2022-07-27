import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserResponseModel } from 'app/core/user/user.response.model';
import { BehaviorSubject, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { Proceso } from './proceso.types';
import { environment } from '../../../environments/environment';
import { InventoryPagination } from 'app/modules/admin/apps/academy/inventory.types';
import { Course } from 'app/modules/admin/apps/academy/academy.types';
@Injectable({
    providedIn: 'root'
})
export class ProcesoService {

    _procesos: BehaviorSubject<Proceso[] | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<InventoryPagination | null> = new BehaviorSubject(null);
    private _course: BehaviorSubject<Course | null> = new BehaviorSubject(null);
    
    constructor(private _httpClient: HttpClient) {

    }
    /**
         * Getter for pagination
         */
    get pagination$(): Observable<InventoryPagination> {
        return this._pagination.asObservable();
    }

    /**
     * Getter for course
     */
     get course$(): Observable<Course>
     {
         return this._course.asObservable();
     }


    add(req: any): Observable<any> {
        return this._httpClient.post(`${environment.APIEndpoint}` + 'api/procesos/', req).pipe(
            switchMap((response: any) => {
                console.log(response);

                return of(response);
            })
        );

    }

    getProcesos(page:number): Observable<UserResponseModel> {        //cambiar url
        console.log(page);
        
        return this._httpClient.get<UserResponseModel>(`${environment.APIEndpoint}` + 'api/procesos',{params: {page : page}}).pipe(
            tap((result) => {
                this._procesos.next(result.body.process);
                this._pagination.next(result.body.pagination);
                console.log(result);
            })
        );
    }

    searchProcesos(search: string = ''): Observable<UserResponseModel> {
        console.log('query ' + search);
        if (search.length == 0) {
            return this._httpClient.get<UserResponseModel>(`${environment.APIEndpoint}` + 'api/procesos',{params: {page :0}}).pipe(
                tap((result) => {
                    this._procesos.next(result.body.process);
                this._pagination.next(result.body.pagination);
                    console.log(result);
                })
            );
        } else {
            return this._httpClient.get<UserResponseModel>(`${environment.APIEndpoint}` + 'api/procesos/search/' + search).pipe(
                tap((result) => {
                    this._procesos.next(result.body);
                    console.log(result);
                })
            );
        }


    }

    /**
     * Get course by id
     */
     getProcesoById(id: string): Observable<UserResponseModel>
     {
         return this._httpClient.get<UserResponseModel>(`${environment.APIEndpoint}` + 'api/procesos/'+id).pipe(
             map((course) => {
 
                 // Update the course
                 this._course.next(course.body);
 
                 // Return the course
                 return course;
             }),
             switchMap((course) => {
 
                 if ( !course )
                 {
                     return throwError('Could not found course with id of ' + id + '!');
                 }
 
                 return of(course);
             })
         );
     }
}
