{{/* _helpers.tpl */}}

{{- define "kafkaUi.values" -}}
{{- if hasKey .Values "kafkaUi" -}}
{{- $_ := set .Values "image" .Values.kafkaUi.image -}}
{{- $_ := set .Values "replicaCount" .Values.kafkaUi.replicaCount -}}
{{- $_ := set .Values "resources" .Values.kafkaUi.resources -}}
{{- $_ := set .Values "env" .Values.kafkaUi.env -}}
{{- end -}}
{{- end -}}