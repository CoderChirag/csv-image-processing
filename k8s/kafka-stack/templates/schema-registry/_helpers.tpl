{{/* _helpers.tpl */}}

{{- define "schemaRegistry.values" -}}
{{- if hasKey .Values "schemaRegistry" -}}
{{- $_ := set .Values "image" .Values.schemaRegistry.image -}}
{{- $_ := set .Values "replicaCount" .Values.schemaRegistry.replicaCount -}}
{{- $_ := set .Values "resources" .Values.schemaRegistry.resources -}}
{{- $_ := set .Values "env" .Values.schemaRegistry.env -}}
{{- end -}}
{{- end -}}