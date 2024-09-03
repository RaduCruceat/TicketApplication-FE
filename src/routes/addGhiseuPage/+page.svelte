<script lang="ts">
    import { goto } from '$app/navigation'; // Import navigation function
    import type { Ghiseu } from '$lib/ObjectsList/types'; // Import the Ghiseu type

    let cod: string = '';
    let denumire: string = '';
    let descriere: string = '';
    let icon: string = '';
    let activ: boolean = true; // Default value for activ

    let errorMessage: string = '';
    let successMessage: string = '';

    function validateForm(): boolean {
        if (!cod.trim() || !denumire.trim() || !descriere.trim() || !icon.trim()) {
            errorMessage = 'All fields are required and cannot be empty.';
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
                // Navigate to the allGhiseuPage
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
</script>

<form on:submit={handleSubmit}>
    <h1>Add New Ghiseu</h1>
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
        <input type="text" bind:value={icon} required />
    </label>
    <label>
        Activ:
        <input type="checkbox" bind:checked={activ} />
    </label>
    <button type="submit">Add Ghiseu</button>
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
