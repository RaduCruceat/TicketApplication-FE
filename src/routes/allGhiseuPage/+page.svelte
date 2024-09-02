<script lang="ts">
    import { onMount } from 'svelte';
    import type { Ghiseu, ApiResponse } from '$lib/ObjectsList/types'; // Adjust the path as needed
    import Navbar from '$lib/SvelteComponents/navbar.svelte'; 
    import { goto } from '$app/navigation'; // Import navigation function

    let ghiseuList: Ghiseu[] = [];
    let errorMessage: string = '';

    function navigateToAddGhiseuPage() {
        goto('/addGhiseuPage'); // Adjust the path according to your routing setup
    }

    async function fetchData(): Promise<void> {
        try {
            const response = await fetch('https://localhost:7140/Ghiseu/GetAll');
            if (response.ok) {
                const data: ApiResponse = await response.json();

                if (data.isSuccess) {
                    ghiseuList = Array.isArray(data.result) ? data.result : [];
                    errorMessage = ''; // Clear any previous errors
                } else {
                    errorMessage = data.errorMessage || 'An unknown error occurred';
                    ghiseuList = []; // Clear previous data if there's an error
                }
            } else {
                errorMessage = 'Failed to fetch data from the server';
                ghiseuList = [];
            }
        } catch (error) {
            if (error instanceof Error) {
                errorMessage = 'Error: ' + error.message;
            } else {
                errorMessage = 'An unknown error occurred';
            }
            ghiseuList = [];
        }
    }

    onMount(fetchData);
</script>

<Navbar /> <!-- Include the Navbar component -->
{#if errorMessage}
    <div class="error">
        <p>{errorMessage}</p>
    </div>
{:else}
<div class="table-container">
    <button class="add-button" on:click={navigateToAddGhiseuPage}>Add New Ghiseu</button>
    <table>
        <thead>
            <tr>
                <th>Icon</th>
                <th>Denumire</th>
                <th>Cod</th>
                <th>Descriere</th>
                <th>Activ</th>
            </tr>
        </thead>
        <tbody>
            {#each ghiseuList as ghiseu}
                <tr>
                    <td>{ghiseu.icon}</td>
                    <td>{ghiseu.denumire}</td>
                    <td>{ghiseu.cod}</td>
                    <td>{ghiseu.descriere}</td>
                    <td>{ghiseu.activ ? 'Yes' : 'No'}</td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
{/if}

<style>
    .error {
        color: red;
        font-weight: bold;
        margin-bottom: 20px;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
    }
    .table-container {
        position: relative;
        padding-top: 50px; /* Add padding-top to account for the navbar height */
    }

    th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
    }

    th {
        background-color: #f4f4f4;
    }
    .add-button {
        position: absolute;
        top: 10px;
        right: 10px;
        background-color: #28a745; /* Green color */
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
    }
</style>