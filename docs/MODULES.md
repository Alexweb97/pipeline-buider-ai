# Guide de Développement de Modules

Ce guide explique comment créer des modules personnalisés pour la plateforme ETL/ELT Builder.

## Types de Modules

### 1. Extracteurs (Sources)
Modules qui extraient des données depuis diverses sources.

### 2. Transformateurs
Modules qui transforment, nettoient, ou enrichissent les données.

### 3. Chargeurs (Destinations)
Modules qui chargent les données vers des destinations.

## Structure d'un Module

Chaque module doit hériter de la classe de base `BaseModule` et implémenter les méthodes requises.

### Extracteur Exemple

```python
# backend/app/modules/extractors/my_extractor.py

from typing import Any, Dict
import pandas as pd
from app.modules.base import BaseModule, ModuleType

class MyExtractor(BaseModule):
    """
    Custom extractor module
    """

    module_type = ModuleType.EXTRACTOR
    module_name = "my_extractor"
    display_name = "My Custom Extractor"
    description = "Extract data from custom source"
    icon = "database"
    color = "#3B82F6"

    # Configuration schema (JSON Schema)
    config_schema = {
        "type": "object",
        "properties": {
            "connection_id": {
                "type": "string",
                "title": "Connection",
                "description": "Connection to use"
            },
            "query": {
                "type": "string",
                "title": "Query",
                "description": "Query to execute",
                "format": "textarea"
            },
            "limit": {
                "type": "integer",
                "title": "Limit",
                "description": "Max rows to extract",
                "default": 1000
            }
        },
        "required": ["connection_id", "query"]
    }

    def validate_config(self, config: Dict[str, Any]) -> bool:
        """
        Validate module configuration
        """
        # Add custom validation logic
        return True

    async def execute(self, context: Dict[str, Any]) -> pd.DataFrame:
        """
        Execute the extraction

        Args:
            context: Execution context with config, connections, etc.

        Returns:
            DataFrame with extracted data
        """
        config = context["config"]

        # Your extraction logic here
        # Example:
        # connection = await self.get_connection(config["connection_id"])
        # df = pd.read_sql(config["query"], connection)

        df = pd.DataFrame({
            "id": [1, 2, 3],
            "name": ["Alice", "Bob", "Charlie"]
        })

        # Apply limit
        if "limit" in config:
            df = df.head(config["limit"])

        self.log_info(f"Extracted {len(df)} rows")

        return df

    async def preview(self, context: Dict[str, Any]) -> pd.DataFrame:
        """
        Generate preview (max 100 rows)
        """
        config = context["config"]
        config["limit"] = 100
        return await self.execute(context)
```

### Transformateur Exemple

```python
# backend/app/modules/transformers/my_transformer.py

from typing import Any, Dict
import pandas as pd
from app.modules.base import BaseModule, ModuleType

class MyTransformer(BaseModule):
    """
    Custom transformer module
    """

    module_type = ModuleType.TRANSFORMER
    module_name = "my_transformer"
    display_name = "My Custom Transformer"
    description = "Transform data with custom logic"
    icon = "transform"
    color = "#10B981"

    config_schema = {
        "type": "object",
        "properties": {
            "operation": {
                "type": "string",
                "title": "Operation",
                "enum": ["uppercase", "lowercase", "capitalize"],
                "default": "uppercase"
            },
            "columns": {
                "type": "array",
                "title": "Columns",
                "description": "Columns to transform",
                "items": {"type": "string"}
            }
        },
        "required": ["operation", "columns"]
    }

    async def execute(self, context: Dict[str, Any]) -> pd.DataFrame:
        """
        Execute the transformation
        """
        config = context["config"]
        input_data = context["input_data"]  # DataFrame from previous node

        df = input_data.copy()

        operation = config["operation"]
        columns = config["columns"]

        # Apply transformation
        for col in columns:
            if col in df.columns:
                if operation == "uppercase":
                    df[col] = df[col].str.upper()
                elif operation == "lowercase":
                    df[col] = df[col].str.lower()
                elif operation == "capitalize":
                    df[col] = df[col].str.capitalize()

        self.log_info(f"Transformed {len(columns)} columns")

        return df
```

