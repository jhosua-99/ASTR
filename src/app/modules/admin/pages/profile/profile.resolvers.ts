import { Injectable } from "@angular/core";
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { UserService } from "app/core/user/user.service";
import { ProcesoService } from "app/services/processs/proceso.service";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ProfileResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _procesoService:ProcesoService, private _userService:UserService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {
        var userId = sessionStorage.getItem('cod_usuario');
        return this._procesoService.getProcesosPorRenovarPorEmpleado(userId);
    }
}