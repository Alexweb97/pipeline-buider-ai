/**
 * Code Templates & Snippets Library
 * Pre-built code snippets for common transformations
 */

export interface CodeSnippet {
  id: string;
  name: string;
  category: string;
  description: string;
  language: 'python' | 'sql';
  code: string;
  tags: string[];
}

export const PYTHON_SNIPPETS: CodeSnippet[] = [
  // Date & Time
  {
    id: 'py-parse-date',
    name: 'Parse Date Column',
    category: 'datetime',
    description: 'Convert string column to datetime',
    language: 'python',
    code: `def transform(df: pd.DataFrame) -> pd.DataFrame:
    # Parse date column from string
    df['date_column'] = pd.to_datetime(df['date_column'], format='%Y-%m-%d')
    return df`,
    tags: ['date', 'parsing', 'datetime'],
  },
  {
    id: 'py-extract-date-parts',
    name: 'Extract Date Parts',
    category: 'datetime',
    description: 'Extract year, month, day from datetime',
    language: 'python',
    code: `def transform(df: pd.DataFrame) -> pd.DataFrame:
    # Extract date components
    df['year'] = df['date_column'].dt.year
    df['month'] = df['date_column'].dt.month
    df['day'] = df['date_column'].dt.day
    df['day_of_week'] = df['date_column'].dt.dayofweek
    return df`,
    tags: ['date', 'extraction', 'datetime'],
  },

  // Text Processing
  {
    id: 'py-text-cleaning',
    name: 'Clean Text',
    category: 'text',
    description: 'Normalize and clean text data',
    language: 'python',
    code: `def transform(df: pd.DataFrame) -> pd.DataFrame:
    # Clean and normalize text
    df['text_column'] = (
        df['text_column']
        .str.lower()              # Lowercase
        .str.strip()              # Remove whitespace
        .str.replace(r'\\s+', ' ', regex=True)  # Normalize spaces
    )
    return df`,
    tags: ['text', 'cleaning', 'normalization'],
  },
  {
    id: 'py-extract-email',
    name: 'Extract Email Domain',
    category: 'text',
    description: 'Extract domain from email addresses',
    language: 'python',
    code: `def transform(df: pd.DataFrame) -> pd.DataFrame:
    # Extract email domain
    df['email_domain'] = df['email'].str.extract(r'@([\\w.]+)', expand=False)
    return df`,
    tags: ['text', 'email', 'regex', 'extraction'],
  },

  // Missing Data
  {
    id: 'py-fill-nulls',
    name: 'Fill Missing Values',
    category: 'cleaning',
    description: 'Fill nulls with various strategies',
    language: 'python',
    code: `def transform(df: pd.DataFrame) -> pd.DataFrame:
    # Fill numeric nulls with mean
    numeric_cols = df.select_dtypes(include=['number']).columns
    df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].mean())

    # Fill string nulls with 'Unknown'
    string_cols = df.select_dtypes(include=['object']).columns
    df[string_cols] = df[string_cols].fillna('Unknown')

    return df`,
    tags: ['null', 'missing', 'imputation'],
  },
  {
    id: 'py-drop-nulls',
    name: 'Drop Rows with Nulls',
    category: 'cleaning',
    description: 'Remove rows with missing values',
    language: 'python',
    code: `def transform(df: pd.DataFrame) -> pd.DataFrame:
    # Drop rows with any null values
    df = df.dropna()

    # Or drop rows where specific columns have nulls
    # df = df.dropna(subset=['column1', 'column2'])

    return df`,
    tags: ['null', 'missing', 'cleaning'],
  },

  // Calculations
  {
    id: 'py-calculated-column',
    name: 'Add Calculated Column',
    category: 'numeric',
    description: 'Create new column from calculations',
    language: 'python',
    code: `def transform(df: pd.DataFrame) -> pd.DataFrame:
    # Simple calculation
    df['total'] = df['price'] * df['quantity']

    # With conditional logic
    df['discount'] = df['total'].apply(lambda x: x * 0.1 if x > 100 else 0)

    return df`,
    tags: ['calculation', 'numeric', 'formula'],
  },
  {
    id: 'py-binning',
    name: 'Bin Numeric Values',
    category: 'numeric',
    description: 'Create categories from numeric ranges',
    language: 'python',
    code: `def transform(df: pd.DataFrame) -> pd.DataFrame:
    # Create age groups
    df['age_group'] = pd.cut(
        df['age'],
        bins=[0, 18, 35, 50, 100],
        labels=['Youth', 'Young Adult', 'Middle Age', 'Senior']
    )
    return df`,
    tags: ['binning', 'categorization', 'numeric'],
  },

  // Aggregation
  {
    id: 'py-groupby',
    name: 'Group and Aggregate',
    category: 'aggregation',
    description: 'Group by and calculate aggregates',
    language: 'python',
    code: `def transform(df: pd.DataFrame) -> pd.DataFrame:
    # Group by category and aggregate
    df = df.groupby('category').agg({
        'sales': 'sum',
        'quantity': 'mean',
        'customer_id': 'count'
    }).reset_index()

    # Rename columns
    df.columns = ['category', 'total_sales', 'avg_quantity', 'num_orders']

    return df`,
    tags: ['groupby', 'aggregation', 'summary'],
  },

  // Type Conversion
  {
    id: 'py-convert-types',
    name: 'Convert Data Types',
    category: 'conversion',
    description: 'Convert column data types',
    language: 'python',
    code: `def transform(df: pd.DataFrame) -> pd.DataFrame:
    # Convert to numeric (coerce errors to NaN)
    df['number_column'] = pd.to_numeric(df['number_column'], errors='coerce')

    # Convert to string
    df['string_column'] = df['string_column'].astype(str)

    # Convert to category (saves memory)
    df['category_column'] = df['category_column'].astype('category')

    return df`,
    tags: ['type', 'conversion', 'casting'],
  },
];

