# Rede Raízes do Nordeste - Engenharia de Software e Qualidade (QA)

Projeto multidisciplinar desenvolvido para a disciplina de Projeto de Engenharia de Software (UNINTER), focado no planejamento, modelagem arquitetural e automação de testes para a rede de franquias de alimentação "Raízes do Nordeste".

## 1. Visão Geral do Projeto

A rede Raízes do Nordeste opera com atendimento multicanal (Aplicativo Mobile, Totens de Autoatendimento, Balcão Presencial e Retirada Pick-up), demandando alta confiabilidade operacional, consistência de estoque em tempo real, tolerância a falhas em pagamentos externos e estrita conformidade com a Lei Geral de Proteção de Dados (LGPD).

Este repositório reúne tanto a documentação técnica formal de engenharia de software e qualidade quanto a suíte executável de testes automatizados construída em TypeScript com Playwright.

## 2. Estrutura do Repositório

```
├── docs/                                  # Documentação formal de engenharia e QA
│   ├── requisitos.md                      # Requisitos funcionais, não funcionais e matriz de rastreabilidade
│   ├── arquitetura-e-casos-de-uso.md      # Arquitetura em camadas e especificação de casos de uso (UC-01 e UC-02)
│   ├── plano-de-qualidade-e-testes.md     # Plano de QA, governança e especificação dos 10 cenários de teste
│   ├── metricas-e-governanca-lgpd.md      # Planilha de métricas (KPIs/SLOs) e política de privacidade LGPD
│   ├── declaracao-uso-ia.md               # Declaração metodológica conforme diretrizes da UNINTER
│   └── evidencias/                        # Diagrama UML e capturas visuais da suíte automatizada
│       ├── diagrama-casos-de-uso.png      # Diagrama UML de Casos de Uso renderizado em alta resolução
│       ├── evidencia-totem-sucesso.png    # Conclusão de pedido no Totem em 3 toques com senha (CT-01)
│       ├── evidencia-lgpd-recusa.png      # Bloqueio de cadastro sem consentimento explícito (CT-08)
│       ├── evidencia-lgpd-sucesso.png     # Cadastro aceito com opt-in voluntário dos termos (CT-08)
│       └── evidencia-lgpd-anonimo.png     # Conclusão de pedido anônimo sem exigência de CPF (CT-08)
├── src/                                   # Camada de aplicação e simulação
│   ├── data/
│   │   └── cardapio.ts                    # Dados do cardápio regional e unidades da rede
│   └── mock-server.ts                     # Servidor HTTP desacoplado com regras de negócio e mocks
├── tests/                                 # Suíte de testes automatizados com Playwright
│   ├── api/
│   │   ├── catalogo.spec.ts               # Testes de filtragem por unidade e cozinha reduzida (CT-05)
│   │   ├── estoque.spec.ts                # Concorrência atômica e expiração TTL (CT-04 e CT-06)
│   │   ├── pagamento.spec.ts              # Pix, recusa de saldo e timeout de 10s (CT-01, CT-02 e CT-03)
│   │   └── rbac.spec.ts                   # Segurança de cancelamento por perfil gerencial (CT-09)
│   └── e2e/
│       ├── totem-checkout.spec.ts         # Jornada touch vertical no totem (1080x1920)
│       └── app-fidelidade-lgpd.spec.ts    # Viewport mobile, opt-in LGPD e modo anônimo
├── playwright.config.ts                   # Configuração de execução e orquestração do webServer
├── tsconfig.json                          # Configurações do compilador TypeScript
└── package.json                           # Dependências e scripts de execução
```

## 3. Tecnologias Utilizadas

- Linguagem: TypeScript (Node.js v24+)
- Framework de Testes: Playwright Test (@playwright/test)
- Executor de Mocks: TSX (TypeScript Execute)
- Protocolo: HTTP REST e HTML5 responsivo
- Padrões Arquiteturais: Clean Architecture, Desacoplamento via Interfaces, Princípio da Minimização de Dados (LGPD)

## 4. Instruções de Instalação e Execução

### 4.1. Pré-requisitos
- Node.js instalado (versão 20 ou superior).
- Git configurado.

### 4.2. Instalação das Dependências
No terminal, na raiz do repositório:
```powershell
npm install
```

### 4.3. Instalação dos Navegadores do Playwright
```powershell
npx playwright install chromium
```

### 4.4. Execução dos Testes Automatizados
O comando a seguir inicializa automaticamente o servidor mock local em segundo plano na porta 3333, executa todos os 12 testes de API e E2E, e encerra o serviço ao final:
```powershell
npm test
```

### 4.5. Visualização do Relatório Oficial em HTML
Após a execução dos testes, abra o relatório visual interativo gerado pelo Playwright:
```powershell
npm run test:report
```

## 5. Relação entre Cenários do QA Plan e Testes Automatizados

| Cenário de Teste | Descrição da Validação | Tipo | Arquivo de Teste Automatizado | Status |
| :--- | :--- | :--- | :--- | :--- |
| CT-01 | Pedido no Totem com pagamento Pix e emissão de senha | E2E / API | `tests/api/pagamento.spec.ts` e `tests/e2e/totem-checkout.spec.ts` | Aprovado |
| CT-02 | Recusa de pagamento por saldo insuficiente (HTTP 402) | API | `tests/api/pagamento.spec.ts` | Aprovado |
| CT-03 | Tolerância a timeout de 10s no gateway bancário (HTTP 504) | API | `tests/api/pagamento.spec.ts` | Aprovado |
| CT-04 | Prevenção de concorrência atômica no último item de estoque | API | `tests/api/estoque.spec.ts` | Aprovado |
| CT-05 | Ocultação preventiva de pratos pesados em cozinha reduzida | API | `tests/api/catalogo.spec.ts` | Aprovado |
| CT-06 | Liberação automática de estoque por expiração de reserva (TTL) | API | `tests/api/estoque.spec.ts` | Aprovado |
| CT-07 | Resiliência e reconexão offline do totem após queda de link | Manual / Resiliência | Documentado no QA Plan (`docs/plano-de-qualidade-e-testes.md`) | Planejado |
| CT-08 | Exigência de opt-in LGPD e permissão para compra anônima | E2E | `tests/e2e/app-fidelidade-lgpd.spec.ts` | Aprovado |
| CT-09 | Bloqueio de cancelamento sem perfil gerencial (HTTP 403) | API | `tests/api/rbac.spec.ts` | Aprovado |
| CT-10 | Carga concorrente de 50 pedidos/minuto no almoço de pico | Carga / Performance | Documentado no QA Plan (`docs/plano-de-qualidade-e-testes.md`) | Planejado |
