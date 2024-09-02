export interface Ghiseu {
    cod: string;
    denumire: string;
    descriere: string;
    icon: string;
    activ: boolean;
}
export interface Bon {
    idGhiseu: number;
    stare: string; // Adjust type based on actual enum values or define an enum if available
    createdAt: string; // ISO 8601 date string
    modifiedAt: string; // ISO 8601 date string
}

// Define the structure of the API response
export interface ApiResponse {
    isSuccess: boolean;
    result: any[];
    errorMessage: string | null;
}