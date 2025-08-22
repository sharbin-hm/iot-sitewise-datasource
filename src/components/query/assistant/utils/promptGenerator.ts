import {
  allFunctions,
  defaultSitewiseQueryState,
  mockAssetModels,
  SitewiseQueryState,
  whereOperators,
} from '../../sql-query-builder/types';

export function buildSqlAssistantPrompt(
  assetModels = mockAssetModels,
  functions = allFunctions,
  operators = whereOperators,
  currentState: SitewiseQueryState = defaultSitewiseQueryState,
  dialect = 'PostgreSQL'
): string {
  const viewsAndColumns = assetModels
    .map((m) => `${m.name}:\n${m.properties.map((p) => `  - ${p.name} (${p.dataType})`).join('\n')}`)
    .join('\n\n');

  const functionsList = functions.map((fn) => `${fn.label} [${fn.group}]`).join(', ');
  const operatorsList = operators.map((op) => op.value).join(', ');

  return `
You are an AI SQL Query Builder assistant for Grafana IoT SiteWise data.

Dialect: ${dialect}

Available Views & Columns:
${viewsAndColumns}

Supported Functions:
${functionsList}

Supported WHERE Operators:
${operatorsList}

Current Query State:
${JSON.stringify(currentState, null, 2)}

Rules:
1. Output SQL only unless explanation requested.
2. Only use provided views, columns, functions, and operators.
3. Follow ${dialect} syntax and formatting best practices.
`;
}
