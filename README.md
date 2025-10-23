# Clarity Flow AI API

Backend service for business management chat interactions using Google Gemini.
This API powers conversational AI for managing appointments, tasks, employees, and sales through natural language processing.

## Features

- AI-Powered Chat with Google Gemini
- Business Operations Management
- Tool Calling for CRUD Operations
- Auth0 Authentication and Authorization
- Security & Validation
- Production-Ready Logging

## Built With

- Fastify
- TypeScript
- Genkit and Google Gemini
- Zod

## Getting Started

### 1 Prerequisites

You'll need:

- A Google Gemini API Key from Google AI Studio
- An Auth0 account for authentication

### 2 Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/wesleybertipaglia/clarity-flow-api.git
cd clarity-flow-api
npm install
npm run dev
```

### 3 Environment Variables

Create a file named `.env` in the project root and fill in the required variables:

```ini
PORT=3000
CORS_ORIGIN=https://clarity-flow.vercel.app
NODE_ENV=development
AUTH0_DOMAIN=your-auth0-domain.auth0.com
```

## Endpoint

The API exposes a single endpoint for chat interactions:

`POST /chat` - Handles business management chat using AI, with context for performing operations.

### Request Headers

- `Content-Type: application/json`
- `Authorization: Bearer <auth0-jwt-token>`

### Request Body (JSON)

| Field      | Type     | Description                                                                                        |
| :--------- | :------- | :------------------------------------------------------------------------------------------------- |
| `question` | `string` | The user's message or question. Use '@' prefix for commands (e.g., "@create-task Prepare report"). |
| `context`  | `object` | Context data including user, company, employees, tasks, sales, appointments.                       |
| `apiKey`   | `string` | The user's Google Gemini API key.                                                                  |
| `action`   | `string` | Optional: action to perform (create, read, update, delete).                                        |
| `type`     | `string` | Optional: type of entity (appointment, task, user, sale, company).                                 |

### Usage Patterns

- **Commands**: Start with '@' and provide action/type - e.g., "@create-task Prepare Q3 report"
- **Questions**: Regular questions about business context - e.g., "How can I improve team productivity?"
- **Invalid**: Providing action/type without '@' prefix will return an error message.

### Response Body (JSON)

| Field    | Type     | Description                                    |
| :------- | :------- | :--------------------------------------------- |
| `answer` | `string` | AI-generated response.                         |
| `action` | `string` | Optional action (e.g., "create", "read").      |
| `type`   | `string` | Optional type of action (e.g., "appointment"). |
| `data`   | `object` | Optional data for the action.                  |

## Contributing

Contributions are welcome! If you'd like to help improve Clarity Flow, feel free to fork the repository, open a pull request, or submit issues.

## License

This project is licensed under the [MIT License](LICENSE).
