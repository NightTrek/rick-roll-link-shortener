# Rick Roll Link Shortener 

<div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px; margin: 20px 0;">

### Editors note:
This entire repository is written and testing using cline with claude 3.5 new as the model. It was written in about 5 minutes at a cost of $1.6756 USD including 3.3M tokens read and 29.4k token written. I have been experimenting with the limits of agent based coding and i wanted to demonstrate that it is possible to write a full fledged application in a few minutes. Full transcript is included in the project files.

</div>

A playful link shortener service that generates short URLs while secretly redirecting users to Rick Astley's "Never Gonna Give You Up". The service preserves the original link's Open Graph metadata for link previews, creating a perfect setup for friendly pranks.

## Features

- URL shortening with custom short codes
- Fetches and stores Open Graph metadata from original URLs
- Preserves link previews while redirecting to Rick Roll
- Clean, responsive web interface
- Persistent storage using Deno KV
- Docker support for easy deployment
- Optimized for Raspberry Pi 4

## Tech Stack

- **Backend**: Deno with Oak framework
- **Storage**: Deno KV store
- **Frontend**: HTML, CSS, JavaScript
- **Container**: Docker

## Prerequisites

- [Deno](https://deno.land/) 1.37.0 or higher
- Docker and Docker Compose (for containerized deployment)

## Development Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd rick-roll-link-shortener
   ```

2. Start the development server (with hot reload):
   ```bash
   deno task dev
   ```
   This will start the server at http://localhost:8000 with file watching enabled.

## Production Setup

### Local Production Mode

Run the server in production mode:
```bash
deno task start
```

### Docker Deployment

1. Build and start the container:
   ```bash
   docker-compose up -d
   ```

2. View logs:
   ```bash
   docker-compose logs -f
   ```

3. Stop the service:
   ```bash
   docker-compose down
   ```

## Project Structure

```
rick-roll-link-shortener/
├── src/
│   └── server.ts          # Main server implementation
├── public/
│   └── index.html         # Frontend interface
├── data/                  # KV store data directory
├── deno.json             # Deno configuration and tasks
├── Dockerfile            # Container configuration
├── docker-compose.yml    # Docker Compose configuration
└── README.md
```

## API Endpoints

- `POST /api/shorten`
  - Shortens a URL and stores its metadata
  - Request body: `{ "url": "https://example.com" }`
  - Returns: `{ "shortCode": "abc123", "originalUrl": "...", "title": "...", "description": "...", "image": "..." }`

- `GET /api/link/:code`
  - Retrieves metadata for a shortened URL
  - Returns: `{ "originalUrl": "...", "title": "...", "description": "...", "image": "..." }`

- `GET /:code`
  - Redirects to Rick Astley's "Never Gonna Give You Up"

## Configuration

### Environment Variables

- `DENO_ENV`: Set to 'production' for production mode
- `PORT`: Server port (default: 8000)

### Docker Volume

The KV store data is persisted in the `./data` directory, which is mounted as a volume in the Docker container.

## Development Workflow

1. Make changes to the code
2. Run tests (if any)
3. Start development server with `deno task dev`
4. Test changes locally
5. Build and test Docker container
6. Deploy

## Deployment on Raspberry Pi 4

1. Install Docker and Docker Compose on your Pi
2. Clone the repository
3. Run `docker-compose up -d`
4. The service will be available on port 8000

The Docker configuration is optimized for Raspberry Pi with:
- Host networking for better performance
- Volume mounting for data persistence
- Health checks for reliability
- Automatic restart policy

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT License - feel free to use this for your pranking needs!
