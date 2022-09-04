import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { InitialDataResolver } from 'app/app.resolvers';
import { FormularioComponent } from 'app/formulario/formulario.component'

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    // Redirect empty path to '/example'
    { path: '', pathMatch: 'full', redirectTo: 'dashboards/project' },
    { path: 'form', component: FormularioComponent },

    // Redirect signed in user to the '/example'
    //
    // After the user signs in, the sign in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    { path: 'signed-in-redirect', pathMatch: 'full', redirectTo: 'dashboards/project' },
    { path: 'signed-in-redirect2', pathMatch: 'full', redirectTo: 'pages/profile' },

    // Auth routes for guests
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.module').then(m => m.AuthConfirmationRequiredModule) },
            { path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.module').then(m => m.AuthForgotPasswordModule) },
            { path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.module').then(m => m.AuthResetPasswordModule) },
            { path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.module').then(m => m.AuthSignInModule) },
            { path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.module').then(m => m.AuthSignUpModule) }
        ]
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.module').then(m => m.AuthSignOutModule) },
            { path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.module').then(m => m.AuthUnlockSessionModule) }
        ]
    },

    // Landing routes
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'inicio', loadChildren: () => import('app/modules/landing/home/home.module').then(m => m.LandingHomeModule) },

        ]
    },

    // Admin routes
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: InitialDataResolver,
        },
        data: {
            layout: 'classy'
        },




        children: [
            { path: 'example', loadChildren: () => import('app/modules/admin/example/example.module').then(m => m.ExampleModule) },
            // Dashboards
            {
                path: 'dashboards', children: [
                    { path: 'project', loadChildren: () => import('app/modules/admin/dashboards/project/project.module').then(m => m.ProjectModule) },

                ]
            },



            //Account
            {
                path: 'pages', children: [
                    // Profile
                    { path: 'profile', loadChildren: () => import('app/modules/admin/pages/profile/profile.module').then(m => m.ProfileModule) },

                    // Settings
                    { path: 'settings', loadChildren: () => import('app/modules/admin/pages/settings/settings.module').then(m => m.SettingsModule) },
                
                ]
            },

            //Managment
            {
                path: 'apps', children: [
                    //customers
                    { path: 'contacts', loadChildren: () => import('app/modules/admin/apps/contacts/contacts.module').then(m => m.ContactsModule) },
                    { path: 'empleados', loadChildren: () => import('app/modules/admin/apps/empleados/empleado.module').then(m => m.EmpleadosModule) },
                    { path: 'academy', loadChildren: () => import('app/modules/admin/apps/academy/academy.module').then(m => m.AcademyModule) },
                    { path: 'seguros', loadChildren: () => import('app/modules/admin/apps/seguros/list/cards.module').then(m => m.CardsModule) },
                ]

            },
            // User Interface
            {
                path: 'ui', children: [



                    // Forms
                    {
                        path: 'forms', children: [
                            { path: 'wizards', loadChildren: () => import('app/modules/admin/ui/forms/wizards/wizards.module').then(m => m.FormsWizardsModule) },
                            { path: 'autos', loadChildren: () => import('app/modules/admin/ui/forms/autos/autos.module').then(m => m.FormsAutosModule) },
                            { path: 'hogar', loadChildren: () => import('app/modules/admin/ui/forms/hogar/hogar.module').then(m => m.FormsHogarModule) },
                            { path: 'arrendamiento', loadChildren: () => import('app/modules/admin/ui/forms/arrendamiento/arrendamiento.module').then(m => m.FormsArrendamientoModule) },
                            { path: 'vida', loadChildren: () => import('app/modules/admin/ui/forms/vida/vida.module').then(m => m.FormsVidaModule) },
                            { path: 'excequias', loadChildren: () => import('app/modules/admin/ui/forms/excequias/excequias.module').then(m => m.FormsExcequiasModule) },
                            { path: 'finanzas', loadChildren: () => import('app/modules/admin/ui/forms/finanzas/finanzas.module').then(m => m.FormsFinanzasModule) },
                            { path: 'respCiviMed', loadChildren: () => import('app/modules/admin/ui/forms/respCiviMed/respCiviMed.module').then(m => m.FormsRespCiviMedModule) },
                            { path: 'mascotas', loadChildren: () => import('app/modules/admin/ui/forms/mascotas/mascotas.module').then(m => m.FormsMascotasModule) }

                        ]
                    }

                ]
            }
        ]
    }

];
