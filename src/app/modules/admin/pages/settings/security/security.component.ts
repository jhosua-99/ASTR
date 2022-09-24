import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { EmpleadoService } from 'app/modules/admin/apps/empleados/empleado.service';
import { Empleado } from 'app/modules/admin/apps/empleados/empleados.types';
import { Observable } from 'rxjs';

@Component({
    selector       : 'settings-security',
    templateUrl    : './security.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsSecurityComponent implements OnInit
{
    securityForm: FormGroup;
    empleados$: Observable<Empleado[]>;
    successConfigForm: FormGroup;
    errorConfigForm: FormGroup;
    /**
     * Constructor
     */
    constructor(
        private _formBuilder: FormBuilder,
        private _empleadoService: EmpleadoService,
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
        this._empleadoService.getUsers().subscribe(response => {
            this.empleados$ = response.body
        }
        );
        // Create the form
        this.securityForm = this._formBuilder.group({
            idEmpAsignado  : [''],
            newPassword      : ['']
        });
        // Build the succes config form
        this.successConfigForm = this._formBuilder.group({
            title      : 'Contraseña actualizada',
            message    : 'contraseña actualizada correctamente',
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
            message    : 'Ocurrio un error al actualizar la contraseña, intenete de nuevo más tarde.',
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


    cambiarContrasena(){
        const stepForm = this.securityForm.getRawValue();
        let req = {
            "cod_usuario": stepForm.idEmpAsignado,
            "password": stepForm.newPassword
        }
        this._empleadoService.updateUserPassword(req).subscribe(() => {
            this.openSuccesDialog();
        },(error) =>{
            
            this.openErrorDialog();
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
