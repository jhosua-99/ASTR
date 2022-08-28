import { Route } from '@angular/router';
import { ProjectComponent } from 'app/modules/admin/dashboards/project/project.component';
import { PanelResolver, ProcessResolver, ProjectResolver } from 'app/modules/admin/dashboards/project/project.resolvers';

export const projectRoutes: Route[] = [
    {
        path     : '',
        component: ProjectComponent,
        resolve  : {
            data: ProjectResolver,
            procesos: ProcessResolver,
            pannel: PanelResolver
        }
    }
];
