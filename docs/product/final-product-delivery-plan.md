# SantosDia — plano de entrega do produto global

**Versão:** 1.0  
**Data da revisão:** 18 de outubro de 2026  
**Estado:** plano de execução; subordinado à visão normativa `docs/product/global-liturgical-intelligence-v2.1.md` e ao contrato `config/product-platform-contract.json`.

## 1. Visão global revista

SantosDia deve ajudar uma pessoa a compreender o dia cristão que vive, o seu significado e os próximos dias, na sua tradição, jurisdição, calendário, fuso horário e idioma. Deve também funcionar como infraestrutura pública reutilizável por calendários, aplicações, API, motores de busca e agentes.

A ambição é global; a publicação é gradual. Cada tradição e território só aparece como pronto quando fontes competentes, regras, nomes, idioma e saídas públicas passaram os mesmos critérios. A arquitetura é comum, mas as regras e autoridades de uma Igreja nunca são copiadas para outra.

As biografias são parte da experiência editorial, não páginas automáticas de publicidade. Toda a biografia pública terá identidade verificada, fontes rastreáveis, texto original SantosDia e idioma revisto. Um candidato de nome ainda não verificado não é tratado como santo, ligado a uma identidade ou publicado automaticamente.

A visão normativa v2.1 já traduz bem este destino. A melhoria necessária é operacional: um caminho crítico único, uma fonte de verdade por estado, metas de aceitação mensuráveis e entregas ordenadas por dependência.

## 2. Estado de partida verificado

Snapshot de produto Dropbox de 18/10/2026 e fontes de projeto disponíveis nesta data:

- Portugal, calendário católico romano 2026: 389 ocorrências em 365 dias.
- 205/389 ocorrências (52,7%) ligadas ao modelo canónico; 184 ainda por reconciliar. Equivalência semântica e mudança do modelo público continuam bloqueadas.
- 70 candidatos P0 requerem revisão de identidade; os materiais disponíveis não autorizam associação automática por nome.
- O checkpoint editorial identifica 29 biografias profundas prontas; a cobertura continua insuficiente para a remediação AdSense.
- Idiomas registados no modelo: en, es, pt, fr, fil, ru, sw, de, it e pl. Superfícies públicas registadas: en, es, pt e it. A cobertura deve ser medida por campo e página; não pode haver fallback silencioso.
- O registo de monetização do repositório (29/08) indica `REMEDIATION_REQUIRED` por conteúdo de baixo valor; o snapshot Dropbox de 18/10 indica `PREPARING`. Estado atual não confirmado: consultar o painel do AdSense antes de qualquer nova submissão. Nenhum destes dois estados equivale a aprovação.
- PR #346 esteve bloqueado pelo `npm audit` em `braces` (CVE-2026-93687) e em dependências transitivas do toolchain. Em 18/10, a auditoria ficou sem vulnerabilidades após atualização de Next.js/Wrangler e dependências corrigidas, mais um backport local documentado de `braces` 3.0.3 com limite de profundidade; o upstream ainda não publicou uma versão corrigida. O backport tem teste de regressão e deve ser substituído quando houver release upstream. PRs #347 e #348 mantêm os seus próprios gates.
- Cloudflare Workers é o runtime; Vercel já não faz parte da arquitetura ativa do projeto. A instalação GitHub Vercel é um acesso de conta separado, não uma dependência do SantosDia.

Estes valores são uma linha de base, não metas editoriais arbitrárias. Cada mudança de fonte exige novo snapshot, hash e proveniência.

## 3. Definição verificável de produto final

O produto está pronto para cada contexto publicado quando todos os critérios aplicáveis abaixo passam. “Global” significa arquitetura capaz de crescer e contextos realmente prontos; não significa anunciar calendários sem autoridades ou dados suficientes.

### Experiência pública

- Today, calendário, pesquisa, páginas de data, perfis, oração e descoberta respondem às perguntas de produto sem exigir conhecimento de API.
- Não há Today vazio por falha de aquisição, páginas indexáveis de modelo vazio, placeholders ou páginas em massa de baixo valor.
- Texto acessível e útil em dispositivos móveis e desktop; sem imagens editoriais, áudio ou vídeo pré-gravado. Live verificado continua textual antes de ativação explícita.
- A interface indica claramente tradição, jurisdição, calendário, fuso e idioma quando relevantes.

