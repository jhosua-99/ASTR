import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { EmpleadoService } from 'app/modules/admin/apps/empleados/empleado.service';
import { Empleado } from 'app/modules/admin/apps/empleados/empleados.types';
import { Observable, Subject, takeUntil } from 'rxjs';

@Component({
    selector       : 'settings-account',
    templateUrl    : './account.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsAccountComponent implements OnInit, OnDestroy
{
    accountForm: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    user: User;
    successConfigForm: FormGroup;
    errorConfigForm: FormGroup;
    /**
     * Constructor
     */
    constructor(
        private _formBuilder: FormBuilder,
        private _userService: UserService,
        private _fuseConfirmationService: FuseConfirmationService

    )
    {
    }
    

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        
        // Subscribe to the user service
        this._userService.user$
            .pipe((takeUntil(this._unsubscribeAll)))
            .subscribe((user: User) => {
                console.log(user);
                this.user = user;
            });
        // Create the form
        this.accountForm = this._formBuilder.group({
            name    : [this.user.nom_usuario],
            lastName    : [this.user.apellido_usuario],
            documento: [this.user.documento],
            email   : [this.user.email, Validators.email],
            phone   : [this.user.celular,Validators.maxLength(10)]
        });

        // Build the succes config form
        this.successConfigForm = this._formBuilder.group({
            title      : 'Cuenta actualizada',
            message    : 'Su cuenta fue actualizada correctamente',
            icon       : this._formBuilder.group({
                show : true,
                name : 'heroicons_outline:check-circle',
                color: 'primary'
            }),
            actions    : this._formBuilder.group({
                confirm: this._formBuilder.group({
                    show : true,
                    label: 'Continuar',
                    color: 'primary'
                }),
                cancel : this._formBuilder.group({
                    show : false,
                    label: 'Cancel'
                })
            }),
            dismissible: true
        });
        // Build the error config form
        this.errorConfigForm = this._formBuilder.group({
            title      : 'Error al actualizar',
            message    : 'Ocurrio un error al actualizar su cuenta, intenete de nuevo más tarde.',
            icon       : this._formBuilder.group({
                show : true,
                name : 'heroicons_outline:exclamation',
                color: 'warn'
            }),
            actions    : this._formBuilder.group({
                confirm: this._formBuilder.group({
                    show : true,
                    label: 'Continuar',
                    color: 'warn'
                }),
                cancel : this._formBuilder.group({
                    show : false,
                    label: 'Cancel'
                })
            }),
            dismissible: true
        });
        
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    onSaveAccount(data){
        // Return if the form is invalid
        if ( this.accountForm.invalid )
        {
            return;
        }

        this.accountForm.disable();

        console.log(data);
        let auxUser : User = {
            cod_usuario : this.user.cod_usuario,
            email : data.email,
            contrasena : this.user.contrasena,
            nom_usuario : data.name,
            apellido_usuario : data.lastName,
            tipo_usuario : this.user.tipo_usuario,
            documento : data.documento,
            celular : data.phone
        }

        this._userService.update2(auxUser).subscribe((value)=>{
            this.accountForm.enable();
            this.openSuccesDialog();
        },(error) =>{
            this.accountForm.enable();
            console.error(error);
            this.openErrorDialog();
        },()=>{
            
            this.accountForm.enable();
        });
    }
    /**
     * Open success dialog
     */
     openSuccesDialog(): void
     {
         // Open the dialog and save the reference of it
         const dialogRef = this._fuseConfirmationService.open(this.successConfigForm.value);
 
         // Subscribe to afterClosed from the dialog reference
         dialogRef.afterClosed().subscribe((result) => {
             console.log(result);
         });
     }

     /**
     * Open error dialog
     */
      openErrorDialog(): void
      {
          // Open the dialog and save the reference of it
          const dialogRef = this._fuseConfirmationService.open(this.errorConfigForm.value);
  
          // Subscribe to afterClosed from the dialog reference
          dialogRef.afterClosed().subscribe((result) => {
              console.log(result);
          });
      }
}
