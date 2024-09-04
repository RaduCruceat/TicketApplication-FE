<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import type { EditGhiseu } from '$lib/ObjectsList/types'; 

    let id: string;
    $: id = $page.params.id;

    let cod: string = '';
    let denumire: string = '';
    let descriere: string = '';
    let icon: string = '';

    let errorMessage: string = '';
    let successMessage: string = '';

    async function fetchGhiseuData(id: string): Promise<void> {
        try {
            const response = await fetch(`https://localhost:7140/Ghiseu/Get/${id}`);
            const data = await response.json();
            
            if (response.ok && data.isSuccess) {
                const ghiseu: EditGhiseu = data.result;
                cod = ghiseu.cod;
                denumire = ghiseu.denumire;
                descriere = ghiseu.descriere;
                icon = ghiseu.icon;
            } else {
                errorMessage = data.errorMessage || 'Failed to fetch Ghiseu data';
            }
        } catch (error) {
            if (error instanceof Error) {
                errorMessage = 'Error: ' + error.message;
            } else {
                errorMessage = 'An unknown error occurred';
            }
        }
    }

    async function handleSubmit(event: Event) {
        event.preventDefault();

        const updatedGhiseu: EditGhiseu = {
            cod,
            denumire,
            descriere,
            icon
        };

        try {
            const response = await fetch(`https://localhost:7140/Ghiseu/Edit/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedGhiseu)
            });

            const data = await response.json();

            if (response.ok && data.isSuccess) {
                successMessage = 'Ghiseu updated successfully!';
                errorMessage = '';
                goto('/allGhiseuPage');
            } else {
                errorMessage = data.errorMessage || 'Failed to update Ghiseu';
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
        fetchGhiseuData(id);
    });
</script>

<form on:submit={handleSubmit}>
    <h1>Modifica ghiseu:</h1>
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
    {#if !errorMessage}
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
            <input type="text" bind:value={icon} required />
        </label>
        <button type="submit">Salveaza</button>
    {/if}
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

    input, textarea {
        width: 100%;
        padding: 8px;
        margin-top: 5px;
    }

    button {
        margin-top: 20px;
        padding: 10px;
        background-color: #007bff;
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