### Dados e biografias

- Cada ocorrência pública tem identidade, autoridade, fonte, proveniência e resultado de precedência/transferência adequados ao seu contexto.
- O contexto inicial Portugal/romano/Gregoriano alcança 389/389 correspondências exatas com a fonte aprovada; diferenças ficam explicadas e todos os casos estruturais que exigem autoridade competente recebem revisão explícita.
- Cada perfil público tem identidade resolvida e pelo menos o padrão editorial profundo já definido no checklist AdSense: resumo original, vários parágrafos editoriais, factos relevantes, contexto e fontes competentes, com ligações internas úteis.
- Texto de terceiros é evidência, não conteúdo a copiar, traduzir, resumir ou parafrasear levemente. Direitos não confirmados implicam guardar referência, metadados e hash, não redistribuir o texto.
- Cada biografia publicada num idioma é texto original revisto nesse idioma. Perfis incompletos podem permanecer disponíveis como produto, mas ficam fora de indexação e anúncios conforme os gates existentes.

### Infraestrutura e distribuição

- Para cada contexto lançado, Today, calendário, calculador, HTML, JSON/API, JSON-LD e ICS têm semântica equivalente.
- Geração cobre automaticamente a janela `Y-1 ... Y+3`, sem recolher fontes em tempo de pedido; fontes anuais validam e detetam mudanças.
- ICS mantém UID estável e backlink SantosDia, e atravessa a mudança de ano sem nova subscrição.
- Falha de fonte preserva o último estado válido; cutover do modelo é atómico e reversível, com histórico e provas preservados.

### Idiomas e alcance global

- Locale e tradição são dimensões independentes; cada idioma lançado passa revisão de nomes, termos e texto editorial.
- A adição de país nunca infere uma política eclesial a partir da língua ou fronteira civil.
- Primeiro conclui-se Portugal; depois entram jurisdições lusófonas com evidência própria, seguidas por kernels independentes OCA, GOARCH, Igreja de Inglaterra e Copta Ortodoxa quando os respetivos vetores e autoridades estiverem prontos.
- Cada contexto e idioma é anunciado apenas após aprovação dos mesmos critérios; os restantes são identificados como em preparação.

### Confiança, privacidade e receita

- Publicação falha fechada; sem ad serving enquanto o AdSense não indicar aprovação explícita e a transição não estiver registada.
- Re-submissão só ocorre após páginas representativas ricas em conteúdo original, navegação clara, transparência editorial, footprint fraco corrigido e revisão humana explícita.
- Interações devocionais permanecem locais ao dispositivo; não criar perfis religiosos nem usar sinais religiosos para personalização de anúncios.
- Nenhuma promessa pública ultrapassa a prontidão demonstrada.

### Operação gratuita e autónoma

- GitHub é a fonte de verdade do código; Dropbox guarda fontes permitidas, snapshots, provas, conflitos e recuperação; Cloudflare serve a projeção pública.
- Tarefas normais de build, CI, reconciliação e validação não escrevem em D1 remoto. Promoção de produção é uma operação separada, autorizada, idempotente, com preflight, recibo e rollback.
- Processos mensais/delta mantêm fontes e perfis; checks semanais limitam-se a saúde, frescura e mudanças relevantes. Não repetir recolhas integrais sem necessidade.
- Consumir abaixo do menor entre os limites Free do fornecedor e os limites internos do projeto. Limites internos atuais: um deploy Cloudflare por dia, no máximo uma operação remota de staging D1 por dia útil UTC, até 1M leituras, 25k escritas e 10k statements por lote; produção, DNS, secrets, pagamentos e R2 continuam fechados salvo decisão e budget gate específicos.

## 4. Caminho crítico e entregas

A ordem abaixo fecha dependências antes de alargar a superfície pública. Uma fase termina somente quando o seu critério de saída está verificado e registado no GitHub e no pacote de evidência Dropbox correspondente.

### Fase 0 — Baseline, segurança e fila limpa

