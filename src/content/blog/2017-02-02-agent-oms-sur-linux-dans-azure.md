---
title: Agent Oms sur Linux dans Azure
description: ""
tags: [""]

slug: 2017/02/02/agent-oms-sur-linux-dans-azure
pubDate: 2017-02-02 19:29:38
img: /assets/stock-4.jpg
img_alt: "nice abstract image"
---

Si vous utilisez déjà OMS vous avec des linux dans Azure, vous avez peut être eu le même soucis que moi et Pascal Saulière. A savoir le log de l'agent OMS qui grossit et prends toute la place dispo (le cochon!)

Pour éviter que cela ne se reproduise, j'ai ajouté dans ma configuration de logrotate, présent par défaut sur bon nombre de distributions, a savoir /etc/logrotate.conf

<pre>/var/opt/microsoft/omsagent/log {
        missingok
        size 1G
        rotate 4
}
</pre>

L'idée étant de l'empêcher de grossir de plus de 1G (size 1G) x 4 (rotate 4).

Update sur github, le problème serait résolu :

<https://github.com/Microsoft/OMS-Agent-for-Linux/issues/366#issuecomment-278435829>

&nbsp;
