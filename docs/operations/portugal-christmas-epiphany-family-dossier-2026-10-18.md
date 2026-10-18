# Portugal 2026 — dossiê da família Natal/Epifania

**Estado:** preparação da regra temporal; sem promoção canónica ou publicação  
**Data:** 18 de outubro de 2026

## Evidência de referência

O pacote de calendário português mais recente arquivado foi produzido pelo workflow SNL #37, execução GitHub Actions `39115694657`, no commit `71f98676595e2a3e7a1527effa3dafe718b6e330`.

- Fonte: Secretariado Nacional de Liturgia, [agenda oficial](https://www.liturgia.pt/agenda/agenda.ics).
- SHA-256 do ICS: `19d9f850f554d5bbdd1924be970877cb15bdc8dd35b61be9bf6abbedeff5be90`.
- Artefacto GitHub: `12132202141`, SHA-256 `0989e98543f13d25cb534756ac5606a2429711adfb6bdac73d07a2973b1b52ed`.
- Cópia e recibo Dropbox: `archive/calendar/portugal-snl/v1/slots/05/`; SHA-256 do pacote arquivado: `19a03257c81a701c00292c00316fff0bd42f06b1513aa7340aee2868dc8ba514`.
- A prévia contém 389 ocorrências em 365 dias para 2026. O pacote preserva ainda 397 eventos de 2027 fora da prévia. `productionWriteAllowed` permanece `false`.

Os IDs e hashes abaixo foram lidos do `effective-preview.json` desse artefacto; os nomes litúrgicos são factos estruturados da fonte, não texto editorial reutilizado.

## Sequência fonte entre a transferência e o Batismo

| Data | ID canónico anual da fonte | Classe/rank da fonte | ID da ocorrência SNL | Hash SHA-256 do registo | Situação de reconciliação |
|---|---|---|---|---|---|
| 2026-01-04 | `rc:Epiphany` | solenidade | `snl-pt-2026-01-04-1225bff32e5ee2c8827ee794` | `00d06256e9ce8669f021f3d068eb2053d4298df8d13c12de6bde63b4714def23` | Destino da transferência aprovada `pt-2026-epiphany-transfer`; origem universal 2026-01-06. |
| 2026-01-05 | `rc:ChristmasWeekdayJan5` | dia de semana | `snl-pt-2026-01-05-6b518156d4feae2ef222dc94` | `8b75db2aa7b3a84dfcd34df112f909b66966273957640f552296b11adf8b9df6` | Ligação geral herdada; candidato de dia de semana depois da Epifania local. |
| 2026-01-06 | `rc-pt:TuesdayAfterEpiphany` | rank nulo na fonte | `snl-pt-2026-01-06-f745cb764c9415c74b832e35` | `0c81a5e464a6cfb98ae4e692a4b957df6f252a171918956c8cb9efd017a0205e` | Substituição na origem prevista pela mesma decisão aprovada; identidade própria portuguesa. |
| 2026-01-07 | `rc:StRayPenyafort` | memória facultativa | `snl-pt-2026-01-07-aa0e0be0ee494f93f9744adf` | `b24bbcefabeaec256d3f26619b223f859a08853b55bc9c51c9a7dbc9016f2078` | Ocorrência de santo já ligada no shadow fixo; não contar como nova ocorrência de dia de semana. |
| 2026-01-08 | `rc:DayAfterEpiphanyJan8` | dia de semana | `snl-pt-2026-01-08-fc47b2946d29fa21d55037e2` | `3de2c3292bf2f212610e5edd961adee1f524b412a79bdde8f302f50238621b65` | Ligação geral herdada; candidato de dia de semana depois da Epifania local. |
| 2026-01-09 | `rc:DayAfterEpiphanyJan9` | dia de semana | `snl-pt-2026-01-09-db23378c81ba4d5d158833d0` | `af261e303bcd72aae905b4c3035dc7de16675af530072a21ffa7a2f414d75ae6` | Ligação geral herdada; candidato de dia de semana depois da Epifania local. |
| 2026-01-10 | `rc:DayAfterEpiphanyJan10` | memória facultativa | `snl-pt-2026-01-10-e63eaa901525edd1fec58393` | `e8bbdffdb2ed001af38de7792a57e4eedd331cf64e4abc8e158c1edff1d620ed` | A fonte apresenta o Beato Gonçalo de Amarante; requer tratar precedência/identidade como ocorrência própria. |
| 2026-01-11 | `rc:BaptismLord` | festa | `snl-pt-2026-01-11-60132f0bc8b9c324f0eed5bb` | `71c3fe1a119a1cc937533a2e9d32f462543822cf2aabff15f03d6c559ae56588` | Limite litúrgico da sequência em 2026; não incluir como dia de semana. |

A aprovação explícita do projeto para 2026 consta em `data/releases/roman-catholic-pt-2026.overlay-approval.json` e inclui `pt-2026-epiphany-transfer`: `2026-01-06` → `2026-01-04`, com a substituição portuguesa `rc-pt:TuesdayAfterEpiphany` na origem. A aprovação autoriza essa decisão litúrgica em 2026; não autoriza escrita em D1, promoção pública, nem inferência automática para outros anos.

## Alteração necessária antes da regra

O catálogo atual de `TemporalRuleFamily` só aceita âncoras `gregorian-easter`, `advent-start` e `ordinary-time-second-sunday`, com candidatos definidos por semana e dia da semana. A sequência portuguesa depende da Epifania efetiva da jurisdição e termina na data efetiva do Batismo. Uma regra fixa de janeiro ou uma família com âncora universal a 6 de janeiro daria datas erradas quando a Epifania é transferida.

O próximo lote de código deve, nesta ordem:

1. Expor ao motor temporal as datas efetivas de Epifania e Batismo para `roman-portugal`, usando a política de jurisdição já existente.
2. Definir uma família de dias entre essas duas festas, com identidade canónica independente do rótulo/ID legado e sem incluir os limites.
3. Gerar candidatos e suppressions para anos em que a Epifania portuguesa cai em domingos diferentes, incluindo os limites de 7/8 de janeiro e o Batismo transferido para segunda-feira.
4. Vincular apenas as linhas 2026 exatas acima, reutilizando a decisão aprovada no destino e na origem; manter as memórias facultativas como resultados de precedência, sem dupla contagem.
5. Acrescentar vetores plurianuais, hashes, testes de cobertura e recibo shadow. Manter `mutationAllowed: false`, cutover `false`, sem deploy e sem escrita D1.

Não se deve alargar a família enquanto os testes não provarem esses casos de fronteira. As 2026 linhas de 5, 8 e 9 de janeiro são candidatos fonte claros, mas a regra ainda não está pronta para generalização anual. As linhas de 6, 7 e 10 de janeiro têm tratamento de transferência, identidade local ou precedência que deve ficar explícito nos vetores e na equivalência.

## Critério de conclusão deste lote

- A regra gera datas corretas para a política portuguesa em múltiplos anos e respeita o limite do Batismo.
- Os casos de transferência e substituição correspondem à decisão e às linhas SNL aprovadas, por ID e hash.
- Cada candidato termina como ocorrência ligada ou suppression fundamentada; nenhum nome, data civil ou tradução cria identidade por aproximação.
- Os gates de calendário, cobertura canónica e AdSense passam; validação não escreve D1 nem publica conteúdo.
- O novo pacote, hashes, resultado dos testes e recibo são arquivados no Dropbox antes de começar a família seguinte.

