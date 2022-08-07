export interface Contact
{
    cod_cliente: number;
    cedula: string;
    avatar?: string | null;
    
    nom_cliente: string;
    apellido_cliente: string;
    correos?: {
        cod_email_cliente : number,
        email: string;
        label: string;
    }[];
    celulares?: {
        country?: string;
        numero: string;
        label: string;
    }[];
    ocupacion?: string;
    company?: string;
    birth_date?: string | null;
    direccion?: string | null;
    notes?: string | null;
    tags?: string[];
}

export interface Country
{
    id: string;
    iso: string;
    name: string;
    code: string;
    flagImagePos: string;
}

export interface ContactExport
{
    nom_cliente: string,
    apellido_cliente: string,
    ocupacion: string,
    company: string,
    direccion: string,
    email: string;
    numero: string;
}

export interface Tag
{
    id?: string;
    title?: string;
}