### Chargeur Exemple

```python
# backend/app/modules/loaders/my_loader.py

from typing import Any, Dict
import pandas as pd
from app.modules.base import BaseModule, ModuleType

class MyLoader(BaseModule):
    """
    Custom loader module
    """

    module_type = ModuleType.LOADER
    module_name = "my_loader"
    display_name = "My Custom Loader"
    description = "Load data to custom destination"
    icon = "upload"
    color = "#F59E0B"

    config_schema = {
        "type": "object",
        "properties": {
            "destination": {
                "type": "string",
                "title": "Destination",
                "description": "Where to load data"
            },
            "mode": {
                "type": "string",
                "title": "Mode",
                "enum": ["replace", "append", "update"],
                "default": "replace"
            },
            "batch_size": {
                "type": "integer",
                "title": "Batch Size",
                "description": "Rows per batch",
                "default": 1000
            }
        },
        "required": ["destination"]
    }

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the loading

        Returns:
            Metadata about the load operation
        """
        config = context["config"]
        input_data = context["input_data"]

        # Your loading logic here
        # Example: Save to database, S3, etc.

        rows_loaded = len(input_data)

        self.log_info(f"Loaded {rows_loaded} rows to {config['destination']}")

        return {
            "rows_loaded": rows_loaded,
            "destination": config["destination"],
            "mode": config["mode"]
        }
```

## Classe de Base

```python
# backend/app/modules/base.py

from abc import ABC, abstractmethod
from enum import Enum
from typing import Any, Dict, Optional
import pandas as pd
import structlog

logger = structlog.get_logger()


class ModuleType(Enum):
    EXTRACTOR = "extractor"
    TRANSFORMER = "transformer"
    LOADER = "loader"


class BaseModule(ABC):
    """
    Base class for all pipeline modules
    """

    # Module metadata (to be overridden by subclasses)
    module_type: ModuleType
    module_name: str
    display_name: str
    description: str
    icon: str = "default"
    color: str = "#6B7280"
    config_schema: Dict[str, Any] = {}

    def __init__(self, node_id: str, config: Dict[str, Any]):
        self.node_id = node_id
        self.config = config
        self.logger = logger.bind(
            module=self.module_name,
            node_id=node_id
        )

    def log_debug(self, message: str, **kwargs):
        """Log debug message"""
        self.logger.debug(message, **kwargs)

    def log_info(self, message: str, **kwargs):
        """Log info message"""
        self.logger.info(message, **kwargs)

    def log_warning(self, message: str, **kwargs):
        """Log warning message"""
        self.logger.warning(message, **kwargs)

    def log_error(self, message: str, **kwargs):
        """Log error message"""
        self.logger.error(message, **kwargs)

    def validate_config(self, config: Dict[str, Any]) -> bool:
        """
        Validate module configuration
        Override for custom validation
        """
        return True

    @abstractmethod
    async def execute(self, context: Dict[str, Any]) -> Any:
        """
        Execute the module
        Must be implemented by subclasses
        """
        pass

    async def preview(self, context: Dict[str, Any]) -> Any:
        """
        Generate data preview (optional)
        Default implementation calls execute
        """
        return await self.execute(context)

    @classmethod
    def get_metadata(cls) -> Dict[str, Any]:
        """Get module metadata"""
        return {
            "type": cls.module_type.value,
            "name": cls.module_name,
            "display_name": cls.display_name,
            "description": cls.description,
            "icon": cls.icon,
            "color": cls.color,
            "config_schema": cls.config_schema
        }
```

## Enregistrement d'un Module

### 1. Créer le fichier du module

Placez votre module dans le répertoire approprié:
- Extracteurs: `backend/app/modules/extractors/`
- Transformateurs: `backend/app/modules/transformers/`
- Chargeurs: `backend/app/modules/loaders/`

### 2. Enregistrer dans le registre

