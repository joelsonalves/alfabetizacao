## 1. Implementação — Navbar link "Ajuda" com feature flag

- [x] 1.1 Em `frontend/src/components/Layout/Layout.jsx`: adicionar `import { useFeatureFlags } from '../../hooks/useFeatureFlags'`
- [x] 1.2 Em `frontend/src/components/Layout/Layout.jsx`: consumir o hook com `const { isActive } = useFeatureFlags()` após `const location = useLocation()`
- [x] 1.3 Em `frontend/src/components/Layout/Layout.jsx`: substituir o link "❓ Ajuda" por `{isActive('feature_tutorial') && <Link to="/tutorial" ...>❓ Ajuda</Link>}`

## 2. Verificação

- [ ] 2.1 Com `feature_tutorial` ativa no admin, verificar que o link "❓ Ajuda" aparece na navbar e o tutorial carrega normalmente
- [ ] 2.2 Com `feature_tutorial` inativa no admin, verificar que o link "❓ Ajuda" some da navbar e `/tutorial` redireciona para `/dashboard`
- [ ] 2.3 Verificar que os demais links (Início, Perfil, Admin) permanecem visíveis independentemente do estado das flags