export const SQL_SNIPPETS: CodeSnippet[] = [
  // Aggregation
  {
    id: 'sql-group-aggregate',
    name: 'Group and Aggregate',
    category: 'aggregation',
    description: 'Group by with multiple aggregations',
    language: 'sql',
    code: `SELECT
    category,
    COUNT(*) AS num_items,
    SUM(sales) AS total_sales,
    AVG(price) AS avg_price,
    MAX(quantity) AS max_quantity
FROM input
GROUP BY category
ORDER BY total_sales DESC`,
    tags: ['groupby', 'aggregation', 'sum', 'avg'],
  },

  // Window Functions
  {
    id: 'sql-row-number',
    name: 'Add Row Numbers',
    category: 'window',
    description: 'Add row numbers partitioned by group',
    language: 'sql',
    code: `SELECT
    *,
    ROW_NUMBER() OVER (PARTITION BY category ORDER BY date DESC) AS row_num
FROM input`,
    tags: ['window', 'row_number', 'ranking'],
  },
  {
    id: 'sql-running-total',
    name: 'Running Total',
    category: 'window',
    description: 'Calculate cumulative sum',
    language: 'sql',
    code: `SELECT
    *,
    SUM(amount) OVER (
        PARTITION BY category
        ORDER BY date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_total
FROM input`,
    tags: ['window', 'cumulative', 'sum'],
  },

  // Date Functions
  {
    id: 'sql-date-extract',
    name: 'Extract Date Parts',
    category: 'datetime',
    description: 'Extract year, month, day from dates',
    language: 'sql',
    code: `SELECT
    *,
    EXTRACT(YEAR FROM date_column) AS year,
    EXTRACT(MONTH FROM date_column) AS month,
    EXTRACT(DAY FROM date_column) AS day,
    DAYOFWEEK(date_column) AS day_of_week
FROM input`,
    tags: ['date', 'extract', 'datetime'],
  },

  // Conditional Logic
  {
    id: 'sql-case-when',
    name: 'Conditional Categories',
    category: 'logic',
    description: 'Create categories with CASE WHEN',
    language: 'sql',
    code: `SELECT
    *,
    CASE
        WHEN amount > 1000 THEN 'High'
        WHEN amount > 500 THEN 'Medium'
        ELSE 'Low'
    END AS category,
    CASE
        WHEN age >= 18 THEN 'Adult'
        ELSE 'Minor'
    END AS age_group
FROM input`,
    tags: ['case', 'conditional', 'categorization'],
  },

  // Text Functions
  {
    id: 'sql-string-operations',
    name: 'String Manipulation',
    category: 'text',
    description: 'Common string operations',
    language: 'sql',
    code: `SELECT
    UPPER(name) AS name_upper,
    LOWER(name) AS name_lower,
    TRIM(name) AS name_trimmed,
    CONCAT(first_name, ' ', last_name) AS full_name,
    LENGTH(description) AS desc_length,
    SUBSTRING(code, 1, 3) AS code_prefix
FROM input`,
    tags: ['string', 'text', 'concat', 'substring'],
  },

  // Filtering
  {
    id: 'sql-filter-null',
    name: 'Filter Nulls',
    category: 'filtering',
    description: 'Filter out null values',
    language: 'sql',
    code: `SELECT *
FROM input
WHERE column1 IS NOT NULL
  AND column2 IS NOT NULL
  AND TRIM(column3) != ''`,
    tags: ['filter', 'null', 'where'],
  },

  // Deduplication
  {
    id: 'sql-distinct',
    name: 'Remove Duplicates',
    category: 'cleaning',
    description: 'Get distinct rows',
    language: 'sql',
    code: `SELECT DISTINCT
    column1,
    column2,
    column3
FROM input`,
    tags: ['distinct', 'deduplication', 'unique'],
  },
  {
    id: 'sql-dedup-latest',
    name: 'Keep Latest Record',
    category: 'cleaning',
    description: 'Keep only the most recent record per group',
    language: 'sql',
    code: `WITH ranked AS (
    SELECT
        *,
        ROW_NUMBER() OVER (PARTITION BY id ORDER BY date DESC) AS rn
    FROM input
)
SELECT * EXCEPT(rn)
FROM ranked
WHERE rn = 1`,
    tags: ['deduplication', 'window', 'cte'],
  },
];

