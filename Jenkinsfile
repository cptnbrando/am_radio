pipeline {
    agent any

    stages {

        stage('build-gradle') {
            steps {
                script {
                    // Because we are on an extremely laggy filesystem
                    System.setProperty("org.jenkinsci.plugins.durabletask.BourneShellScript.HEARTBEAT_CHECK_INTERVAL", "3800");
//                     sh './gradlew clean build'
                    echo 'Build gradle...'
                }
            }
        }

        stage("build-image") {
            steps {
                script {
//                 sh 'docker build . -t am_radio:latest'
                    echo 'Build docker image...'
                }
            }
        }

        stage("push-image") {
            steps {
                script {
//                     sh 'docker push am_radio'
                    echo 'Push docker image...'
                }
            }
        }

        stage("deploy-image") {
            steps {
                script {
//                     sh 'kubectl rollout restart am_radio --namespace=am_radio'
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