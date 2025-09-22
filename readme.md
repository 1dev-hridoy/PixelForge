
<p align="center">
	<img src="https://drive.google.com/uc?id=1Xfqkx2mbG5Hs5n1C5mfPIsYTec5XVSwD">
</p>

<p align="center">
	<img src="https://img.shields.io/github/license/1dev-hridoy/PixelForge?style=for-the-badge&logo=opensourceinitiative&logoColor=white&color=0080ff" alt="license">
	<img src="https://img.shields.io/github/last-commit/1dev-hridoy/PixelForge?style=for-the-badge&logo=git&logoColor=white&color=0080ff" alt="last-commit">
	<img src="https://img.shields.io/github/languages/top/1dev-hridoy/PixelForge?style=for-the-badge&color=0080ff" alt="repo-top-language">
	<img src="https://img.shields.io/github/languages/count/1dev-hridoy/PixelForge?style=for-the-badge&color=0080ff" alt="repo-language-count">
</p>
<p align="center">Built with the tools and technologies:</p>
<p align="center">
	<img src="https://img.shields.io/badge/Express-000000.svg?style=for-the-badge&logo=Express&logoColor=white" alt="Express">
	<img src="https://img.shields.io/badge/npm-CB3837.svg?style=for-the-badge&logo=npm&logoColor=white" alt="npm">
	<img src="https://img.shields.io/badge/Mongoose-F04D35.svg?style=for-the-badge&logo=Mongoose&logoColor=white" alt="Mongoose">
	<img src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=for-the-badge&logo=JavaScript&logoColor=black" alt="JavaScript">
	<img src="https://img.shields.io/badge/EJS-B4CA65.svg?style=for-the-badge&logo=EJS&logoColor=black" alt="EJS">
	<img src="https://img.shields.io/badge/Axios-5A29E4.svg?style=for-the-badge&logo=Axios&logoColor=white" alt="Axios">
</p>
<br>

A powerful and customizable API boilerplate built with Node.js, Express, and MongoDB. PixelForge provides a solid foundation for building your own RESTful APIs with features like user authentication, rate limiting, and a dynamic API documentation page.

## Live Demo

<a href="https://www.pixelforge.giize.com/">
  <img src="https://img.shields.io/badge/Live%20Demo-Click%20Here-red?style=for-the-badge" />
</a>
<a href="https://github.com/1dev-hridoy/PixelForge">
  <img src="https://img.shields.io/badge/GitHub-Repo-black?style=for-the-badge&logo=github" />
</a>

## Contact

<a href="https://t.me/BD_NOOBRA">
  <img src="https://img.shields.io/badge/Telegram-BD__NOOBRA-blue?style=for-the-badge&logo=telegram" />
</a>
<a href="https://github.com/1dev-hridoy">
  <img src="https://img.shields.io/badge/GitHub-Profile-black?style=for-the-badge&logo=github" />
</a>
<a href="https://t.me/bdnoobradeveloper">
  <img src="https://img.shields.io/badge/Telegram-BD__NOOBRA__Developer-blue?style=for-the-badge&logo=telegram" />
</a>
<a href="https://t.me/nexalo">
  <img src="https://img.shields.io/badge/Telegram-Nexalo-blue?style=for-the-badge&logo=telegram" />
</a>



## Features

*   **RESTful API Boilerplate**: A solid starting point for your own API.
*   **User Authentication**: JWT-based authentication for securing your endpoints.
*   **Rate Limiting**: Protect your API from abuse with flexible rate limiting.
*   **Dynamic API Documentation**: A beautiful and interactive API documentation page generated automatically from your API files.
*   **Customizable Settings**: Easily customize your service name, slogan, and other settings through `settings.json`.
*   **Easy to Extend**: A simple and intuitive structure for adding new API endpoints.
*   **MongoDB Integration**: Uses Mongoose for elegant MongoDB object modeling.
*   **Ready for Deployment**: Includes configuration for easy deployment to Vercel and Render.

## Screenshots

