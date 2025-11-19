"""
Custom ETL Operator for Airflow
Executes extractor, transformer, or loader modules
"""
import logging
from typing import Any

import pandas as pd
from airflow.models import BaseOperator
from airflow.utils.decorators import apply_defaults
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


class ETLOperator(BaseOperator):
    """
    Custom Airflow operator for executing ETL modules

    This operator dynamically loads and executes modules (extractors, transformers, loaders)
    based on the pipeline configuration.

    Args:
        node_id: Unique identifier for this node
        node_type: Type of module (extractor, transformer, loader)
        module_class: Full Python class path (e.g., 'app.modules.extractors.csv.CSVExtractor')
        module_config: Configuration dict for the module
        database_url: Database connection URL
        xcom_pull_keys: List of XCom keys to pull data from (for transformers/loaders)
    """

    template_fields = ("module_config", "node_id")
    ui_color = "#4CAF50"  # Green for extractors
    ui_fgcolor = "#FFFFFF"

    @apply_defaults
    def __init__(
        self,
        node_id: str,
        node_type: str,
        module_class: str,
        module_config: dict[str, Any],
        database_url: str,
        xcom_pull_keys: list[str] = None,
        *args,
        **kwargs,
    ):
        super().__init__(*args, **kwargs)
        self.node_id = node_id
        self.node_type = node_type
        self.module_class = module_class
        self.module_config = module_config
        self.database_url = database_url
        self.xcom_pull_keys = xcom_pull_keys or []

        # Set UI color based on node type
        if node_type == "extractor":
            self.ui_color = "#4CAF50"  # Green
        elif node_type == "transformer":
            self.ui_color = "#2196F3"  # Blue
        elif node_type == "loader":
            self.ui_color = "#FF9800"  # Orange

    def execute(self, context: dict[str, Any]) -> Any:
        """
        Execute the ETL module

        Args:
            context: Airflow task context

        Returns:
            Result from the module execution (usually a DataFrame or dict)
        """
        logger.info(f"Executing {self.node_type} node: {self.node_id}")
        logger.info(f"Module class: {self.module_class}")

        try:
            # Create database session
            engine = create_engine(self.database_url)
            db = Session(engine)

            # Dynamically import the module class
            module_instance = self._load_module_class(db)

            # For transformers/loaders, pull data from previous tasks
            input_data = None
            if self.xcom_pull_keys and self.node_type in ["transformer", "loader"]:
                input_data = self._pull_input_data(context)

            # Execute the module
            if self.node_type == "extractor":
                result = module_instance.execute()
            elif self.node_type == "transformer":
                result = module_instance.execute(input_data)
            elif self.node_type == "loader":
                result = module_instance.execute(input_data)
                # Loaders typically return success status, not data
                return result
            else:
                raise ValueError(f"Unknown node type: {self.node_type}")

            # Convert DataFrame to dict for XCom serialization
            if isinstance(result, pd.DataFrame):
                logger.info(f"Result DataFrame shape: {result.shape}")
                # Store as dict with records
                result_dict = {
                    "data": result.to_dict(orient="records"),
                    "columns": result.columns.tolist(),
                    "shape": result.shape,
                }
                return result_dict
            else:
                return result

        except Exception as e:
            logger.error(f"Error executing {self.node_type} node {self.node_id}: {str(e)}")
            raise

        finally:
            if 'db' in locals():
                db.close()

    def _load_module_class(self, db: Session):
        """
        Dynamically load and instantiate the module class

        Args:
            db: Database session

        Returns:
            Instance of the module class
        """
        try:
            # Parse module path (e.g., 'app.modules.extractors.csv.CSVExtractor')
            module_path, class_name = self.module_class.rsplit(".", 1)

            # Import the module
            import importlib
            module = importlib.import_module(module_path)

            # Get the class
            module_class = getattr(module, class_name)

            # Instantiate with config and db
            return module_class(self.module_config, db)

        except Exception as e:
            logger.error(f"Failed to load module class {self.module_class}: {str(e)}")
            raise

    def _pull_input_data(self, context: dict[str, Any]) -> pd.DataFrame:
        """
        Pull input data from previous tasks via XCom

        Args:
            context: Airflow task context

        Returns:
            DataFrame with input data
        """
        try:
            # Get task instance
            ti = context["ti"]

            # Pull data from all upstream tasks
            dataframes = []
            for xcom_key in self.xcom_pull_keys:
                logger.info(f"Pulling XCom data from key: {xcom_key}")
                data_dict = ti.xcom_pull(task_ids=xcom_key)

                if data_dict and isinstance(data_dict, dict) and "data" in data_dict:
                    # Reconstruct DataFrame from dict
                    df = pd.DataFrame(data_dict["data"])
                    dataframes.append(df)
                    logger.info(f"Pulled DataFrame with shape: {df.shape}")

            # If multiple dataframes, concatenate them
            if len(dataframes) == 0:
                logger.warning("No input data pulled from XCom")
                return pd.DataFrame()
            elif len(dataframes) == 1:
                return dataframes[0]
            else:
                # Concatenate multiple dataframes
                return pd.concat(dataframes, ignore_index=True)

        except Exception as e:
            logger.error(f"Error pulling input data: {str(e)}")
            raise
