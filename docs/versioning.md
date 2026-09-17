# Versionamento e Git

## Versões do produto

O projeto usa Semantic Versioning: `MAJOR.MINOR.PATCH`.

- **MAJOR**: quebra intencional de compatibilidade para usuários, dados ou
  contrato público.
- **MINOR**: capacidade nova compatível.
- **PATCH**: correção compatível, segurança ou ajuste sem nova capacidade.

A versão de lançamento deve ser coerente entre `package.json`,
`src-tauri/Cargo.toml` e `src-tauri/tauri.conf.json`. Uma alteração de versão
atualiza também `CHANGELOG.md` e resulta em tag anotada `vX.Y.Z`.

Não incremente versão apenas por um commit isolado de desenvolvimento.

## Fluxo de branches

O branch principal é `main`. Para trabalho paralelo, use:

```text
feature/descricao-curta
fix/descricao-curta
docs/descricao-curta
release/vX.Y.Z
hotfix/descricao-curta
```

É aceitável trabalhar diretamente em `main` em um incremento individual e
pequeno. Não introduza outro fluxo sem acordo explícito.

## Commits

Adote Conventional Commits. Escopo é opcional, mas útil quando esclarece a
camada afetada:

```text
feat(items): adiciona edição de observação
fix(db): preserva UUID durante migração
docs(agent): adiciona procedimento de handoff
```

Um commit deve conter mudança coerente e sua documentação ou teste necessário.

## Releases

1. Confirme que o workboard não possui trabalho conflituoso.
2. Execute e registre as verificações aplicáveis.
3. Atualize as três fontes de versão e mova itens do `Unreleased` no changelog.
4. Faça o commit de release e a tag anotada `vX.Y.Z`.
5. Gere artefatos Tauri a partir desse commit, quando aplicável.

Mudança incompatível de dados requer migração segura e documentação de
recuperação; versão nova não torna migração destrutiva aceitável.
