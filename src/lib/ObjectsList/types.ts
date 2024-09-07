export interface GhiseuID {
    id: number;
    cod: string;
    denumire: string;
    descriere: string;
    icon: string;
    activ: boolean;
}

export interface Ghiseu {
    cod: string;
    denumire: string;
    descriere: string;
    icon: string;
    activ: boolean;
}

export interface EditGhiseu {
    cod: string;
    denumire: string;
    descriere: string;
    icon: string;
}

export interface BonID {
    id: number;
    idGhiseu: number;
    stare: number; 
    createdAt: string; 
    modifiedAt: string; 
    ghiseu?: {
        id: number;
        denumire: string;
        icon: string;
    };
}

export interface Bon {
    idGhiseu: number;
    stare: StareEnum;  // Use enum instead of number
    createdAt: string;  // Use Date instead of string
    modifiedAt: string; // Use Date instead of string
}


// Define the structure of the API response
export interface ApiResponse {
    isSuccess: boolean;
    result: any[];
    errorMessage: string | null;
}

export enum StareEnum {
    InCursDePreluare = 0,
    Preluat = 1,
    Inchis = 2
}