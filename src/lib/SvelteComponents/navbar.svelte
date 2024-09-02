<script lang="ts">
    import { goto } from '$app/navigation'; // Import the navigation function
</script>

<nav>
    <ul>
        <li><a on:click={() => goto('/')}>Home</a></li>
        <li><a on:click={() => goto('/allGhiseuPage')}>All Ghiseu Page</a></li>
        <li><a on:click={() => goto('/allBonPage')}>All Bon Page</a></li>
    </ul>
</nav>

<style>
    nav {
        background-color: #333;
        color: white;
        padding: 10px;
    }

    ul {
        list-style-type: none;
        margin: 0;
        padding: 0;
        display: flex;
    }

    li {
        margin-right: 20px;
    }

    a {
        color: white;
        text-decoration: none;
        font-weight: bold;
    }

    a:hover {
        text-decoration: underline;
    }
</style>
