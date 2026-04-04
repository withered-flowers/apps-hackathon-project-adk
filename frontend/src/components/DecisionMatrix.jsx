export default function DecisionMatrix({ matrixData }) {
  if (!matrixData || !matrixData.length) return null;

  // Assuming matrixData is an array of objects (rows) from the SQLite MCP
  const columns = Object.keys(matrixData[0] || {});

  return (
    <div className="mt-6 mb-4 w-full overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
      <div className="bg-indigo-50 px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-indigo-900">Decision Matrix (Evaluator)</h3>
      </div>
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th key={col} scope="col" className="px-6 py-3 border-b">
                {col.replace(/_/g, ' ')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrixData.map((row, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {columns.map((col) => (
                <td key={`${idx}-${col}`} className="px-6 py-4 border-b font-medium text-gray-900">
                  {row[col]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
