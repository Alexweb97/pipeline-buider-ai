"""
AI Service for Pipeline Generation
Uses OpenAI GPT to generate pipeline configurations from natural language
"""
import os
import json
from typing import Dict, Any, List
from openai import OpenAI
from datetime import datetime

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class AIService:
    """Service for AI-powered pipeline generation"""

    @staticmethod
    def generate_pipeline(user_prompt: str) -> Dict[str, Any]:
        """
        Generate a pipeline configuration from natural language description

        Args:
            user_prompt: Natural language description of the pipeline

        Returns:
            Dictionary containing pipeline configuration with nodes and edges
        """

        system_prompt = """You are an AI assistant specialized in generating ETL/ELT pipeline configurations for LogiData AI.

Your task is to convert natural language descriptions into pipeline configurations with nodes and edges.

Available Module Types:
1. EXTRACTORS (source data):
   - rest-api-extractor: Fetch data from REST APIs (config: url, method, auth_type, headers)
   - database-extractor: Extract from databases (config: connection_id, query, table)
   - csv-extractor: Read CSV files (config: file_path, delimiter, encoding, has_header)
   - json-extractor: Read JSON files (config: file_path, json_path)
   - excel-extractor: Read Excel files (config: file_path, sheet_name, has_header)

2. TRANSFORMERS (process data):
   - filter-transformer: Filter rows (config: conditions)
   - aggregate-transformer: Aggregate data (config: group_by, aggregations)
   - join-transformer: Join datasets (config: join_type, on, left_on, right_on)
   - python-transformer: Custom Python code (config: code, timeout)
   - clean-transformer: Clean data (config: remove_nulls, trim_whitespace, lowercase_columns)
   - deduplicate-transformer: Remove duplicates (config: subset, keep)

3. LOADERS (destination):
   - database-loader: Load to database (config: connection_id, table, if_exists)
   - csv-loader: Write to CSV (config: file_path, filename, delimiter, encoding)
   - json-loader: Write to JSON (config: file_path, filename, orient)
   - api-loader: Send to API (config: url, method, auth_type)

Response Format (JSON ONLY):
{
  "name": "Pipeline name",
  "description": "Pipeline description",
  "type": "etl|elt",
  "nodes": [
    {
      "id": "unique-node-id",
      "type": "extractor|transformer|loader",
      "position": {"x": number, "y": number},
      "data": {
        "label": "Node Label",
        "moduleType": "module-type-name",
        "config": {module-specific configuration}
      }
    }
  ],
  "edges": [
    {
      "id": "edge-id",
      "source": "source-node-id",
      "target": "target-node-id",
      "type": "default"
    }
  ]
}

Rules:
1. Use realistic node IDs (e.g., "rest-api-extractor-1234567890")
2. Position nodes left-to-right with 250px horizontal spacing, 100px vertical spacing
3. Start extractors at x=100, transformers at x=400, loaders at x=700
4. Always create edges connecting the nodes in logical order
5. Return ONLY valid JSON, no markdown, no explanations
6. Be specific with module configurations based on user intent"""

        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=2000,
            )

            # Extract and parse response
            content = response.choices[0].message.content.strip()

            # Remove markdown code blocks if present
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()

            # Parse JSON
            pipeline_config = json.loads(content)

            # Validate required fields
            if "nodes" not in pipeline_config or "edges" not in pipeline_config:
                raise ValueError("Invalid pipeline configuration: missing nodes or edges")

            return pipeline_config

        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse AI response as JSON: {str(e)}")
        except Exception as e:
            raise ValueError(f"Failed to generate pipeline: {str(e)}")

    @staticmethod
    def improve_pipeline(
        current_config: Dict[str, Any],
        improvement_request: str
    ) -> Dict[str, Any]:
        """
        Improve an existing pipeline configuration based on user feedback

        Args:
            current_config: Current pipeline configuration
            improvement_request: User's request for improvement

        Returns:
            Updated pipeline configuration
        """

        system_prompt = """You are an AI assistant specialized in improving ETL/ELT pipeline configurations.

Given a current pipeline configuration and an improvement request, modify the configuration accordingly.

Return ONLY the updated JSON configuration, no explanations."""

        user_prompt = f"""Current Pipeline:
{json.dumps(current_config, indent=2)}

Improvement Request:
{improvement_request}

Provide the improved pipeline configuration."""

        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=2000,
            )

            content = response.choices[0].message.content.strip()

            # Remove markdown code blocks if present
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()

            return json.loads(content)

        except Exception as e:
            raise ValueError(f"Failed to improve pipeline: {str(e)}")

    @staticmethod
    def explain_pipeline(config: Dict[str, Any]) -> str:
        """
        Generate a human-readable explanation of a pipeline

        Args:
            config: Pipeline configuration

        Returns:
            Natural language explanation
        """

        system_prompt = """You are an AI assistant that explains ETL/ELT pipelines in simple terms.

Given a pipeline configuration, provide a clear, concise explanation of what the pipeline does.

Format your response as:
1. Overview (1-2 sentences)
2. Steps (numbered list of what each node does)
3. Output (what the pipeline produces)"""

        user_prompt = f"""Explain this pipeline:
{json.dumps(config, indent=2)}"""

        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.5,
                max_tokens=500,
            )

            return response.choices[0].message.content.strip()

        except Exception as e:
            raise ValueError(f"Failed to explain pipeline: {str(e)}")
