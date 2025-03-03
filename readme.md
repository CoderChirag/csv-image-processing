`kubectl create namespace kafka`
`helm install k8s/kafka-stack -n kafka`
`kubectl create secret generic mongo-uri --from-literal MONGO_URI=<uri> -n kafka`
`kubectl create secret generic apm-uri --from-literal APM_URI=<uri> -n kafka`
`kubectl create secret generic apm-api-key --from-literal APM_API_KEY=<key> -n kafka`
