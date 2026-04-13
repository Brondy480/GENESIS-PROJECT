// Jenkinsfile — Genesis Platform CI/CD Pipeline
// This file defines the automated build and deploy process

pipeline {
    
    // Run on any available Jenkins agent
    agent any
    
    // Environment variables available to all stages
    environment {
        // Docker image names
        BACKEND_IMAGE  = 'genesis-backend'
        FRONTEND_IMAGE = 'genesis-frontend'
        
        // Deployment settings
        NODE_ENV = 'production'
    }
    
    stages {
        
        // STAGE 1: Get the code from GitHub
        stage('Checkout') {
            steps {
                echo 'Checking out source code from GitHub...'
                checkout scm
            }
        }
        
        // STAGE 2: Install backend dependencies
        stage('Install Backend') {
            steps {
                echo 'Installing backend dependencies...'
                dir('backend') {
                    sh 'npm install'
                }
            }
        }
        
        // STAGE 3: Run automated tests
        stage('Run Tests') {
            steps {
                echo 'Running unit tests...'
                dir('backend') {
                    sh 'npm test'
                }
            }
            // If tests fail, the pipeline stops here and does not deploy
            post {
                failure {
                    echo 'Tests failed! Deployment cancelled.'
                }
            }
        }
        
        // STAGE 4: Install frontend dependencies and build
        stage('Build Frontend') {
            steps {
                echo 'Building React frontend...'
                dir('frontend/genesis-frontend') {
                    sh 'npm install --legacy-peer-deps'
                    sh 'npm run build'
                }
            }
        }
        
        // STAGE 5: Build Docker images
        stage('Build Docker Images') {
            steps {
                echo 'Building Docker images...'
                sh 'docker build -t ${BACKEND_IMAGE} ./backend'
                sh 'docker build -t ${FRONTEND_IMAGE} ./frontend/genesis-frontend'
            }
        }
        
        // STAGE 6: Deploy with Docker Compose
        stage('Deploy') {
            steps {
                echo 'Deploying Genesis platform...'
                sh 'docker-compose down'
                sh 'docker-compose up -d'
                echo 'Genesis platform deployed successfully!'
            }
        }
    }
    
    // Post-pipeline notifications
    post {
        success {
            echo 'Pipeline succeeded! Genesis is live.'
        }
        failure {
            echo 'Pipeline failed! Check the logs above.'
        }
    }
}