**Trabalho:** manter uma lista única de tarefas; validar cabeças e checks dos PRs existentes; remover duplicados apenas quando não há trabalho único; corrigir falhas de CI sem reduzir gates; atualizar snapshots e estados contraditórios.

**Saída:** cada PR aberto tem propósito, dono operacional, checks atuais e próxima ação; `npm audit` fica verde após atualização segura ou backport local documentado, com teste de regressão e plano de substituição por release upstream; o estado de AdSense e os limites cloud usados como base têm observação datada.

### Fase 1 — Portugal 2026 canónico e perpétuo

**Trabalho:** continuar a família temporal Christmas/Epiphany, depois weekday de Ordinary Time e sábado mariano; seguir com observâncias fixas, coletivas e títulos marianos. Para cada candidato, gerar resultado presente, substituído, opcional, comemorado ou suprimido contra a fonte 2026. Tratar transferências e precedência antes da ocorrência final.

**Bloqueio humano:** as 21 linhas de estrutura, identidade própria ou precedência portuguesa exigem decisão da autoridade competente. Preparar dossiês de revisão, sem inventar resultados nem publicar.

**Saída:** 389/389 com identidade de fonte exata, cada diferença explicada, geração multi-ano aprovada, vetores e recibos imutáveis. Só então propor cutover atómico, com rollback provado e sem operação D1 automática em CI.

### Fase 2 — Perfis e biografias originais

**Trabalho:** rever os 70 P0 como candidatos, resolver identidade com fontes competentes e separar Pessoa, reconhecimento e observância; criar/normalizar pacotes de evidência no Dropbox respeitando direitos; escrever a primeira biografia original em língua base; adicionar localizações apenas após revisão linguística; consolidar cobertura editorial e critérios `noindex`/sitemap.

**Ordem:** começar por perfis já comprovados e mais úteis; publicar em lotes pequenos e verificáveis. Não esperar que os 70 P0 virem automaticamente 70 santos nem que o texto de fonte se torne biografia.

**Saída:** todo perfil indexável passa o standard profundo; todos os factos têm origem; a cobertura por idioma é mensurável; perfis fracos não recebem indexação nem anúncios. As biografias e fontes, com hashes e proveniência, ficam preservadas no GitHub/Dropbox segundo o modelo de direitos.

### Fase 3 — Produto diário e descoberta

**Trabalho:** melhorar primeiro Today, páginas de data e perfis; garantir contexto editorial antes de listas longas; rever pesquisa, navegação móvel/acessibilidade, vazios/erros e ligações internas. Reusar o motor existente; não criar cópias paralelas de calendário.

**Saída:** tarefas essenciais funcionam com teclado e telemóvel; um utilizador consegue responder às cinco perguntas da visão; dados vazios ou por validar não criam páginas indexáveis.

### Fase 4 — API, calendário e retenção

**Trabalho:** provar contratos OpenAPI, paginação, JSON-LD, fuso/feriados/all-day e ICS; testar clientes de calendário; manter UID e backlink; documentar exemplos e comportamento de erros/cache.

**Saída:** paridade semântica 100% para contextos lançados em HTML/API/JSON-LD/ICS; feed persiste entre anos; nenhuma ocorrência abaixo do limiar de revisão é distribuída.

### Fase 5 — AdSense e SEO responsável

**Trabalho:** confirmar estado vivo da conta; terminar a correção de conteúdo de baixo valor; auditar homepage, perfil, data, guia e calendário no domínio publicado; eliminar da indexação páginas vazias, automáticas, fracas ou duplicadas; conferir about/sources/corrections/copyright/privacy e comportamento de consentimento.

**Saída:** o produto está completo e recrawlado; as páginas representativas fornecem valor editorial original; uma pessoa decide explicitamente se volta a submeter. Se aprovado, ativar apenas o modelo manual já definido, sem Auto Ads nem formatos sobrepostos, após confirmar CMP e produção. A aprovação nunca é garantida pelo plano.

### Fase 6 — Expansão global controlada

**Trabalho:** abrir um pacote por jurisdição/contexto com mapa de autoridade, fontes, regras, calendário, nomes locais, vetores anuais, teste de precedência e projeções. Implementar a ordem estratégica sem transformar CPLP/PALOP em autoridades e sem reutilizar o calendário português como substituto.

