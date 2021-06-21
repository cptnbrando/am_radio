pipeline {
    agent any

    stages {

        stage('Hello') {
            steps {
                echo 'Hello World'
            }
        }

        stage('build') {
            steps {
                script {
                    sh './gradlew clean build'
                }
            }
        }

        stage("build-image") {
            steps {
//                 sh 'docker build . -t am_radio:latest'
                echo 'Build docker image...'
            }
        }

        stage("push-image") {
            steps {
//                 sh 'docker push am_radio'
                echo 'Push docker image...'
            }
        }

        stage("deploy-image") {
            steps {
//                 sh 'kubectl rollout restart am_radio --namespace=am_radio'
                echo 'Deploy docker image...'
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