pipeline {
    agent any

    stages {
        stage('build-gradle') {
            steps {
                script {
                    sh './gradlew clean build'
                }
        }
        stage("build-docker-image") {
            steps {
                sh 'docker build -t captainbrando/am_radio:deployed .'
            }
        }
        stage("push-image") {
            steps {
                withDockerRegistry(credentialsId: 'dc04754e-2f26-4602-ab49-9bcebb7475f5', url: 'https://registry.hub.docker.com') {
                    sh 'docker push captainbrando/am_radio'
                }
            }
        }
        stage("deploy-image") {
            steps {
                sh 'docker run -d -p 9015:9015 captainbrando/am_radio'
            }
         }
    }
    post {
        always {
            // Cleans the workspace - so Jenkins will run fast and efficiently
            cleanWs()
        }
    }
}