**Saída:** cada contexto anunciado passa paridade e qualidade independente; outros permanecem explicitamente em preparação. Adicionar idiomas com evidência de audiência e revisão nativa, não por tradução em massa.

### Fase 7 — Manutenção autónoma

**Trabalho:** automatizar aquisição limitada e retomável, arquivamento Dropbox, normalização, hashes, delta de fontes, alerta de drift, construção, validação e recuperação. Fazer tarefas humanas só para conflitos normativos/identidade, decisão editorial e submissão AdSense.

**Saída:** rollover anual e manutenção normal não requerem upload ou reescrita humana; os relatórios automáticos detetam falhas e preservam last-known-good; não existem operações que ultrapassem caps gratuitos.

## 5. Ordem operacional imediata

1. Manter `npm audit` ativo; acompanhar o backport de `braces` até existir release upstream corrigida e substituí-lo com instalação limpa e testes aprovados.
2. Validar checks atuais de #346, #347 e #348; atualizar/rebasear as propostas após a correção de dependências chegar a `main` e só integrar com todos os seus gates aprovados.
3. Retomar a fila Portugal pela família temporal Christmas/Epiphany que o checkpoint identifica como próxima; criar apenas o próximo lote completo de regras, suppressions, vetores e provas.
4. Acrescentar a fonte/pack e os estados dessa entrega ao Dropbox antes de continuar para a família seguinte.
5. Rever identidade de candidatos e biografias aprovadas em lotes pequenos, com texto original e idioma explicitamente revisto.
6. Após 389/389, preparar comparação integral e gate de cutover; não executar escrita ou deploy apenas porque CI passou.
7. Com cutover provado, concluir auditoria das páginas e AdSense; só então abrir contexto/idioma novo.

Cada iteração deve deixar: PR pequeno, testes direcionados e Quality completos; resumo atualizado; artefacto/recibo Dropbox; nenhuma alteração de produção não autorizada. Não é necessário esperar por agenda para fazer trabalho local, pesquisa ou PR; respeitar apenas limites e cadências de chamadas remotas.

## 6. Gates que impedem avanço indevido

- Falha de `npm audit` impede merge; um backport local só é aceite com proveniência, licença preservada, teste de regressão e estratégia de substituição documentados. Não usar downgrade nem desativar o gate.
- Uma ocorrência anual, rótulo ou nome não cria uma identidade nem regra perpétua.
- Semântica de Portugal exige fonte portuguesa competente onde a decisão seja local; Holy See não substitui autoridade local.
- Dados de fonte sem direitos não são republicados; ficam como referências, metadados e hashes.
- Nenhum P0 é ligado ou publicado automaticamente por semelhança de nome.
- Nenhuma execução de CI, build, health check ou reconciliação escreve D1 remoto.
- Nenhum deploy repetido no mesmo dia nem trabalho de teste consome a operação reservada de budget.
- Nenhuma página é criada apenas para SEO ou inventário publicitário; AdSense continua fail-closed até estado aprovado verificado.
- Mudanças de tradição, jurisdição, produção, DNS, segredos e pagamentos não são inferidas de autorização para editar conteúdo.

## 7. Referências de política e produto

- Estratégia normativa: `docs/product/global-liturgical-intelligence-v2.1.md`.
- Contrato de produto e operação: `config/product-platform-contract.json`.
- Calendar engine, fonte e reconciliação: `docs/perennial-liturgical-calendar-engine.md` e `docs/operations/current-cycle-checkpoint.md`.
- Conteúdo e AdSense: `docs/editorial-content-policy.md`, `docs/adsense-activation-checklist.md`, `docs/monetization-status.md`.
- Google AdSense, prontidão de páginas: <https://support.google.com/adsense/answer/7299563> (consultado em 18/10/2026).
- Google AdSense, rejeição por baixo valor: <https://support.google.com/adsense/answer/81904> (consultado em 18/10/2026).

As orientações oficiais reforçam conteúdo original e relevante, navegação clara e valor editorial; não garantem aprovação. A decisão final depende da revisão atual do Google e da qualidade real publicada.
