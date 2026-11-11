# SantosDia — critérios do produto final

Decisão do utilizador: 18/10/2026. Complemento normativo à visão v2.1 e ao contrato global; não constitui declaração de implementação ou publicação.

## Cobertura e contexto

O objetivo final abrange santos católicos, ortodoxos e pessoas comemoradas pelas restantes Igrejas com calendários próprios. Preservar a designação e o estatuto usados por cada Igreja. Não confundir um catálogo de pessoas reconhecidas com presença obrigatória no calendário de cada dia. Medir por autoridade: universo conhecido, adquirido, identificado, revisto e publicado; lacunas e universos ainda desconhecidos ficam explícitos. Portugal é uma primeira validação, não o limite do produto.

País, idioma, Igreja/rito, jurisdição, instituto religioso, sistema de calendário e fuso são escolhas independentes. A sugestão inicial segue: localização disponível do visitante → região explícita do idioma do browser (pt-PT/pt-BR) → região provável do idioma segundo Intl.Locale/CLDR. A região inferida é sugestão, não residência comprovada. Não solicitar geolocalização precisa para este efeito. Localização nunca substitui uma escolha explícita. Distinguir veneração local, nacional e universal de inscrição num calendário aprovado. Aplicar o caso Joana de Portugal e as regras de `../global-calendar-context-contract.md` em todas as superfícies.

## Equivalência e geração autónoma

Manter a data original e converter para uma data civil comum com política explícita por sistema e intervalo de validade. Conversão entre gregoriano, juliano, juliano revisto e calendários próprios suportados não significa igualdade de festas: o cálculo pascal e as regras eclesiais continuam específicos. Testar anos seculares, bissextos, fronteiras de ano, ciclos, precedências, transferências e diferenças entre festas fixas e móveis. Nunca aplicar um deslocamento fixo universal.

Inventariar algoritmos e fontes de cálculo por tradição. Arquivar no Dropbox versões imutáveis de código aprovado, documentação, licença, origem, commit, hashes, vetores de teste e resultados. O código continua versionado no GitHub. A geração deve consumir um pacote identificado e verificado; fontes externas são revistas antes de se tornarem código executável. Provar reprodução a partir do pacote arquivado antes de declarar este percurso operacional.

Gerar automaticamente apenas regras e vínculos aprovados. Servir Y e Y+1; preparar o ano seguinte antes da mudança de janela. Retirar projeções/caches antigos após validar substituição e recuperação, preservando pessoas, regras, fontes e histórico canónico.

## Dez idiomas

Selecionar dez idiomas pela estimativa de cristãos que os usam, com metodologia, ano, fonte, incerteza e regra contra dupla contagem de multilingues. Não usar população total do país, total mundial de falantes ou quantidade de traduções disponíveis como substituto. Registar a distinção entre língua principal e língua adicional; comparar fontes antes de fechar a seleção.

A lista técnica atual en/es/pt/fr/it/fil/ru/sw/de/pl é candidata, não um ranking demográfico validado. Publicar cada idioma apenas após cobertura e qualidade verificadas. Aplicar `data/language-authorities.json`, `data/linguistic-style-policy.json`, o contrato linguístico e as regras editoriais existentes. Preservar nomes oficiais, variantes, proveniência e terminologia específica da Igreja; nunca promover tradução automática a nome canónico sem validação.

## OSINT, arquivo e biografias

Percurso obrigatório: fontes prioritárias já registadas → aquisição retomável → arquivo Dropbox → extração de alegações com provas → resolução de identidade → ficha factual → narrativa original → revisão → tradução validada → publicação autorizada. Guardar conteúdo bruto quando permitido; nos restantes casos URL, metadados, referência, hash e excertos permitidos. Não reembalar prosa de terceiros como biografia própria.

Template mínimo: identificador; nome e aliases por idioma; reconhecimento por Igreja; datas e incerteza; lugares; resumo; vida em narrativa original; significado atribuído às fontes; patronatos documentados; observâncias por contexto; fontes por alegação; direitos; data de recolha; versão/hash do texto base; estado de revisão e de publicação por idioma. A ausência de informação permanece explícita. Mudanças no texto base invalidam traduções afetadas, sem apagar versões aprovadas recuperáveis.

## Pesquisa e celebrações em direto

Pesquisar por nome, alias, data, Igreja, profissão, lugar e outros patronatos comprovados. Patronato é uma relação contextual com fonte e validade; separar patronato oficial de devoção popular. Normalizar sinónimos multilingues sem fundir homónimos.

Incluir Fátima e outros santuários/canais oficiais, com Igreja, lugar, fuso, horário quando conhecido, URL oficial e última verificação. Distinguir emissão em direto, canal recorrente e gravação. Dar ligação externa útil; carregar vídeo apenas após ação do visitante, conforme política text-only. Verificar links e falhas sem afirmar que um canal está sempre em direto.

## ICS e manutenção

Oferecer download de ficheiro ICS e subscrição por URL HTTPS/webcal estável. O ficheiro descarregado é um snapshot e não se atualiza sozinho; a subscrição recebe alterações quando o cliente volta a consultar o feed. Explicar esta diferença na interface, sem prometer frequência de atualização controlada pelo cliente.

Feed, API e site partilham o conjunto aprovado e filtros de contexto/idioma. Preservar UID estável, revisões, cancelamentos, backlinks e janela Y/Y+1; testar rollover sem nova subscrição e alterações sem duplicados.

Após aquisição inicial, pesquisar alterações de calendários, biografias e patronatos mensalmente, em lotes distribuídos, com checks baratos, deltas, retoma, limites de custo e last-known-good. Saúde operacional e disponibilidade de diretos podem ter verificações leves mais frequentes. A retoma horária da execução de desenvolvimento não implica recolha horária de fontes. Alterações normativas e identidades ambíguas seguem revisão; falhas externas não removem dados aprovados.

## Aceitação e execução

O plano mestre no Dropbox e o issue #355 mantêm tarefas, dependências e evidência. Nenhum requisito fica concluído por estar documentado. Aceitar cobertura por contexto, reprodução de algoritmos arquivados, paridade site/API/ICS, qualidade dos dez idiomas selecionados, proveniência das biografias e ensaio da manutenção mensal. Distinguir preparado, validado, integrado e publicado. Respeitar gates existentes de produção e publicação. Nada é instalado ou guardado no Mac do utilizador.
