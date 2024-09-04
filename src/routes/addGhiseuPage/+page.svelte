<script lang="ts">
    import { goto } from '$app/navigation'; 
    import type { Ghiseu } from '$lib/ObjectsList/types'; 
    import { onMount } from 'svelte';

    let cod: string = '';
    let denumire: string = '';
    let descriere: string = '';
    let icon: string = '';
    let activ: boolean = true; // Default value for activ

    let errorMessage: string = '';
    let successMessage: string = '';
    let availableIcons: string[] = [];

    async function fetchIcons() {
    try {
        const response = await fetch('https://localhost:7140/Ghiseu/GetIcons');
        if (response.ok) {
            const data = await response.json();
            console.log('Fetched Icons:', data); // Debug: Log the fetched data

            if (data.isSuccess && Array.isArray(data.result)) {
                availableIcons = data.result;
            } else {
                console.error('Unexpected data format:', data);
                availableIcons = []; // Ensure it's an empty array if data format is wrong
            }
        } else {
            console.error('Failed to fetch icons:', response.statusText);
            availableIcons = []; // Fallback to an empty array
        }
    } catch (error) {
        console.error('Error fetching icons:', error);
        availableIcons = []; // Fallback to an empty array
    }
}


    function validateForm(): boolean {
        if (!cod.trim() || !denumire.trim() || !descriere.trim() || !icon.trim()) {
            errorMessage = 'All fields are required and cannot be empty.';
            successMessage = '';
            return false;
        }
        return true;
    }

    async function handleSubmit(event: Event) {
        event.preventDefault(); 

        if (!validateForm()) {
            return; 
        }

        const newGhiseu: Ghiseu = {
            cod,
            denumire,
            descriere,
            icon,
            activ
        };

        try {
            const response = await fetch('https://localhost:7140/Ghiseu/Add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newGhiseu)
            });

            if (response.ok) {
                successMessage = 'Ghiseu added successfully!';
                errorMessage = '';
                goto('/allGhiseuPage');
            } else {
                const data = await response.json();
                errorMessage = data.errorMessage || 'Failed to add Ghiseu';
                successMessage = '';
            }
        } catch (error) {
            if (error instanceof Error) {
                errorMessage = 'Error: ' + error.message;
            } else {
                errorMessage = 'An unknown error occurred';
            }
            successMessage = '';
        }
    }

    onMount(fetchIcons);
</script>

<form on:submit={handleSubmit}>
    <h1>Adauga un ghiseu:</h1>
    {#if errorMessage}
        <div class="error">
            <p>{errorMessage}</p>
        </div>
    {/if}
    {#if successMessage}
        <div class="success">
            <p>{successMessage}</p>
        </div>
    {/if}
    <label>
        Cod:
        <input type="text" bind:value={cod} required />
    </label>
    <label>
        Denumire:
        <input type="text" bind:value={denumire} required />
    </label>
    <label>
        Descriere:
        <textarea bind:value={descriere} required></textarea>
    </label>
    <label>
        Icon:
        <select bind:value={icon} required>
            <option value="" disabled>Select an icon</option>
            {#each availableIcons as iconFile}
                <option value={iconFile}>{iconFile}</option>
            {/each}
        </select>
    </label>
    
    <label>
        Activ:
        <input type="checkbox" bind:checked={activ} />
    </label>
    <button type="submit">Salveaza</button>
</form>

<style>
    form {
        display: flex;
        flex-direction: column;
        max-width: 400px;
        margin: auto;
    }

    label {
        margin-bottom: 10px;
    }

    input, textarea, select {
        width: 100%;
        padding: 8px;
        margin-top: 5px;
    }

    button {
        margin-top: 20px;
        padding: 10px;
        background-color: #28a745;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    .error {
        color: red;
        font-weight: bold;
        margin-bottom: 10px;
    }

    .success {
        color: green;
        font-weight: bold;
        margin-bottom: 10px;
    }
</style>
