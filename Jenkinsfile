pipeline {
    agent any

    environment {
        BACKEND_DIR  = 'node'
        FRONTEND_DIR = 'angular/medic'
        VERCEL_ORG_ID     = 'team_iy55sKGpLYWpgSQgEotOnXGQ'
        VERCEL_PROJECT_ID = 'prj_fyAJDyTCPLKaa2ltOzTAsXYF2x8T'
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    stages {

        // ──────────────────────────────────────────────
        // 1. CHECKOUT
        // ──────────────────────────────────────────────
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // ──────────────────────────────────────────────
        // 2. DETECT CHANGES
        //    Sets BACKEND_CHANGED / FRONTEND_CHANGED so
        //    later stages only run what's actually needed.
        // ──────────────────────────────────────────────
        stage('Detect Changes') {
            steps {
                script {
                    def backendChanged  = true
                    def frontendChanged = true

                    if (env.GIT_PREVIOUS_SUCCESSFUL_COMMIT) {
                        def changed = powershell(
                            script: "git diff --name-only ${env.GIT_PREVIOUS_SUCCESSFUL_COMMIT} ${env.GIT_COMMIT}",
                            returnStdout: true
                        ).trim().split('\n') as List

                        backendChanged  = changed.any { it.startsWith('node/') }
                        frontendChanged = changed.any { it.startsWith('angular/') }
                    }

                    env.BACKEND_CHANGED  = backendChanged  ? 'true' : 'false'
                    env.FRONTEND_CHANGED = frontendChanged ? 'true' : 'false'

                    echo "Backend changed  : ${env.BACKEND_CHANGED}"
                    echo "Frontend changed : ${env.FRONTEND_CHANGED}"
                }
            }
        }

        // ──────────────────────────────────────────────
        // 3. BACKEND – Install dependencies
        // ──────────────────────────────────────────────
        stage('Backend: Install') {
            when { expression { env.BACKEND_CHANGED == 'true' } }
            steps {
                dir(env.BACKEND_DIR) {
                    bat 'npm ci --prefer-offline'
                }
            }
        }

        // ──────────────────────────────────────────────
        // 4. BACKEND – TypeScript compile check
        // ──────────────────────────────────────────────
        stage('Backend: Type Check') {
            when { expression { env.BACKEND_CHANGED == 'true' } }
            steps {
                dir(env.BACKEND_DIR) {
                    bat 'npx tsc --noEmit'
                }
            }
        }

        // ──────────────────────────────────────────────
        // 5. BACKEND – Build (transpile TS → dist/)
        // ──────────────────────────────────────────────
        stage('Backend: Build') {
            when { expression { env.BACKEND_CHANGED == 'true' } }
            steps {
                dir(env.BACKEND_DIR) {
                    bat 'npm run build'
                }
            }
        }

        // ──────────────────────────────────────────────
        // 6. FRONTEND – Install dependencies
        // ──────────────────────────────────────────────
        stage('Frontend: Install') {
            when { expression { env.FRONTEND_CHANGED == 'true' } }
            steps {
                dir(env.FRONTEND_DIR) {
                    bat 'npm ci --prefer-offline'
                }
            }
        }

        // ──────────────────────────────────────────────
        // 7. FRONTEND – Angular production build
        // ──────────────────────────────────────────────
        stage('Frontend: Build') {
            when { expression { env.FRONTEND_CHANGED == 'true' } }
            steps {
                dir(env.FRONTEND_DIR) {
                    bat 'npx ng build --configuration production'
                }
            }
        }

        // ──────────────────────────────────────────────
        // 8. DEPLOY BACKEND → Railway
        //    Only on the main branch.
        //    Requires a "RAILWAY_TOKEN" secret-text
        //    credential stored in Jenkins.
        // ──────────────────────────────────────────────
        stage('Deploy Backend → Railway') {
            when {
                allOf {
                    branch 'main'
                    expression { env.BACKEND_CHANGED == 'true' }
                }
            }
            steps {
                withCredentials([string(credentialsId: 'RAILWAY_TOKEN', variable: 'RAILWAY_TOKEN')]) {
                    dir(env.BACKEND_DIR) {
                        bat 'npx @railway/cli@latest up --detach --ci'
                    }
                }
            }
        }

        // ──────────────────────────────────────────────
        // 9. DEPLOY FRONTEND → Vercel
        //    Only on the main branch.
        //    Requires a "VERCEL_TOKEN" secret-text
        //    credential stored in Jenkins.
        // ──────────────────────────────────────────────
        stage('Deploy Frontend → Vercel') {
            when {
                allOf {
                    branch 'main'
                    expression { env.FRONTEND_CHANGED == 'true' }
                }
            }
            steps {
                withCredentials([string(credentialsId: 'VERCEL_TOKEN', variable: 'VERCEL_TOKEN')]) {
                    dir(env.FRONTEND_DIR) {
                        bat "npx vercel --prod --token %VERCEL_TOKEN% --yes"
                    }
                }
            }
        }
    }

    // ──────────────────────────────────────────────
    // POST ACTIONS
    // ──────────────────────────────────────────────
    post {
        success {
            echo '✅ Pipeline completed successfully.'
        }
        failure {
            echo '❌ Pipeline failed. Check the stage logs above.'
        }
        always {
            cleanWs(cleanWhenNotBuilt: false,
                    deleteDirs:        true,
                    disableDeferredWipeout: true,
                    notFailBuild:      true,
                    patterns: [[pattern: 'node/dist/**', type: 'INCLUDE'],
                               [pattern: 'angular/medic/dist/**', type: 'INCLUDE']])
        }
    }
}