export const ALL_SNIPPETS = [...PYTHON_SNIPPETS, ...SQL_SNIPPETS];

export function getSnippetsByLanguage(language: 'python' | 'sql'): CodeSnippet[] {
  return ALL_SNIPPETS.filter(s => s.language === language);
}

export function getSnippetsByCategory(category: string): CodeSnippet[] {
  return ALL_SNIPPETS.filter(s => s.category === category);
}

export function searchSnippets(query: string, language?: 'python' | 'sql'): CodeSnippet[] {
  const lowerQuery = query.toLowerCase();
  let snippets = ALL_SNIPPETS;

  if (language) {
    snippets = snippets.filter(s => s.language === language);
  }

  return snippets.filter(s =>
    s.name.toLowerCase().includes(lowerQuery) ||
    s.description.toLowerCase().includes(lowerQuery) ||
    s.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export const SNIPPET_CATEGORIES = [
  { id: 'datetime', label: 'Date & Time', icon: '📅' },
  { id: 'text', label: 'Text Processing', icon: '📝' },
  { id: 'cleaning', label: 'Data Cleaning', icon: '🧹' },
  { id: 'numeric', label: 'Numeric Operations', icon: '🔢' },
  { id: 'aggregation', label: 'Aggregation', icon: '📊' },
  { id: 'window', label: 'Window Functions', icon: '🪟' },
  { id: 'logic', label: 'Conditional Logic', icon: '🔀' },
  { id: 'filtering', label: 'Filtering', icon: '🔍' },
  { id: 'conversion', label: 'Type Conversion', icon: '🔄' },
];
