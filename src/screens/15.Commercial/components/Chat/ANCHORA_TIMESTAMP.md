# AJUSTES DO CONTAINER DE HORARIO (Imagem e Video)

Este arquivo contém links diretos para ajustar a posicao do container de horario nos cards de imagem e video.

---

## CARD DE IMAGEM

### Container AZUL (Modo Transparente)
**Arquivo:** [08.06.ImageMessage.tsx:435](components/Messages/08.06.ImageMessage.tsx#L435)

```typescript
timeContainerBlue: {
  position: 'absolute',
  bottom: 8,       // SUBIR = aumentar | DESCER = diminuir (0 = base)
  right: 0,        // ESQUERDA = aumentar | DIREITA = diminuir
  paddingTop: 6,   // Espaco interno superior
  paddingBottom: 2,// Espaco interno inferior
  paddingLeft: 10, // Espaco interno esquerdo
  paddingRight: 5, // Espaco interno direito
}
```

### Container BRANCO (Modo Container)
**Arquivo:** [08.06.ImageMessage.tsx:390](components/Messages/08.06.ImageMessage.tsx#L390)

```typescript
timeContainer: {
  position: 'absolute',
  bottom: 8,       // SUBIR = aumentar | DESCER = diminuir (0 = base)
  right: 0,        // ESQUERDA = aumentar | DIREITA = diminuir
  paddingTop: 6,   // Espaco interno superior
  paddingBottom: 2,// Espaco interno inferior
  paddingLeft: 10, // Espaco interno esquerdo
  paddingRight: 5, // Espaco interno direito
}
```

---

## CARD DE VIDEO

### Container AZUL (Modo Transparente)
**Arquivo:** [08.11.VideoMessage.tsx:507](components/Messages/08.11.VideoMessage.tsx#L507)

```typescript
timeContainerBlue: {
  position: 'absolute',
  bottom: 8,       // SUBIR = aumentar | DESCER = diminuir (0 = base)
  right: 0,        // ESQUERDA = aumentar | DIREITA = diminuir
  paddingTop: 6,   // Espaco interno superior
  paddingBottom: 2,// Espaco interno inferior
  paddingLeft: 10, // Espaco interno esquerdo
  paddingRight: 5, // Espaco interno direito
}
```

### Container BRANCO (Modo Container)
**Arquivo:** [08.11.VideoMessage.tsx:474](components/Messages/08.11.VideoMessage.tsx#L474)

```typescript
timeContainer: {
  position: 'absolute',
  bottom: 8,       // SUBIR = aumentar | DESCER = diminuir (0 = base)
  right: 0,        // ESQUERDA = aumentar | DIREITA = diminuir
  paddingTop: 6,   // Espaco interno superior
  paddingBottom: 2,// Espaco interno inferior
  paddingLeft: 10, // Espaco interno esquerdo
  paddingRight: 5, // Espaco interno direito
}
```

---

## GUIA RAPIDO DE AJUSTES

| Propriedade | Efeito | Exemplo |
|-------------|--------|---------|
| `bottom` | Subir/Descer | `bottom: 8` = sobe 8px |
| `right` | Esquerda/Direita | `right: 10` = move 10px pra esquerda |
| `paddingTop` | Espaco interno superior | Aumenta altura do container |
| `paddingBottom` | Espaco interno inferior | Aumenta altura do container |
| `paddingLeft` | Espaco interno esquerdo | Aumenta largura do container |
| `paddingRight` | Espaco interno direito | Aumenta largura do container |
| `borderTopLeftRadius` | Arredondamento | `12` = canto arredondado |

---

## VALORES ATUAIS (Referencia)

- **bottom:** `8` (subiu 8px da base)
- **right:** `0` (encostado na direita)
- **paddingTop:** `6`
- **paddingBottom:** `2`
- **paddingLeft:** `10`
- **paddingRight:** `5`
