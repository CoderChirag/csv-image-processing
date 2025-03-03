{{/* _helpers.tpl */}}

{{- define "kafka.quorum" -}}
  {{/* Generates KAFKA_CONTROLLER_QUORUM_VOTERS dynamically */}}
  {{- $quorum := list -}}
  {{- range $i := until (int $.Values.replicaCount) -}}
    {{- $quorum = append $quorum (printf "%d@%s-%d.%s.%s.svc.cluster.local:29093" $i $.Release.Name $i $.Release.Name $.Release.Namespace) -}}
  {{- end -}}
  {{ join "," $quorum }}
{{- end -}}