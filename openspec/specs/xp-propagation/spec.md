# xp-propagation Specification

## Purpose
TBD - created by archiving change fix-xp-navbar-update. Update Purpose after archive.
## Requirements
### Requirement: XP update after lesson completion

O `user.xp` no `AuthContext` SHALL ser atualizado com o valor retornado pelo backend sempre que uma lição for concluída com sucesso, independentemente de o jogador ter subido de nível ou não.

#### Scenario: Lesson completed with XP gain but no level up

- **WHEN** o jogador conclui uma lição e o backend retorna `{ xp, level }` onde `level` é igual ao nível anterior
- **THEN** o `user.xp` no `AuthContext` SHALL ser atualizado para o novo valor de XP
- **AND** o nível do usuário (`user.level`) SHALL permanecer inalterado

#### Scenario: Lesson completed with XP gain and level up

- **WHEN** o jogador conclui uma lição e o backend retorna `{ xp, level }` onde `level` é maior que o nível anterior
- **THEN** o `user.xp` no `AuthContext` SHALL ser atualizado para o novo valor de XP
- **AND** o `user.level` no `AuthContext` SHALL ser atualizado para o novo nível
- **AND** o modal de `setLevelUp` SHALL ser exibido para notificar o jogador

#### Scenario: Page refresh after lesson completion

- **WHEN** o jogador recarrega a página após concluir uma lição
- **THEN** o `api.auth.me()` SHALL carregar o XP e nível corretos do backend
- **AND** o navbar SHALL exibir o XP atualizado

