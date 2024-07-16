pipeline {
    agent any

    stages {
        stage('Deploy') {
            steps {
                sh 'docker-compose -f docker-compose.yml build'
                sh 'docker-compose -f docker-compose.yml up -d'
            }
        }
    }
}