```python
# backend/app/modules/__init__.py

from app.modules.extractors.my_extractor import MyExtractor
from app.modules.transformers.my_transformer import MyTransformer
from app.modules.loaders.my_loader import MyLoader

# Module registry
MODULE_REGISTRY = {
    "extractor": {
        "my_extractor": MyExtractor,
        # ... autres extracteurs
    },
    "transformer": {
        "my_transformer": MyTransformer,
        # ... autres transformateurs
    },
    "loader": {
        "my_loader": MyLoader,
        # ... autres chargeurs
    }
}

def get_module(module_type: str, module_name: str):
    """Get module class by type and name"""
    return MODULE_REGISTRY.get(module_type, {}).get(module_name)

def list_modules():
    """List all available modules"""
    return {
        module_type: {
            name: cls.get_metadata()
            for name, cls in modules.items()
        }
        for module_type, modules in MODULE_REGISTRY.items()
    }
```

## Configuration UI

Les modules définissent leur configuration via JSON Schema. Le frontend génère automatiquement les formulaires.

### Exemples de champs supportés

```json
{
  "type": "object",
  "properties": {
    "text_field": {
      "type": "string",
      "title": "Text Input",
      "description": "A simple text field"
    },
    "number_field": {
      "type": "integer",
      "title": "Number Input",
      "minimum": 0,
      "maximum": 100
    },
    "select_field": {
      "type": "string",
      "title": "Dropdown",
      "enum": ["option1", "option2", "option3"]
    },
    "boolean_field": {
      "type": "boolean",
      "title": "Checkbox",
      "default": false
    },
    "textarea_field": {
      "type": "string",
      "title": "Text Area",
      "format": "textarea"
    },
    "code_field": {
      "type": "string",
      "title": "SQL Query",
      "format": "code",
      "language": "sql"
    },
    "array_field": {
      "type": "array",
      "title": "List of Items",
      "items": {"type": "string"}
    }
  }
}
```

## Tests

### Test Unitaire

```python
# backend/tests/unit/test_my_extractor.py

import pytest
import pandas as pd
from app.modules.extractors.my_extractor import MyExtractor

@pytest.mark.asyncio
async def test_my_extractor():
    """Test MyExtractor module"""

    # Arrange
    config = {
        "connection_id": "test-conn",
        "query": "SELECT * FROM test",
        "limit": 10
    }

    module = MyExtractor(node_id="test-node", config=config)

    context = {
        "config": config,
        "execution_id": "test-exec"
    }

    # Act
    result = await module.execute(context)

    # Assert
    assert isinstance(result, pd.DataFrame)
    assert len(result) <= 10
```

## Bonnes Pratiques

### 1. Validation
- Validez toutes les entrées
- Retournez des messages d'erreur clairs
- Vérifiez les connexions avant l'exécution

### 2. Logging
- Loggez les étapes importantes
- Utilisez les niveaux appropriés (debug, info, warning, error)
- Incluez des métriques (rows processed, duration, etc.)

### 3. Performance
- Traitez les données par batches pour gros volumes
- Utilisez des opérations vectorisées (Pandas)
- Libérez la mémoire après traitement

### 4. Gestion des Erreurs
- Capturez les exceptions spécifiques
- Nettoyez les ressources en cas d'erreur
- Retournez des erreurs informatives

### 5. Tests
- Testez avec différentes configurations
- Testez les cas limites
- Mockez les connexions externes

## Exemples de Modules Avancés

Consultez les modules existants pour des exemples plus avancés:
- [backend/app/modules/extractors/postgres_extractor.py](../backend/app/modules/extractors/postgres_extractor.py)
- [backend/app/modules/transformers/cleaner.py](../backend/app/modules/transformers/cleaner.py)
- [backend/app/modules/loaders/s3_loader.py](../backend/app/modules/loaders/s3_loader.py)

## Support

Pour toute question sur le développement de modules:
- Ouvrez une issue sur GitHub
- Consultez la documentation API: http://localhost:8000/docs
- Rejoignez notre Discord (lien dans README)
