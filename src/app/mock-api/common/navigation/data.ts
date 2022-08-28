/* tslint:disable:max-line-length */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id      : 'dashboards',
        title   : 'General',
        subtitle: '',
        type    : 'group',
        icon    : 'heroicons_outline:home',
        children: [
            {
                id   : 'dashboards.project',
                title: 'Inicio',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-check',
                link : '/dashboards/project'
            }
        ]
    },

    
    {
        id      : 'apps',
        title   : 'Gestión',
        subtitle: '',
        type    : 'group',
        icon    : 'heroicons_outline:document',
        children: [
        
            {
                id   : 'apps.contacts',
                title: 'Clientes',
                type : 'basic',
                icon : 'heroicons_outline:user-group',
                link : '/apps/contacts'
            },
            {
                id   : 'apps.empleados',
                title: 'Empleados',
                type : 'basic',
                icon : 'heroicons_outline:users',
                link : '/apps/empleados'
            },
            {
                id      : 'user-interface.forms',
                title   : 'Seguros',
                type    : 'collapsable',
                icon    : 'feather:briefcase',
                children: [
                    
                    {
                        id   : 'apps.seguros',
                        title: 'Listar',
                        type : 'basic',
                        link : '/apps/seguros'
                    },
                ]
            }
        ]  
    },

    {
        id      : 'apps.ecommerce',
        title   : 'Procesos',
        type    : 'collapsable',
        icon    : 'heroicons_outline:shopping-cart',
        children: [
            {
                id   : 'apps.ecommerce.inventory',
                title: 'Lista de Procesos',
                type : 'basic',
                link : '/apps/academy'
            },
            {
                id   : 'user-interface.forms.wizards',
                title: 'Agregar',
                type : 'basic',
                link : '/ui/forms/wizards'
            }
        ]
    },

    {
        id      : 'pages',
        title   : 'Cuenta',
        subtitle: '',
        type    : 'group',
        icon    : 'heroicons_outline:document',
        children: [
        
            {
                id   : 'account.settings',
                title: 'Ajustes',
                type : 'basic',
                icon : 'heroicons_outline:cog',
                link : '/pages/settings'
            }
        ]
    }
    
    
];
export const compactNavigation: FuseNavigationItem[] = [
    {
        id      : 'dashboards',
        title   : 'General',
        subtitle: '',
        type    : 'group',
        icon    : 'heroicons_outline:home',
        children: [
            {
                id   : 'dashboards.project',
                title: 'Inicio',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-check',
                link : '/dashboards/project'
            }
        ]
    },

    
    {
        id      : 'apps',
        title   : 'Gestión',
        subtitle: '',
        type    : 'group',
        icon    : 'heroicons_outline:document',
        children: [
        
            {
                id   : 'apps.contacts',
                title: 'Clientes',
                type : 'basic',
                icon : 'heroicons_outline:user-group',
                link : '/apps/contacts'
            },
            {
                id      : 'user-interface.forms',
                title   : 'Seguros',
                type    : 'collapsable',
                icon    : 'feather:briefcase',
                children: [
                    
                    {
                        id   : 'apps.seguros',
                        title: 'Listar',
                        type : 'basic',
                        link : '/apps/seguros'
                    },
                ]
            }
        ]  
    },

    {
        id      : 'apps.ecommerce',
        title   : 'Procesos',
        type    : 'collapsable',
        icon    : 'heroicons_outline:shopping-cart',
        children: [
            {
                id   : 'apps.ecommerce.inventory',
                title: 'Lista de Procesos',
                type : 'basic',
                link : '/apps/academy'
            },
            {
                id   : 'user-interface.forms.wizards',
                title: 'Agregar',
                type : 'basic',
                link : '/ui/forms/wizards'
            }
        ]
    },

    {
        id      : 'pages',
        title   : 'Cuenta',
        subtitle: '',
        type    : 'group',
        icon    : 'heroicons_outline:document',
        children: [
        
            {
                id   : 'account.settings',
                title: 'Ajustes',
                type : 'basic',
                icon : 'heroicons_outline:cog',
                link : '/pages/settings'
            }
        ]
    }
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id      : 'dashboards',
        title   : 'General',
        subtitle: '',
        type    : 'group',
        icon    : 'heroicons_outline:home',
        children: [
            {
                id   : 'dashboards.project',
                title: 'Inicio',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-check',
                link : '/dashboards/project'
            }
        ]
    },

    
    {
        id      : 'apps',
        title   : 'Gestión',
        subtitle: '',
        type    : 'group',
        icon    : 'heroicons_outline:document',
        children: [
        
            {
                id   : 'apps.contacts',
                title: 'Clientes',
                type : 'basic',
                icon : 'heroicons_outline:user-group',
                link : '/apps/contacts'
            },
            {
                id      : 'user-interface.forms',
                title   : 'Seguros',
                type    : 'collapsable',
                icon    : 'feather:briefcase',
                children: [
                    
                    {
                        id   : 'apps.seguros',
                        title: 'Listar',
                        type : 'basic',
                        link : '/apps/seguros'
                    },
                ]
            }
        ]  
    },

    {
        id      : 'apps.ecommerce',
        title   : 'Procesos',
        type    : 'collapsable',
        icon    : 'heroicons_outline:shopping-cart',
        children: [
            {
                id   : 'apps.ecommerce.inventory',
                title: 'Lista de Procesos',
                type : 'basic',
                link : '/apps/academy'
            },
            {
                id   : 'user-interface.forms.wizards',
                title: 'Agregar',
                type : 'basic',
                link : '/ui/forms/wizards'
            }
        ]
    },

    {
        id      : 'pages',
        title   : 'Cuenta',
        subtitle: '',
        type    : 'group',
        icon    : 'heroicons_outline:document',
        children: [
        
            {
                id   : 'account.settings',
                title: 'Ajustes',
                type : 'basic',
                icon : 'heroicons_outline:cog',
                link : '/pages/settings'
            }
        ]
    }
];


