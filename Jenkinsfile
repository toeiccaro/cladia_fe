pipeline {
    agent any

    stages {
         stage('Check Environment Variables') {
            steps {
                sh 'printenv'
            }
        }
        stage('Check User') {
            steps {
                sh 'echo "Current User: $USER"'
            }
        }
        stage('Deploy') {
            steps {
                // Ensure the old container is removed if it exists
                sh '''
                CONTAINER_NAME="ueno-system-fe"
                if docker ps -a -q -f name=$CONTAINER_NAME; then
                    docker rm -f $CONTAINER_NAME
                fi
                '''
                sh 'docker compose down'
                sh 'docker compose build'
                sh 'docker compose up -d'
                echo 'deploy reactjs success'
            }
        }
    }
}