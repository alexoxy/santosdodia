# SantosDia — resolução de decisões transversais

Status: referência normativa para E01.03.  
Effective: 2026-10-18.

Este registo resolve cinco divergências entre documentos históricos e o contrato vigente. Não certifica a publicação das funcionalidades descritas. Em caso de conflito, prevalecem a visão v2.1, `config/product-platform-contract.json`, `AGENTS.md` e os documentos operacionais indicados abaixo.

| Tema | Decisão vigente | Referência executável ou operacional |
|---|---|---|
| Superfície visual | O conteúdo first-party é apenas texto. Não há retratos, fotografias, thumbnails, galerias, ilustrações, áudio decorativo ou vídeo gravado. Live oficial/verificado, textual antes da ativação e carregado por ação explícita, é a única exceção audiovisual. | `AGENTS.md`; `config/product-platform-contract.json#humanSurface`; `scripts/test-text-first-surface.mjs` |
| Janela de calendário | A projeção e a subscrição contínua servem o ano civil atual e o seguinte (`Y..Y+1`). Intervalos maiores podem existir apenas como vetores de investigação/regressão e não definem a janela pública. Pessoas, regras, fontes, história canónica e Evidence Vault não são eliminados quando um ano sai da janela. | `config/product-platform-contract.json#rollingMaterialization`; `lib/calendar-materialization-window.ts`; `app/components/CalendarSyncCenter.tsx` |
| Navegação | A navegação primária, em desktop e mobile, é Hoje, Calendário, Descobrir/Pesquisar, Rezar e Guardados. Live permanece uma superfície central acessível pela experiência diária e navegação secundária, sem substituir uma das cinco ações primárias. | `data/product-navigation-model.json`; `app/components/SiteChrome.tsx` |
| Cadência | Bootstrap é limitado e retomável. Depois de uma fonte/contexto atingir recibo de completude, calendários, biografias e patronatos usam deltas mensais distribuídos. Execução de desenvolvimento ou verificação de tarefas pode ser horária sem provocar aquisição horária. Saúde de produção/Live pode ter checks leves mais frequentes; alterações normativas concretas usam execução event-driven revista. | `config/product-platform-contract.json#acquisitionLifecycle`; `docs/operations/d1-free-tier-weekly-policy.md`; `docs/product/final-product-acceptance-2026-10-18.md` |
| AdSense | O estado registado é `REMEDIATION_REQUIRED`; `PREPARING` é apenas um snapshot histórico de 15/08/2026. Enquanto não houver aprovação observada e mudança explícita no repositório, anúncios e nova submissão ficam bloqueados e o checker é obrigatório. | `docs/monetization-status.md`; `config/product-platform-contract.json#adsenseRecoveryGate`; `scripts/check-adsense-readiness.mjs` |

Referências históricas mantêm valor de auditoria quando identificadas como snapshots. Não podem ser usadas para reativar uma política substituída.
