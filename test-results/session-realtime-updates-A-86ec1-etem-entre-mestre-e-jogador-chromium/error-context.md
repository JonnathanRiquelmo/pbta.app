# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e6]: PBTA System
        - generic [ref=e7]:
          - generic [ref=e8]: Mestre (Mestre)
          - button "Sair" [ref=e9] [cursor=pointer]
    - main [ref=e10]:
      - generic [ref=e11]:
        - heading "Nova Campanha" [level=2] [ref=e12]
        - generic [ref=e13]:
          - generic [ref=e14]:
            - text: Nome da Campanha
            - 'textbox "Ex: A Sombra do Dragão" [ref=e15]': Campanha Realtime
          - generic [ref=e16]:
            - text: Plot Inicial
            - textbox "Descreva o cenário inicial..." [ref=e17]
          - button "Criar Campanha" [active] [ref=e18] [cursor=pointer]
  - paragraph [ref=e19]: Running in emulator mode. Do not use with production credentials.
```