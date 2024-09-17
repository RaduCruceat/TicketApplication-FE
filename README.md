# Ticket Management System (Frontend)

A **Svelte** and **TypeScript** based frontend application that allows users to manage a ticket system. This project provides an interface to handle multiple counters, each of which can contain multiple tickets. Each counter can be added, edited, deleted, and changed between active and inactive states. Similarly, tickets can be created, updated, deleted, and transitioned between several states.

The project connects to a backend API built in **ASP.NET Core** (available in [this](https://github.com/RaduCruceat/TicketApplication-BE) repository).

## Features

### Counter Management
- **Add Counter:** Create a new counter for managing tickets.
- **Edit Counter:** Modify an existing counter's details.
- **Delete Counter:** Remove a counter from the system.
- **Change Counter State:** Toggle the state of a counter between `Active` and `Inactive`.

### Ticket Management
- **Create Ticket:** Add a new ticket to an active counter.
- **Edit Ticket:** Modify an existing ticket's information.
- **Delete Ticket:** Remove a ticket from a counter.
- **Change Ticket Status:** Change the status of a ticket to:
  - `Received`
  - `In Progress`
  - `Closed`
- **Timestamp Management:** Each ticket stores:
  - **Creation Time**
  - **Last Edited Time**

### Frontend Tech Stack
- **Svelte**: Fast and reactive front-end framework.
- **TypeScript**: Typed JavaScript for better development experience.
- **SvelteKit CSS**: Custom styling for application using Svelte's scoped CSS features.
- **HTML**: Semantic structure for the UI.

### Backend API
The frontend interacts with an **ASP.NET Core** backend API to perform CRUD operations on counters and tickets. The backend repository can be found [here](https://github.com/RaduCruceat/TicketApplication-BE).

