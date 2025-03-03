{{/* _helpers.tpl */}}

{{- define "kafka.values" -}}
{{- if hasKey .Values "kafka" -}}
{{- $_ := set .Values "image" .Values.kafka.image -}}
{{- $_ := set .Values "replicaCount" .Values.kafka.replicaCount -}}
{{- $_ := set .Values "resources" .Values.kafka.resources -}}
{{- $_ := set .Values "env" .Values.kafka.env -}}
{{- end -}}
{{- end -}}

{{- define "kafka.quorum" -}}
  {{/* Generates KAFKA_CONTROLLER_QUORUM_VOTERS dynamically */}}
  {{- $quorum := list -}}
  {{- range $i := until (int $.Values.kafka.replicaCount) -}}
    {{- $quorum = append $quorum (printf "%d@%s-%d.%s.%s.svc.cluster.local:29093" $i $.Release.Name $i $.Release.Name $.Release.Namespace) -}}
  {{- end -}}
  {{ join "," $quorum }}
{{- end -}}