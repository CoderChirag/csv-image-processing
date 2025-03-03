`kubectl create namespace kafka`
`helm install k8s/kafka-stack -n kafka`
`kubectl create secret generic mongo-uri --from-literal MONGO_URI=<uri> -n kafka`
