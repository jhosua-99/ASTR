import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserResponseModel } from 'app/core/user/user.response.model';
import { BehaviorSubject, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
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
    _procesosPorRenovar: BehaviorSubject<any | null> = new BehaviorSubject(null);
    _pannelData: BehaviorSubject<any | null> = new BehaviorSubject(null);

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
    get course$(): Observable<Course> {
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

    getProcesos(page: number): Observable<UserResponseModel> {        //cambiar url
        console.log(page);

        return this._httpClient.get<UserResponseModel>(`${environment.APIEndpoint}` + 'api/procesos', { params: { page: page } }).pipe(
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
            return this._httpClient.get<UserResponseModel>(`${environment.APIEndpoint}` + 'api/procesos', { params: { page: 0 } }).pipe(
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
    getProcesoById(id: string): Observable<UserResponseModel> {
        return this._httpClient.get<UserResponseModel>(`${environment.APIEndpoint}` + 'api/procesos/' + id).pipe(
            map((course) => {

                // Update the course
                this._course.next(course.body);

                // Return the course
                return course;
            }),
            switchMap((course) => {

                if (!course) {
                    return throwError('Could not found course with id of ' + id + '!');
                }

                return of(course);
            })
        );
    }

    getProcesosPorRenovar(): Observable<UserResponseModel> {        //cambiar url


        return this._httpClient.get<UserResponseModel>(`${environment.APIEndpoint}` + 'api/procesos/renovar').pipe(
            tap((result) => {
                this._procesosPorRenovar.next(result.body);
                console.log('renovacion ' + result);
            })
        );
    }

    
    getProcesosPorRenovarPorEmpleado(cod_user): Observable<UserResponseModel> {        //cambiar url


        return this._httpClient.get<UserResponseModel>(`${environment.APIEndpoint}` + 'api/procesos/renovar/'+cod_user).pipe(
            tap((result) => {
                this._procesosPorRenovar.next(result.body);
                console.log('renovacion ' + result);
            })
        );
    }

    getPanelData(): Observable<UserResponseModel> {        //cambiar url


        return this._httpClient.get<UserResponseModel>(`${environment.APIEndpoint}` + 'api/procesos/panel').pipe(
            tap((result) => {
                this._pannelData.next(result.body);
            })
        );
    }


    updateProcessStatus(id: any, data: any, pCourse:any): Observable<any> {

        return this._course.pipe(
            take(1),
            switchMap(cotizaciones => this._httpClient.patch<UserResponseModel>(`${environment.APIEndpoint}` + 'api/procesos/status', data).pipe(
                map((cot) => {
                    
                    
                    pCourse.cod_status = data.cod_status
                    
                    

                    // Update the contacts
                    this._course.next(pCourse);


                    // Return the new contact
                    return this.course$;
                })
            ))
        );

    }

    deleteProceso(id: any) : Observable<any> {
        return this._procesos.pipe(
            take(1),
            switchMap(contacts => this._httpClient.delete(`${environment.APIEndpoint}`+'api/procesos/', {params: {id}}).pipe(
                map((result: UserResponseModel) => {

                    // Find the index of the deleted contact
                    const index = contacts.findIndex(item => item.cod_proceso === id);

                    // Delete the contact
                    contacts.splice(index, 1);

                    // Update the contacts
                    this._procesos.next(contacts);

                    // Return the deleted status
                    return result.body.isDeleted;;
                })
            ))
        );
    }
}
