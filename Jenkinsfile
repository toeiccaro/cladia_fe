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
                sh 'sudo docker-compose -f docker-compose.yml build'
                sh 'sudo docker-compose -f docker-compose.yml up -d'
                echo 'deploy reactjs success'
            }
        }
    }
}