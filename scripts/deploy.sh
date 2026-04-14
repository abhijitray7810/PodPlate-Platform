#!/bin/bash
# ═══════════════════════════════════════════════════════════
# PodPlate — Kubernetes Deploy Script
# Usage: ./deploy.sh [up|down|status|logs SERVICE_NAME]
# ═══════════════════════════════════════════════════════════

set -e

ACTION=${1:-up}
NAMESPACE="podplate"

case $ACTION in
  up)
    echo "🚀 Deploying PodPlate to Kubernetes..."

    echo "1/8 Creating namespace..."
    kubectl apply -f namespace/namespace.yaml

    echo "2/8 Applying secrets..."
    kubectl apply -f secrets/secrets.yaml

    echo "3/8 Applying configmap..."
    kubectl apply -f configmap/configmap.yaml

    echo "4/8 Creating storage..."
    kubectl apply -f storage/pvc.yaml

    echo "5/8 Deploying MongoDB and Redis..."
    kubectl apply -f mongodb/mongodb.yaml
    kubectl apply -f redis/redis.yaml

    echo "⏳ Waiting for databases to be ready..."
    kubectl wait --for=condition=ready pod -l app=mongodb -n $NAMESPACE --timeout=120s
    kubectl wait --for=condition=ready pod -l app=redis   -n $NAMESPACE --timeout=60s

    echo "6/8 Deploying microservices..."
    kubectl apply -f services/microservices.yaml

    echo "7/8 Deploying frontend..."
    kubectl apply -f frontend/frontend.yaml

    echo "8/8 Applying ingress and HPA..."
    kubectl apply -f ingress/ingress.yaml
    kubectl apply -f hpa/hpa.yaml

    echo ""
    echo "✅ Deployment complete!"
    echo ""
    kubectl get pods -n $NAMESPACE
    ;;

  down)
    echo "🛑 Tearing down PodPlate..."
    kubectl delete namespace $NAMESPACE
    echo "✅ Done."
    ;;

  status)
    echo "📊 PodPlate status:"
    kubectl get pods,svc,ingress -n $NAMESPACE
    ;;

  logs)
    SERVICE=${2:-api-gateway}
    kubectl logs -f deployment/$SERVICE -n $NAMESPACE
    ;;

  *)
    echo "Usage: $0 [up|down|status|logs SERVICE_NAME]"
    exit 1
    ;;
esac

