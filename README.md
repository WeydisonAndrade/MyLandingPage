# Portfólio — Weydison Andrade

Landing page pessoal em **HTML, CSS e JavaScript** (sem framework), com identidade visual escura, animação de fundo em canvas e layout responsivo. O projeto apresenta trajetória profissional, competências em **desenvolvimento** e **engenharia de produção**, projetos em destaque e uma página separada de **artigos**.

## Destaques

- **Hero** com foto e apresentação
- **Sobre mim** — narrativa de transição Produção → Software, credenciais e call-to-action
- **Conhecimentos** — dashboard em duas colunas (Tech Stack & Processos / Gestão industrial)
- **Contato** com link para WhatsApp
- **Projetos** — carrossel horizontal com cards, imagens de fundo e *tech badges*
- **Artigos** — [`html/artigos.html`](html/artigos.html) com grid de cards (metadados, tempo de leitura, CTA)
- **Cabeçalho** fixo com menu mobile e **rodapé** com redes sociais (LinkedIn, Instagram, GitHub)
- Tipografia **Inter** + **JetBrains Mono**; ícones **Font Awesome** onde aplicável
- Acessibilidade básica: `aria-label`, foco visível, `prefers-reduced-motion` em trechos relevantes

## Stack

| Área        | Uso                          |
|------------|-------------------------------|
| HTML5      | Estrutura semântica           |
| CSS3       | Layout, grid, variáveis, tema |
| JavaScript | Partículas (canvas), carrossel de projetos, menu mobile, ano no rodapé |

## Estrutura do repositório

```
myLandingPage/
├── html/
│   ├── index.html      # Página principal
│   ├── artigos.html    # Lista de artigos
│   ├── css/
│   │   └── style.css   # Estilos globais
│   └── js/
│       ├── particles.js
│       └── projects-carousel.js
├── MinhaImagem/        # Imagens (ex.: foto, backgrounds dos cards)
├── vercel.json         # Deploy na Vercel (rewrite para /html/)
└── README.md
```

## Como visualizar localmente

1. Clone o repositório.
2. Abra `html/index.html` no navegador **ou** sirva a pasta com um servidor estático (recomendado para testar caminhos relativos):

```bash
# Exemplo com npx (Node.js)
npx serve html
```

Ou abra diretamente o arquivo `index.html` a partir da pasta `html/`.

## Deploy (Vercel)

O arquivo [`vercel.json`](vercel.json) redireciona as rotas para a pasta `html/`, permitindo URLs limpas em produção.

## Autor

**Weydison Andrade** — Engenheiro de Software em formação; experiência em chão de fábrica, melhoria contínua e transição para TI (Web, Dados, QA).

---

*Repositório destinado a servir como portfólio e vitrine de projetos e conteúdos.*
