type TableObject = Record<string, any>

/**
 * Extrai todos os valores de um objeto, incluindo objetos aninhados.
 * @param obj - O objeto de onde os valores serão extraídos.
 * @param values - O array onde os valores extraídos serão armazenados.
 */
function extractValues(obj: any, values: string[]): void {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        extractValues(obj[key], values)
      } else {
        values.push(obj[key])
      }
    }
  }
}

/**
 * Linka as tabelas baseando-se na tabela 1, substituindo os valores pelos da tabela 2.
 * @param baseTable - A tabela base que será atualizada.
 * @param updateTable - A tabela que contém os novos valores.
 * @returns Uma nova tabela com os valores atualizados.
 */
export function linkTables(baseTable: TableObject, updateTable: TableObject): TableObject {
  const updateTableValues: string[] = []
  
  // Extrai os valores da updateTable
  extractValues(updateTable, updateTableValues)

  // Insere os valores extraídos na baseTable
  let valueIndex = 0
  const baseTableKeys = Object.keys(baseTable)
  const updatedBaseTable: TableObject = {}

  for (const key of baseTableKeys) {
    if (valueIndex < updateTableValues.length) {
      updatedBaseTable[key] = updateTableValues[valueIndex]
      valueIndex++
    } else {
      updatedBaseTable[key] = baseTable[key]
    }
  }

  return updatedBaseTable
}
