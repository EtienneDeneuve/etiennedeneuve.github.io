---
name: "Flagger Demo Kind"
name_en: "Flagger Demo Kind"
summary: "Lab open source macOS : progressive delivery avec Flagger, Gateway API, Cilium et Envoy Gateway — les participants appliquent du YAML, pas seulement des raccourcis make."
summary_en: "Open-source macOS lab: progressive delivery with Flagger, Gateway API, Cilium and Envoy Gateway — participants apply YAML, not only make shortcuts."
status: "alpha"
type: "open-source"
role: "Auteur"
role_en: "Author"
problem: "Les équipes confondent encore rolling update Kubernetes et décision de trafic : Ready ne dit pas si une version mérite 100 % des utilisateurs."
problem_en: "Teams still confuse Kubernetes rolling updates with traffic decisions: Ready does not mean a revision deserves 100% of users."
context: "Atelier pédagogique 60 minutes, cluster Kind isolé, docs FR/EN, CI E2E Kind/Cilium/Envoy/Flagger."
context_en: "60-minute teaching workshop, isolated Kind cluster, FR/EN docs, Kind/Cilium/Envoy/Flagger E2E CI."
decisions:
  - "Gateway API + Envoy Gateway plutôt qu’Istio pour coller au chemin plateforme moderne"
  - "Métrique canary = SLI applicatif Podinfo (pédagogie) avec fenêtre rate alignée sur l’analyse Flagger"
  - "Scénarios via manifests/tp (kubectl patch/apply) pour rendre la boucle de contrôle lisible"
decisions_en:
  - "Gateway API + Envoy Gateway instead of Istio to match modern platform paths"
  - "Canary metric = Podinfo app SLI (teaching) with rate window aligned to Flagger analysis"
  - "Scenarios via manifests/tp (kubectl patch/apply) so the control loop stays readable"
principles:
  - "Lab pédagogique, pas un template production"
  - "Outils et kubeconfig isolés dans le dépôt (.tools)"
  - "FR canonique animateur ; EN pour l’entrée participant et l’architecture"
principles_en:
  - "Teaching lab, not a production template"
  - "Tools and kubeconfig isolated in the repo (.tools)"
  - "FR canonical for facilitators; EN for participant entry and architecture"
whatExists:
  - "Repository EtienneDeneuve/flagger-demo-kind (MIT)"
  - "Guides participant / formateur et miroirs English"
  - "CI validate + E2E Kind réel"
whatExists_en:
  - "Repository EtienneDeneuve/flagger-demo-kind (MIT)"
  - "Participant / facilitator guides and English mirrors"
  - "Validate CI + real Kind E2E"
currentState: "Lab maintenu pour ateliers. Ouverture publique et page projet coordonnées (voir checklist publication du dépôt)."
currentState_en: "Lab maintained for workshops. Public opening and project page coordinated (see the repo publication checklist)."
limitations:
  - "Pas de GitOps, TLS, NetworkPolicy ni métriques Envoy bout-en-bout"
  - "Cible macOS + moteur Docker ; pas un parcours Linux desktop documenté pour les participants"
limitations_en:
  - "No GitOps, TLS, NetworkPolicy, or end-to-end Envoy metrics"
  - "Targets macOS + Docker engine; no documented Linux-desktop participant path"
learnings:
  - "Sans conf à appliquer, make good/fail/ab reste magique pour un TP"
  - "Une fenêtre PromQL trop longue après fault injection fait échouer l’A/B suivant"
learnings_en:
  - "Without config to apply, make good/fail/ab stays magical in a workshop"
  - "A PromQL window that outlives fault injection fails the next A/B"
relatedArticles: []
proofs:
  - label: "GitHub: EtienneDeneuve/flagger-demo-kind"
    url: "https://github.com/EtienneDeneuve/flagger-demo-kind"
    description: "Lab, manifests/tp, docs FR/EN."
  - label: "README (English)"
    url: "https://github.com/EtienneDeneuve/flagger-demo-kind/blob/main/README.en.md"
    description: "English entry point."
  - label: "Flagger Gateway API tutorial (upstream)"
    url: "https://docs.flagger.app/tutorials/gatewayapi-progressive-delivery"
    description: "Documentation officielle Flagger."
proofLinks:
  - "https://github.com/EtienneDeneuve/flagger-demo-kind"
  - "https://docs.flagger.app/tutorials/gatewayapi-progressive-delivery"
repository: "https://github.com/EtienneDeneuve/flagger-demo-kind"
technologies:
  - "Flagger"
  - "Gateway API"
  - "Envoy Gateway"
  - "Cilium"
  - "Kind"
  - "Prometheus"
  - "Kubernetes"
startedAt: 2026-10-01
verified: true
featured: true
draft: true
displayOrder: 2
ecosystemRole: "open source, lab plateforme"
ecosystemRole_en: "open source, platform lab"
---

Flagger Demo Kind est un atelier macOS pour faire **ressentir** la boucle Flagger : une révision YAML, une HTTPRoute Gateway API pilotée, un SLI Prometheus, puis promote ou rollback — sans Istio.
