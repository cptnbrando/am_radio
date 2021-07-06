pipeline {
    agent {
        dockerfile true
    }
    stages {
        stage('build-gradle') {
            steps {
                script {
                    echo 'Build gradle...'
                }
            }
        }
        stage("build-backend-image") {
            steps {
                script {
                    echo 'Build docker image...'
                }
            }
        }
        stage("push-image") {
            steps {
                script {
                    echo 'Push docker image...'
                }
            }
        }
        stage("deploy-image") {
            steps {
                script {
                    echo 'Deploy docker image...'
                }
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