export const empleadoNavigation: FuseNavigationItem[] = [
    {
        id      : 'dashboards',
        title   : 'General',
        subtitle: '',
        type    : 'group',
        icon    : 'heroicons_outline:home',
        children: [
            {
                id   : 'dashboards.project',
                title: 'Inicio',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-check',
                link : '/pages/profile'
            }
        ]
    },

    
    {
        id      : 'apps',
        title   : 'Gestión',
        subtitle: '',
        type    : 'group',
        icon    : 'heroicons_outline:document',
        children: [
        
            {
                id   : 'apps.contacts',
                title: 'Clientes',
                type : 'basic',
                icon : 'heroicons_outline:user-group',
                link : '/apps/contacts'
            },
            {
                id      : 'user-interface.forms',
                title   : 'Seguros',
                type    : 'collapsable',
                icon    : 'feather:briefcase',
                children: [
                    
                    {
                        id   : 'apps.seguros',
                        title: 'Listar',
                        type : 'basic',
                        link : '/apps/seguros'
                    },
                ]
            }
        ]  
    },

    {
        id      : 'apps.ecommerce',
        title   : 'Procesos',
        type    : 'collapsable',
        icon    : 'heroicons_outline:shopping-cart',
        children: [
            {
                id   : 'apps.ecommerce.inventory',
                title: 'Lista de Procesos',
                type : 'basic',
                link : '/apps/academy'
            },
            {
                id   : 'user-interface.forms.wizards',
                title: 'Agregar',
                type : 'basic',
                link : '/ui/forms/wizards'
            }
        ]
    },

    {
        id      : 'pages',
        title   : 'Cuenta',
        subtitle: '',
        type    : 'group',
        icon    : 'heroicons_outline:document',
        children: [
        
            {
                id   : 'account.settings',
                title: 'Ajustes',
                type : 'basic',
                icon : 'heroicons_outline:cog',
                link : '/pages/settings'
            }
        ]
    }
];
