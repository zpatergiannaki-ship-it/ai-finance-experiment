# AI Finance Experiment

This repository hosts the backend for a financial AI assistant academic experiment. Below are instructions on how to install dependencies, run the project locally, and deploy it on Render.com.

## Table of Contents
- [Installation](#installation)
- [Running Locally](#running-locally)
- [Deployment on Render.com](#deployment-on-rendercom)

## Installation
To set up the project, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/zpatergiannaki-ship-it/ai-finance-experiment.git
   cd ai-finance-experiment
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```

## Running Locally
To run the application locally, use the following command:
```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Deployment on Render.com
To deploy your project on Render.com, follow these steps:

1. **Create an account** on Render.com if you haven't already.
2. **Create a new web service** on Render and connect your GitHub repository.
3. **Configure the build command** (if necessary) and the start command:
   - Build command: `npm install`
   - Start command: `npm start`
4. **Set your environment variables** in the Render dashboard (if needed).
5. **Deploy** your service and monitor the logs for any issues.

By following these instructions, you should be able to successfully install, run, and deploy the financial AI assistant backend. Happy coding!