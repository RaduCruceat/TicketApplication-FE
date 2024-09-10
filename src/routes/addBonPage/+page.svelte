<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation'; // Import navigation function
    import type { Bon } from '$lib/ObjectsList/types'; // Import the Bon type
    import type { GhiseuID } from '$lib/ObjectsList/types'; // Import the Ghiseu type
    import  { StareEnum } from '$lib/ObjectsList/types'; // Import the Bon type
    export let data: { secretLink: string };
    let HostLink=data.secretLink;
    
    let ghiseuList: GhiseuID[] = [];
    let selectedIdGhiseu: number | null = null;
    let stare: StareEnum = StareEnum.InCursDePreluare;
    let createdAt: string = '';
    let modifiedAt: string = '';

    let errorMessage: string = '';
    let successMessage: string = '';

    async function fetchGhiseuList(): Promise<void> {
        try {
            const response = await fetch(`${HostLink}/Ghiseu/GetAll`);
            if (response.ok) {
                const data = await response.json();
                if (data.isSuccess) {
                    ghiseuList = Array.isArray(data.result) ? data.result : [];
                } else {
                    errorMessage = data.errorMessage || 'Failed to fetch Ghiseu data';
                }
            } else {
                errorMessage = 'Failed to fetch data from the server';
            }
        } catch (error) {
            if (error instanceof Error) {
                errorMessage = 'Error: ' + error.message;
            } else {
                errorMessage = 'An unknown error occurred';
            }
        }
    }

    function getCurrentISODate(): string {
        return new Date().toISOString();
    }

    function initializeDates(): void {
        createdAt = getCurrentISODate();
        modifiedAt = getCurrentISODate();
    }

    function validateForm(): boolean {
        if (selectedIdGhiseu === null) {
            errorMessage = 'Id Ghiseu is required.';
            successMessage = '';
            return false;
        }
        return true;
    }

    async function handleSubmit(event: Event) {
        event.preventDefault(); // Prevent the default form submission

        if (!validateForm()) {
            return; // Stop form submission if validation fails
        }

        const newBon: Bon = {
            idGhiseu: selectedIdGhiseu!,
            stare,
            createdAt,
            modifiedAt
        };

        try {
            const response = await fetch(`${HostLink}/Bon/Add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newBon)
            });

            if (response.ok) {
                successMessage = 'Bon added successfully!';
                errorMessage = '';
                // Optionally, you can navigate to another page or reset the form
                goto('/allBonPage'); // Navigate to the allBonPage or another page
            } else {
                const data = await response.json();
                errorMessage = data.errorMessage || 'Failed to add Bon';
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

    onMount(() => {
        fetchGhiseuList();
        initializeDates(); // Initialize dates on mount
    });
</script>

<form on:submit={handleSubmit}>
    <h1>Adauga un bon:</h1>
    <div class="button-container">
        <button type="button" class="top-button">Persoana Fizica</button>
        <button type="button" class="top-button">Persoana Juridica</button>
    </div>
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
        Id Ghiseu:
        <select bind:value={selectedIdGhiseu}>
            <option value="" disabled>Select Id Ghiseu</option>
            {#each ghiseuList as ghiseu}
                <option value={ghiseu.id}>{ghiseu.id} - {ghiseu.denumire}</option>
            {/each}
        </select>
    </label>
    <label>
        Stare:
        <select bind:value={stare}>
            <option value={StareEnum.InCursDePreluare}>InCursDePreluare</option>
            <option value={StareEnum.Preluat}>Preluat</option>
            <option value={StareEnum.Inchis}>Inchis</option>
        </select>
    </label>
    <label>
        Created At:
        <input type="text" value={createdAt} readonly />
    </label>
    <label>
        Modified At:
        <input type="text" value={modifiedAt} readonly />
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

    select, input {
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
    .button-container {
        display: flex;
        margin-bottom: 10px;
    }
</style>
