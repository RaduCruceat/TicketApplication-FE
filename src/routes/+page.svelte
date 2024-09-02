<script lang="ts">
    import { goto } from '$app/navigation'; // Import the navigation function

    function navigateToAllGhiseuPage() {
        goto('/allGhiseuPage'); // Adjust the path according to your routing setup
    }
</script>

<h1>Welcome to SvelteKit</h1>
<div class="container">
    <button on:click={navigateToAllGhiseuPage}>Go to All Ghiseu Page</button>
</div>