| Landing Page                                     | API Documentation                                |
| ------------------------------------------------ | ------------------------------------------------ |
| ![Landing Page](https://drive.google.com/uc?id=1DbAYsxHGhncvKMcpKSBPFYwKHxqW6zpk) | ![API Documentation](https://drive.google.com/uc?id=1DsQ_lJOm0Lm9yPmWOdj1vbSqAmT5Buz6) |

| Profile Page                                   | Admin Dashboard                                    |
| ---------------------------------------------- | -------------------------------------------------- |
| ![Profile Page](https://drive.google.com/uc?id=1719cY1nNqNpAB3drh-YSJZunhhGku1gM) | ![Admin Dashboard](https://drive.google.com/uc?id=1OfPx0WdAMkpGNyuvfO3ZDqM7kDdlsUFO)   |

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v14 or later)
*   [npm](https://www.npmjs.com/)
*   [Git](https://git-scm.com/)
*   A [MongoDB](https://www.mongodb.com/) database. You can create a free one on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/1dev-hridoy/PixelForge.git
    cd PixelForge
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

### Configuration

1.  **Create a `.env` file:**
    Create a `.env` file in the root of the project and add the following environment variables. You can copy the `example.env` file to get started.
    ```env
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    SESSION_SECRET=your_session_secret
    ADMIN_EMAIL=your_admin_email@example.com
    ```

2.  **Get your MongoDB Connection String:**
    *   Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a new project and a new cluster.
    *   In your cluster, go to "Database Access" and create a new database user with a username and password.
    *   Go to "Network Access" and add your current IP address to the IP access list.
    *   Go to "Databases", click "Connect" on your cluster, select "Connect your application", and copy the connection string.
    *   Replace `<username>`, `<password>`, and `<dbname>` in the connection string with your database user's credentials and your database name.

3.  **Customize `settings.json`:**
    Open the `settings.json` file and customize the service name, slogan, and other settings to your liking.

    ```json
    {
      "service": {
        "name": "PixelForge",
        "slogan": "A powerful and customizable API boilerplate.",
        "ownerName": "1dev-hridoy",
        "serverURI": "http://localhost:3000",
        "headDoc": "Welcome to the PixelForge API Documentation"
      },
      "buttons": [
        {
          "name": "GitHub",
          "url": "https://github.com/1dev-hridoy/PixelForge"
        }
      ],
      "rateLimit": {
        "free": {
          "requestsPerMinute": 10,
          "requestsPerDay": 100
        },
        "premium": {
          "requestsPerMinute": 60,
          "requestsPerDay": 1000
        }
      },
      "apiPrefix": "PF_"
    }
    ```

## Usage

To run the application in development mode, use the following command:

```sh
node .
```

The server will start on `http://localhost:3000` by default.

## Deployment

### Deploying to Vercel

1.  Create a `vercel.json` file in the root of your project with the following content:
    ```json
    {
      "version": 2,
      "builds": [
        {
          "src": "server.js",
          "use": "@vercel/node",
          "config": {
            "includeFiles": ["settings.json"]
          }
        }
      ],
      "routes": [
        {
          "src": "/(.*)",
          "dest": "server.js"
        }
      ],
      "crons": [
        {
          "path": "/api/cron/reset-daily-limits",
          "schedule": "0 0 * * *"
        }
      ]
    }
    ```
2.  Push your code to your GitHub repository.
3.  Go to [Vercel](https://vercel.com/) and create a new project, importing your GitHub repository.
4.  Vercel will automatically detect that it's a Node.js project.
5.  Add your environment variables from your `.env` file to the Vercel project settings.
6.  Deploy!

### Deploying to Render

1.  Push your code to your GitHub repository.
2.  Go to [Render](https://render.com/) and create a new "Web Service".
3.  Connect your GitHub repository.
4.  Render will automatically detect that it's a Node.js project.
5.  Set the "Start Command" to `node .`.
6.  Add your environment variables from your `.env` file in the "Environment" section.
7.  Deploy!

## Creating New APIs

To create a new API endpoint, follow these steps:

1.  **Create a new JavaScript file** in the `api` directory. You can organize your APIs into subdirectories by category. For example, to create a new "fun" API, you could create a file at `api/fun/my-new-api.js`.

2.  **Define the API metadata and handler** in the new file. The file must export a `meta` object and a `handler` function.

    ```javascript
    // api/fun/my-new-api.js

    const meta = {
        name: "My New API",
        version: "1.0.0",
        description: "A new API that does something fun.",
        author: "Your Name",
        method: "get", // or "post", "put", "delete"
        category: "fun",
        path: "/my-new-api",
        params: {
            param1: "required",
            param2: "optional"
        }
    };

    const handler = async (req, res, meta) => {
        try {
            const { param1, param2 } = req.query;

            if (!param1) {
                return res.status(400).json({
                    error: "param1 is required"
                });
            }

            // Your API logic here

            res.json({
                message: "Hello from my new API!",
                param1,
                param2
            });

        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    };

    module.exports = { meta, handler };
    ```

3.  **The server will automatically register the new endpoint** when you restart it. The endpoint will be available at `/api/fun/my-new-api` and will appear on the API documentation page.

## Contributing

Contributions are welcome! Please feel free to submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
