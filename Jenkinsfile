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
                CONTAINER_NAME="its-system-fe"
                if sudo docker ps -a -q -f name=$CONTAINER_NAME; then
                    sudo docker rm -f $CONTAINER_NAME
                fi
                '''
                sh 'sudo docker-compose -f docker-compose.yml down'
                sh 'sudo docker-compose -f docker-compose.yml build'
                sh 'sudo docker-compose -f docker-compose.yml up -d'
                echo 'deploy reactjs success'
            }
        }
    }
}