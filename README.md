# Altice Weather Dashboard

## 📋 Descrição

O **Altice Weather Dashboard** é uma aplicação web moderna desenvolvida em Angular 18+ que permite a coleta e análise de dados meteorológicos correlacionados com a performance de rede de telecomunicações. A aplicação oferece um dashboard intuitivo para visualização de dados, análise de tendências e identificação de padrões que podem impactar as comunicações de rede.

## 🚀 Tecnologias

- **Angular 20+** com Standalone Components
- **TypeScript 5.0+** 
- **Tailwind CSS 3.4**
- **RxJS + Angular Signals**
- **Docker** para containerização
- **Jasmine/Karma** para testes

## ✨ Funcionalidades

### 📝 Coleta de Dados
- Formulário validado para inserção de dados meteorológicos
- Correlação entre condições climáticas e potência de rede (escala 1-5)
- Validação em tempo real com feedback visual

### 📊 Dashboard Analytics
- Vista geral com métricas agregadas por cidade
- Sistema de status automático (saudável/aviso/crítico)
- Estatísticas de temperatura, rede e contagem de registos

### 🔍 Análise Detalhada
- Vista aprofundada por cidade individual
- Análise temporal com dados mensais
- Identificação de registos críticos e anomalias

### ⚙️ Configurações
- Temas (claro/escuro/sistema)
- Configuração de idioma e timezone




### Principais Componentes
- **WeatherFormComponent**: Coleta de dados com validação
- **CityListComponent**: Dashboard com métricas agregadas  
- **CityOverviewComponent**: Análise detalhada por cidade
- **SettingsPanelComponent**: Configurações da aplicação

## 🔧 Instalação e Execução

### Pré-requisitos
- Node.js 18+
- npm 9+

### Instalação
```bash
# Clonar repositório
git clone <repository-url>
cd altice-weather-dashboard

# Instalar dependências
npm install
```

### Execução Local
```bash
# Desenvolvimento
npm start
# Aplicação disponível em http://localhost:4200

# Produção
npm run build
npm run serve:prod
```

### Docker
```bash
# Build da imagem
docker build -t altice-weather-dashboard .

# Executar container
docker run -p 80:80 altice-weather-dashboard
```

## 🧪 Testes

```bash
# Executar testes
npm run test

# Testes com coverage
npm run test:coverage

# Testes end-to-end
npm run e2e
```

## 🎯 Decisões Técnicas

### Adaptações para crudcrud.com
Devido às limitações da API externa (100 requests/sessão), foram implementadas estratégias específicas:

- **Cache Inteligente**: TTL configurável, LRU eviction e deduplicação de requests
- **Rate Limiting**: Contador proativo (95/100) com fallback para cache
- **Processamento Client-Side**: Agregação e análise estatística no frontend
- **Otimizações**: OnPush change detection, Angular Signals e memoização

### Padrões Utilizados
- Feature-based architecture para escalabilidade
- Reactive programming com RxJS e Signals
- Component composition com UI reutilizável
- Service-oriented architecture

## 📊 Performance

- **Bundle otimizado** com tree-shaking
- **Lazy loading** preparado
- **Change detection** otimizada
- **Memory management** com cleanup automático

## 🔮 Roadmap

- [ ] Integração WebSocket para dados em tempo real
- [ ] PWA com capacidades offline
- [ ] Análise preditiva com Machine Learning
- [ ] API própria para substituir crudcrud.com
- [ ] Sistema de notificações push
- [ ] Multi-tenancy para empresas

## 📄 Licença

Este projeto está sob licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📞 Contacto

Para questões sobre o projeto, contacte através de [email] ou abra uma issue no repositório.

---

**Desenvolvido com ❤️ usando Angular 18+**